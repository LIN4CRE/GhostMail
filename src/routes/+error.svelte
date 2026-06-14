<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error-container animate-fade-in">
  <div class="error-card glass">
    <span class="error-icon">👻</span>
    <h1>{$page.status}: {$page.error?.message}</h1>
    <p>Something went wrong. Don't worry, your emails are safe.</p>
    <button class="home-btn" onclick={() => window.location.href = '/'}>
      Return Home
    </button>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: var(--tn-bg-darker);
    color: var(--tn-fg);
  }

  .error-card {
    padding: 48px;
    border-radius: var(--radius-xl);
    text-align: center;
    max-width: 500px;
  }

  .error-icon {
    font-size: 64px;
    display: block;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
    color: var(--tn-red);
  }

  p {
    color: var(--tn-fg-muted);
    margin-bottom: 32px;
  }

  .home-btn {
    padding: 12px 24px;
    background: var(--tn-blue);
    color: var(--tn-bg-darker);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .home-btn:hover {
    background: #8db0f9;
    transform: translateY(-2px);
  }
</style>
