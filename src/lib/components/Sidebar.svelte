<script lang="ts">
  import { emailStore } from '$lib/stores/emails';
  import { ui } from '$lib/stores/ui';
  import { auth } from '$lib/stores/auth';
  import { fetchEmails, fetchLabels } from '$lib/services/gmailService';
  import { logout } from '$lib/services/googleAuth';

  const systemLabels = [
    { id: 'INBOX',     name: 'Inbox',     icon: '📥' },
    { id: 'STARRED',   name: 'Starred',   icon: '⭐' },
    { id: 'IMPORTANT', name: 'Important', icon: '🏷️' },
    { id: 'SENT',      name: 'Sent',      icon: '📤' },
    { id: 'DRAFT',     name: 'Drafts',    icon: '📝' },
    { id: 'SPAM',      name: 'Spam',      icon: '🚫' },
    { id: 'TRASH',     name: 'Trash',     icon: '🗑️' },
    { id: 'UNREAD',    name: 'Unread',    icon: '🔵' },
  ];

  $: userLabels = $emailStore.labels.filter(l => l.type === 'user');
  let collapsed = false;

  async function selectLabel(labelId: string) {
    emailStore.setActiveLabel(labelId);
    await fetchEmails(labelId);
  }

  function getLabelCount(id: string): number {
    const label = $emailStore.labels.find(l => l.id === id);
    return label ? label.unreadCount : 0;
  }

  async function handleLogout() {
    await logout();
  }
</script>

<aside class="sidebar" class:collapsed>
  <div class="sidebar-header">
    <div class="brand">
      <span class="brand-icon">👻</span>
      {#if !collapsed}
        <span class="brand-name">GhostMail</span>
      {/if}
    </div>
    <button class="collapse-btn" onclick={() => collapsed = !collapsed} title="Toggle sidebar">
      {collapsed ? '→' : '←'}
    </button>
  </div>

  <nav class="nav-section">
    {#if !collapsed}
      <span class="nav-title">Mail</span>
    {/if}
    {#each systemLabels as label}
      {@const count = getLabelCount(label.id)}
      <button
        class="nav-item"
        class:active={$emailStore.activeLabel === label.id}
        onclick={() => selectLabel(label.id)}
        title={label.name}
      >
        <span class="nav-icon">{label.icon}</span>
        {#if !collapsed}
          <span class="nav-label">{label.name}</span>
          {#if count > 0}
            <span class="nav-badge">{count > 99 ? '99+' : count}</span>
          {/if}
        {/if}
      </button>
    {/each}
  </nav>

  {#if userLabels.length > 0 && !collapsed}
    <nav class="nav-section">
      <span class="nav-title">Labels</span>
      {#each userLabels as label}
        <button
          class="nav-item"
          class:active={$emailStore.activeLabel === label.id}
          onclick={() => selectLabel(label.id)}
        >
          <span class="nav-icon" style="color: {label.color || 'var(--tn-fg-muted)'}">●</span>
          <span class="nav-label">{label.name}</span>
          {#if label.unreadCount > 0}
            <span class="nav-badge">{label.unreadCount}</span>
          {/if}
        </button>
      {/each}
    </nav>
  {/if}

  <div class="sidebar-footer">
    {#if $auth.user}
      <div class="user-info" class:compact={collapsed}>
        <img
          src={$auth.user.picture}
          alt={$auth.user.name}
          class="user-avatar"
          referrerpolicy="no-referrer"
        />
        {#if !collapsed}
          <div class="user-details">
            <span class="user-name">{$auth.user.name}</span>
            <span class="user-email">{$auth.user.email}</span>
          </div>
        {/if}
      </div>
      <button class="logout-btn" onclick={handleLogout} title="Sign out">
        {collapsed ? '🚪' : 'Sign out'}
      </button>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 260px;
    min-width: 260px;
    height: 100vh;
    background: var(--tn-bg-dark);
    border-right: 1px solid var(--tn-border);
    transition: width var(--transition-base), min-width var(--transition-base);
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 64px;
    min-width: 64px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--tn-border);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    font-size: 24px;
  }

  .brand-name {
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--tn-blue), var(--tn-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
  }

  .collapse-btn {
    background: none;
    border: none;
    color: var(--tn-fg-muted);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    transition: all var(--transition-fast);
  }

  .collapse-btn:hover {
    background: var(--tn-bg-highlight);
    color: var(--tn-fg);
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    gap: 2px;
  }

  .nav-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--tn-fg-muted);
    padding: 4px 12px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: none;
    background: none;
    color: var(--tn-fg-dark);
    font-size: 14px;
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    white-space: nowrap;
    text-align: left;
    width: 100%;
  }

  .nav-item:hover {
    background: var(--tn-bg-highlight);
    color: var(--tn-fg);
  }

  .nav-item.active {
    background: var(--tn-selection);
    color: var(--tn-blue);
  }

  .nav-icon {
    font-size: 16px;
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }

  .nav-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--tn-blue);
    color: var(--tn-bg-darker);
    flex-shrink: 0;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 12px;
    border-top: 1px solid var(--tn-border);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: var(--radius-md);
    margin-bottom: 8px;
  }

  .user-info.compact {
    justify-content: center;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--tn-fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-email {
    font-size: 11px;
    color: var(--tn-fg-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout-btn {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-md);
    background: none;
    color: var(--tn-fg-muted);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .logout-btn:hover {
    background: rgba(247, 118, 142, 0.1);
    border-color: var(--tn-red);
    color: var(--tn-red);
  }
</style>
