<script lang="ts">
  import { initiateLogin } from '$lib/services/googleAuth';
  import { auth } from '$lib/stores/auth';
  import LoadingSpinner from './LoadingSpinner.svelte';

  let isLoggingIn = false;

  async function handleLogin() {
    isLoggingIn = true;
    await initiateLogin();
    isLoggingIn = false;
  }
</script>

<div class="login-container">
  <div class="login-card glass animate-fade-in">
    <div class="logo">
      <span class="logo-icon">👻</span>
      <h1 class="logo-text">GhostMail</h1>
    </div>

    <p class="tagline">Your email, decluttered.</p>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">🗑️</span>
        <span>Bulk delete thousands of emails</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🔍</span>
        <span>Smart filters to find what matters</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📱</span>
        <span>All Google apps in one place</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🚫</span>
        <span>No ads, no tracking, open source</span>
      </div>
    </div>

    {#if $auth.error}
      <div class="error-message animate-fade-in">
        <span>⚠️</span>
        <span>{$auth.error}</span>
      </div>
    {/if}

    <button
      class="login-button"
      onclick={handleLogin}
      disabled={isLoggingIn}
    >
      {#if isLoggingIn}
        <LoadingSpinner size={20} />
        <span>Signing in...</span>
      {:else}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Sign in with Google</span>
      {/if}
    </button>

    <p class="privacy-note">
      Your data stays on your device. We never see your emails.
    </p>
  </div>

  <div class="bg-decoration">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
  }

  .login-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px;
    border-radius: var(--radius-xl);
    max-width: 440px;
    width: 90%;
    position: relative;
    z-index: 10;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .logo-icon {
    font-size: 40px;
    filter: drop-shadow(0 0 10px rgba(122, 162, 247, 0.3));
  }

  .logo-text {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--tn-blue), var(--tn-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  .tagline {
    color: var(--tn-fg-muted);
    font-size: 16px;
    margin-bottom: 32px;
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    margin-bottom: 32px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    background: var(--tn-bg-highlight);
    font-size: 14px;
    color: var(--tn-fg-dark);
    transition: transform var(--transition-fast);
  }

  .feature:hover {
    transform: translateX(4px);
  }

  .feature-icon {
    font-size: 18px;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(247, 118, 142, 0.1);
    border: 1px solid rgba(247, 118, 142, 0.3);
    border-radius: var(--radius-md);
    color: var(--tn-red);
    font-size: 13px;
    width: 100%;
    margin-bottom: 16px;
  }

  .login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--tn-blue), var(--tn-purple));
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 15px rgba(122, 162, 247, 0.3);
  }

  .login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(122, 162, 247, 0.4);
  }

  .login-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-button:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .privacy-note {
    margin-top: 20px;
    font-size: 12px;
    color: var(--tn-fg-muted);
    text-align: center;
  }

  /* Background orbs */
  .bg-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    background: var(--tn-blue);
    top: -100px;
    right: -100px;
  }

  .orb-2 {
    width: 300px;
    height: 300px;
    background: var(--tn-purple);
    bottom: -50px;
    left: -50px;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
    background: var(--tn-teal);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
