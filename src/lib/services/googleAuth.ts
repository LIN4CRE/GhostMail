import { invoke } from '@tauri-apps/api/core';
import { auth } from '$lib/stores/auth';
import type { GoogleUser } from '$lib/types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; // Loaded from .env file
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

export async function initiateLogin(): Promise<void> {
  try {
    auth.setLoading(true);
    auth.clearError();

    // Tauri backend starts local HTTP server, opens browser for OAuth
    const result = await invoke<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      email: string;
      name: string;
      picture: string;
    }>('google_oauth_login', {
      clientId: GOOGLE_CLIENT_ID,
      scopes: SCOPES
    });

    const user: GoogleUser = {
      email: result.email,
      name: result.name,
      picture: result.picture,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresAt: Date.now() + result.expires_in * 1000
    };

    // Store tokens securely in Tauri keychain
    await invoke('store_tokens', {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      expiresAt: user.expiresAt
    });

    auth.setUser(user);
  } catch (err) {
    auth.setError(err instanceof Error ? err.message : 'Login failed');
  }
}

export async function tryRestoreSession(): Promise<void> {
  try {
    auth.setLoading(true);

    const stored = await invoke<{
      access_token: string;
      refresh_token: string;
      expires_at: number;
      email: string;
      name: string;
      picture: string;
    } | null>('restore_session');

    if (stored) {
      // Check if token is expired, refresh if needed
      let accessToken = stored.access_token;
      let expiresAt = stored.expires_at;

      if (Date.now() >= stored.expires_at - 60000) {
        const refreshed = await invoke<{
          access_token: string;
          expires_in: number;
        }>('refresh_access_token', {
          clientId: GOOGLE_CLIENT_ID,
          refreshToken: stored.refresh_token
        });
        accessToken = refreshed.access_token;
        expiresAt = Date.now() + refreshed.expires_in * 1000;
      }

      auth.setUser({
        email: stored.email,
        name: stored.name,
        picture: stored.picture,
        accessToken,
        refreshToken: stored.refresh_token,
        expiresAt
      });
    } else {
      auth.setLoading(false);
    }
  } catch {
    auth.setLoading(false);
  }
}

export async function logout(): Promise<void> {
  await invoke('clear_tokens');
  auth.logout();
}

export async function getValidToken(): Promise<string> {
  return await invoke<string>('get_valid_access_token');
}
