<script lang="ts">
  import '$lib/themes/tokyonight.css';
  import { onMount } from 'svelte';
  import { tryRestoreSession } from '$lib/services/googleAuth';
  import { isAuthenticated, isAuthLoading } from '$lib/stores/auth';
  import { ui } from '$lib/stores/ui';
  import LoginScreen from '$lib/components/LoginScreen.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import AppLauncher from '$lib/components/AppLauncher.svelte';
  import BulkActions from '$lib/components/BulkActions.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  onMount(() => {
    tryRestoreSession();
  });

  let { children } = $props();
</script>

{#if $isAuthLoading}
  <div class="app-loading">
    <LoadingSpinner size={40} />
    <span>Loading GhostMail...</span>
  </div>
{:else if !$isAuthenticated}
  <LoginScreen />
{:else}
  <div class="app-layout">
    <Sidebar />
    <main class="app-main">
      {@render children()}
    </main>
  </div>

  {#if $ui.showAppLauncher}
    <AppLauncher />
  {/if}

  {#if $ui.showBulkPanel}
    <BulkActions />
  {/if}
{/if}

<Toast />

<style>
  .app-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 16px;
    color: var(--tn-fg-muted);
    font-size: 14px;
  }

  .app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }
</style>
