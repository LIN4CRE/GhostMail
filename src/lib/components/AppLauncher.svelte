<script lang="ts">
  import { ui } from '$lib/stores/ui';
  import { googleApps } from '$lib/services/googleApps';
  import { open } from '@tauri-apps/plugin-shell';

  async function openApp(url: string) {
    await open(url);
    ui.closeAppLauncher();
  }

  function handleBackdropClick() {
    ui.closeAppLauncher();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="launcher-backdrop" onclick={handleBackdropClick}>
  <div class="launcher-panel glass animate-fade-in" onclick={(e) => e.stopPropagation()}>
    <h2 class="launcher-title">Google Apps</h2>
    <div class="apps-grid">
      {#each googleApps as app}
        <button
          class="app-tile"
          onclick={() => openApp(app.url)}
          title={app.description}
        >
          <span class="app-icon" style="--app-color: {app.color}">{app.icon}</span>
          <span class="app-name">{app.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .launcher-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 60px 20px;
    z-index: 150;
  }

  .launcher-panel {
    width: 360px;
    padding: 24px;
    border-radius: var(--radius-lg);
    max-height: 80vh;
    overflow-y: auto;
  }

  .launcher-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--tn-fg);
    margin-bottom: 20px;
    text-align: center;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .app-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .app-tile:hover {
    background: var(--tn-bg-highlight);
    transform: scale(1.05);
  }

  .app-icon {
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .app-name {
    font-size: 11px;
    color: var(--tn-fg-dark);
    text-align: center;
    white-space: nowrap;
  }
</style>
