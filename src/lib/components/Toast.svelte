<script lang="ts">
  import { ui } from '$lib/stores/ui';

  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
</script>

<div class="toast-container">
  {#each $ui.notifications as notification (notification.id)}
    <div class="toast toast-{notification.type} animate-fade-in">
      <span class="toast-icon">{icons[notification.type]}</span>
      <span class="toast-message">{notification.message}</span>
      <button
        class="toast-close"
        onclick={() => ui.dismissNotification(notification.id)}
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 300;
    max-width: 400px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    background: var(--tn-bg-float);
    border: 1px solid var(--tn-border);
    box-shadow: var(--shadow-lg);
    font-size: 13px;
    color: var(--tn-fg);
    backdrop-filter: blur(10px);
  }

  .toast-success { border-left: 3px solid var(--tn-green); }
  .toast-error   { border-left: 3px solid var(--tn-red); }
  .toast-warning { border-left: 3px solid var(--tn-yellow); }
  .toast-info    { border-left: 3px solid var(--tn-blue); }

  .toast-icon { font-size: 16px; flex-shrink: 0; }
  .toast-message { flex: 1; }

  .toast-close {
    background: none;
    border: none;
    color: var(--tn-fg-muted);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color var(--transition-fast);
  }

  .toast-close:hover {
    color: var(--tn-fg);
  }
</style>
