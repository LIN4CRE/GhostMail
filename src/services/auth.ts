// Google OAuth 2.0 — Token (implicit) flow for client-side SPA
// No client secret needed. Works entirely in-browser.

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// This is a public client ID — safe to embed in frontend code
// Users will need to replace this with their own from Google Cloud Console
const DEFAULT_CLIENT_ID = '';

function getClientId(): string {
  // Check for user-provided client ID in localStorage
  return localStorage.getItem('ghostmail_client_id') || DEFAULT_CLIENT_ID;
}

export function setClientId(id: string) {
  localStorage.setItem('ghostmail_client_id', id);
}

export function getStoredClientId(): string {
  return localStorage.getItem('ghostmail_client_id') || '';
}

export function hasClientId(): boolean {
  return !!getClientId();
}

function getRedirectUri(): string {
  return window.location.origin + window.location.pathname;
}

export function initiateGoogleLogin() {
  const clientId = getClientId();
  if (!clientId) throw new Error('No Google Client ID configured');

  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'token',
    scope: SCOPES,
    state,
    prompt: 'consent',
    access_type: 'online',
    include_granted_scopes: 'true',
  });

  window.location.href = `${AUTH_URL}?${params}`;
}

export interface OAuthResult {
  accessToken: string;
  expiresIn: number;
}

export function parseOAuthCallback(): OAuthResult | null {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const expiresIn = parseInt(params.get('expires_in') || '3600');
  const state = params.get('state');

  // Verify state
  const storedState = sessionStorage.getItem('oauth_state');
  if (state && storedState && state !== storedState) {
    console.error('OAuth state mismatch');
    return null;
  }
  sessionStorage.removeItem('oauth_state');

  if (!accessToken) return null;

  // Clean URL
  window.history.replaceState(null, '', window.location.pathname);

  // Store token
  localStorage.setItem('ghostmail_token', accessToken);
  localStorage.setItem('ghostmail_token_expiry', String(Date.now() + expiresIn * 1000));

  return { accessToken, expiresIn };
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem('ghostmail_token');
  const expiry = localStorage.getItem('ghostmail_token_expiry');
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry)) {
    clearStoredToken();
    return null;
  }
  return token;
}

export function clearStoredToken() {
  localStorage.removeItem('ghostmail_token');
  localStorage.removeItem('ghostmail_token_expiry');
}
