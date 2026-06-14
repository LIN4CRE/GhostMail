use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: u64,
    pub email: String,
    pub name: String,
    pub picture: String,
}

fn generate_pkce() -> (String, String) {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let verifier: String = (0..128)
        .map(|_| {
            let idx = rng.gen_range(0..62);
            let c = if idx < 26 {
                (b'A' + idx) as char
            } else if idx < 52 {
                (b'a' + idx - 26) as char
            } else {
                (b'0' + idx - 52) as char
            };
            c
        })
        .collect();

    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    let challenge = URL_SAFE_NO_PAD.encode(hasher.finalize());

    (verifier, challenge)
}

#[tauri::command]
pub async fn google_oauth_login(
    client_id: String,
    scopes: String,
) -> Result<AuthTokens, String> {
    let (verifier, challenge) = generate_pkce();

    // Start local HTTP server for redirect
    let server = tiny_http::Server::http("127.0.0.1:0")
        .map_err(|e| format!("Failed to start redirect server: {}", e))?;

    let port = server.server_addr().to_ip().unwrap().port();
    let redirect_uri = format!("http://127.0.0.1:{}", port);

    // Build auth URL
    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope={}&code_challenge={}&code_challenge_method=S256&access_type=offline&prompt=consent",
        urlencoding::encode(&client_id),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(&scopes),
        urlencoding::encode(&challenge),
    );

    // Open browser
    open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    // Wait for redirect with auth code
    let request = server.recv().map_err(|e| format!("Failed to receive redirect: {}", e))?;
    let url = request.url().to_string();
    let parsed = url::Url::parse(&format!("http://localhost{}", url))
        .map_err(|e| format!("Failed to parse redirect URL: {}", e))?;

    let code = parsed
        .query_pairs()
        .find(|(k, _)| k == "code")
        .map(|(_, v)| v.to_string())
        .ok_or_else(|| "No auth code in redirect".to_string())?;

    // Send success page
    let response = tiny_http::Response::from_string(
        "<html><body style='background:#1a1b26;color:#c0caf5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;'> \
        <div style='text-align:center'><h1>✅ Signed in!</h1><p>You can close this tab and return to GhostMail.</p></div></body></html>"
    )
    .with_header(
        tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html"[..]).unwrap(),
    );
    let _ = request.respond(response);

    // Exchange code for tokens
    let client = reqwest::Client::new();
    let token_response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", client_id.as_str()),
            ("code", code.as_str()),
            ("code_verifier", verifier.as_str()),
            ("grant_type", "authorization_code"),
            ("redirect_uri", redirect_uri.as_str()),
        ])
        .send()
        .await
        .map_err(|e| format!("Token exchange failed: {}", e))?;

    #[derive(Deserialize)]
    struct TokenResponse {
        access_token: String,
        refresh_token: Option<String>,
        expires_in: u64,
    }

    let tokens: TokenResponse = token_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;

    // Get user info
    let user_info = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(&tokens.access_token)
        .send()
        .await
        .map_err(|e| format!("Failed to get user info: {}", e))?;

    #[derive(Deserialize)]
    struct UserInfo {
        email: String,
        name: String,
        picture: String,
    }

    let user: UserInfo = user_info
        .json()
        .await
        .map_err(|e| format!("Failed to parse user info: {}", e))?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    Ok(AuthTokens {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token.unwrap_or_default(),
        expires_at: now + tokens.expires_in * 1000,
        email: user.email,
        name: user.name,
        picture: user.picture,
    })
}

#[tauri::command]
pub async fn store_tokens(
    access_token: String,
    refresh_token: String,
    expires_at: u64,
) -> Result<(), String> {
    // Store in OS keychain
    let entry = keyring::Entry::new("ghostmail", "tokens")
        .map_err(|e| format!("Keyring error: {}", e))?;

    let data = serde_json::json!({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
    });

    entry
        .set_password(&data.to_string())
        .map_err(|e| format!("Failed to store tokens: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn restore_session() -> Result<Option<AuthTokens>, String> {
    let entry = keyring::Entry::new("ghostmail", "tokens")
        .map_err(|e| format!("Keyring error: {}", e))?;

    match entry.get_password() {
        Ok(data) => {
            let stored: serde_json::Value = serde_json::from_str(&data)
                .map_err(|e| format!("Failed to parse stored tokens: {}", e))?;

            let access_token = stored["access_token"].as_str().unwrap_or("").to_string();
            let refresh_token = stored["refresh_token"].as_str().unwrap_or("").to_string();
            let expires_at = stored["expires_at"].as_u64().unwrap_or(0);

            if refresh_token.is_empty() {
                return Ok(None);
            }

            // Get fresh user info
            let client = reqwest::Client::new();
            let user_info = client
                .get("https://www.googleapis.com/oauth2/v2/userinfo")
                .bearer_auth(&access_token)
                .send()
                .await;

            match user_info {
                Ok(resp) if resp.status().is_success() => {
                    #[derive(Deserialize)]
                    struct UserInfo {
                        email: String,
                        name: String,
                        picture: String,
                    }
                    let user: UserInfo = resp.json().await.map_err(|e| e.to_string())?;
                    Ok(Some(AuthTokens {
                        access_token,
                        refresh_token,
                        expires_at,
                        email: user.email,
                        name: user.name,
                        picture: user.picture,
                    }))
                }
                _ => Ok(Some(AuthTokens {
                    access_token,
                    refresh_token,
                    expires_at,
                    email: String::new(),
                    name: String::new(),
                    picture: String::new(),
                })),
            }
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn refresh_access_token(
    refresh_token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh_token.as_str()),
        ])
        .send()
        .await
        .map_err(|e| format!("Refresh failed: {}", e))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "access_token": body["access_token"],
        "expires_in": body["expires_in"]
    }))
}

#[tauri::command]
pub async fn get_valid_access_token() -> Result<String, String> {
    let entry = keyring::Entry::new("ghostmail", "tokens")
        .map_err(|e| format!("Keyring error: {}", e))?;

    let data = entry
        .get_password()
        .map_err(|_| "No stored session".to_string())?;

    let stored: serde_json::Value =
        serde_json::from_str(&data).map_err(|e| e.to_string())?;

    let access_token = stored["access_token"]
        .as_str()
        .unwrap_or("")
        .to_string();

    Ok(access_token)
}

#[tauri::command]
pub async fn clear_tokens() -> Result<(), String> {
    let entry = keyring::Entry::new("ghostmail", "tokens")
        .map_err(|e| format!("Keyring error: {}", e))?;

    let _ = entry.delete_credential();
    Ok(())
}
