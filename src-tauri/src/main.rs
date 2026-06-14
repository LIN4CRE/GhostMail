#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod google_auth;
mod gmail_api;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            google_auth::google_oauth_login,
            google_auth::store_tokens,
            google_auth::restore_session,
            google_auth::refresh_access_token,
            google_auth::get_valid_access_token,
            google_auth::clear_tokens,
        ])
        .run(tauri::generate_context!())
        .expect("error running GhostMail");
}
