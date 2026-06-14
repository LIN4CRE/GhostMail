<script lang="ts">
  import { emailStore, selectedCount, hasSelection } from '$lib/stores/emails';
  import { ui } from '$lib/stores/ui';
  import {
    executeBulkAction,
    permanentlyDeleteEmails,
    searchAndSelectAll
  } from '$lib/services/gmailService';

  let confirmAction: string | null = null;
  let massDeleteQuery = '';
  let massDeleteCount = 0;
  let massDeleteIds: string[] = [];
  let isScanning = false;

  async function handleBulkAction(type: string) {
    const ids = [...$emailStore.selectedIds];
    if (ids.length === 0) {
      ui.notify('warning', 'No emails selected');
      return;
    }

    if (type === 'delete' || type === 'permanentDelete') {
      confirmAction = type;
      return;
    }

    await executeBulkAction({ type: type as any, emailIds: ids });
  }

  async function confirmDelete() {
    const ids = [...$emailStore.selectedIds];
    if (confirmAction === 'permanentDelete') {
      await permanentlyDeleteEmails(ids);
    } else {
      await executeBulkAction({ type: 'delete', emailIds: ids });
    }
    confirmAction = null;
  }

  async function scanForMassDelete() {
    if (!massDeleteQuery) {
      ui.notify('warning', 'Enter a search query first');
      return;
    }

    isScanning = true;
    try {
      massDeleteIds = await searchAndSelectAll(massDeleteQuery);
      massDeleteCount = massDeleteIds.length;
      ui.notify('info', `Found ${massDeleteCount} emails matching your query`);
    } catch (err) {
      ui.notify('error', `Scan failed: ${err}`);
    }
    isScanning = false;
  }

  async function executeMassDelete() {
    if (massDeleteIds.length === 0) return;
    confirmAction = null;

    await executeBulkAction({
      type: 'delete',
      emailIds: massDeleteIds
    });

    massDeleteIds = [];
    massDeleteCount = 0;
    massDeleteQuery = '';
  }

  const presetQueries = [
    { label: 'All promotions', query: 'category:promotions', icon: '📢', desc: 'Marketing & ads' },
    { label: 'All social', query: 'category:social', icon: '👥', desc: 'Social media notifications' },
    { label: 'Older than 6 months', query: 'older_than:6m', icon: '📅', desc: 'Old emails' },
    { label: 'Older than 1 year', query: 'older_than:1y', icon: '📅', desc: 'Very old emails' },
    { label: 'Older than 3 years', query: 'older_than:3y', icon: '📅', desc: 'Ancient emails' },
    { label: 'Large emails (10MB)', query: 'larger:10M', icon: '📦', desc: 'Space hogs' },
    { label: 'Read newsletters', query: 'is:read category:promotions older_than:30d', icon: '📰', desc: 'Already read promos' },
    { label: 'All read', query: 'is:read', icon: '✅', desc: "Emails you've seen" },
    { label: 'Unsubscribe emails', query: 'unsubscribe', icon: '🚪', desc: 'Contains unsubscribe' },
  ];
</script>

<div class="bulk-panel animate-slide-right">
  <div class="panel-header">
    <h2>⚡ Bulk Actions</h2>
    <button class="close-btn" onclick={() => ui.toggleBulkPanel()}>✕</button>
  </div>

  <!-- Quick actions on selection -->
  <div class="section">
    <h3>Selected ({$selectedCount})</h3>
    <div class="action-grid">
      <button class="action-btn delete" onclick={() => handleBulkAction('delete')} disabled={!$hasSelection}>
        <span>🗑️</span>
        <span>Trash</span>
      </button>
      <button class="action-btn archive" onclick={() => handleBulkAction('archive')} disabled={!$hasSelection}>
        <span>📦</span>
        <span>Archive</span>
      </button>
      <button class="action-btn read" onclick={() => handleBulkAction('markRead')} disabled={!$hasSelection}>
        <span>✅</span>
        <span>Mark Read</span>
      </button>
      <button class="action-btn unread" onclick={() => handleBulkAction('markUnread')} disabled={!$hasSelection}>
        <span>🔵</span>
        <span>Mark Unread</span>
      </button>
      <button class="action-btn permanent-delete" onclick={() => handleBulkAction('permanentDelete')} disabled={!$hasSelection}>
        <span>💀</span>
        <span>Permanent Delete</span>
      </button>
    </div>
  </div>

  <!-- Mass operations -->
  <div class="section">
    <h3>🔥 Mass Delete by Query</h3>
    <p class="section-desc">Delete ALL emails matching a search query — even thousands at once.</p>

    <div class="mass-input-row">
      <input
        type="text"
        placeholder="e.g. category:promotions older_than:6m"
        bind:value={massDeleteQuery}
        class="mass-input"
      />
      <button class="scan-btn" onclick={scanForMassDelete} disabled={isScanning}>
        {isScanning ? '...' : 'Scan'}
      </button>
    </div>

    {#if massDeleteCount > 0}
      <div class="mass-result animate-fade-in">
        <span class="mass-count">{massDeleteCount.toLocaleString()}</span>
        <span>emails found</span>
        <button class="mass-delete-btn" onclick={() => confirmAction = 'massDelete'}>
          Delete All {massDeleteCount.toLocaleString()}
        </button>
      </div>
    {/if}

    <div class="presets">
      <h4>Quick presets</h4>
      {#each presetQueries as preset}
        <button
          class="preset-btn"
          onclick={() => { massDeleteQuery = preset.query; scanForMassDelete(); }}
        >
          <span class="preset-icon">{preset.icon}</span>
          <div class="preset-info">
            <span class="preset-label">{preset.label}</span>
            <span class="preset-desc">{preset.desc}</span>
          </div>
          <span class="preset-arrow">→</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Confirmation dialog -->
  {#if confirmAction}
    <div class="confirm-overlay animate-fade-in">
      <div class="confirm-dialog glass">
        <span class="confirm-icon">⚠️</span>
        <h3>Are you sure?</h3>
        <p>
          {#if confirmAction === 'permanentDelete'}
            This will <strong>permanently delete</strong> {$selectedCount} email(s). This cannot be undone!
          {:else if confirmAction === 'massDelete'}
            This will move <strong>{massDeleteCount.toLocaleString()}</strong> emails to trash.
          {:else}
            This will move {$selectedCount} email(s) to trash.
          {/if}
        </p>
        <div class="confirm-actions">
          <button class="cancel-btn" onclick={() => confirmAction = null}>Cancel</button>
          <button
            class="confirm-btn"
            onclick={() => {
              if (confirmAction === 'massDelete') executeMassDelete();
              else confirmDelete();
            }}
          >
            {confirmAction === 'permanentDelete' ? 'Delete Forever' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .bulk-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 380px;
    background: var(--tn-bg-dark);
    border-left: 1px solid var(--tn-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    z-index: 100;
    box-shadow: var(--shadow-xl);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--tn-border);
    position: sticky;
    top: 0;
    background: var(--tn-bg-dark);
    z-index: 1;
  }

  .panel-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--tn-fg);
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--tn-fg-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--tn-bg-highlight);
    color: var(--tn-fg);
  }

  .section {
    padding: 20px;
    border-bottom: 1px solid var(--tn-border);
  }

  .section h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--tn-fg);
    margin-bottom: 8px;
  }

  .section-desc {
    font-size: 12px;
    color: var(--tn-fg-muted);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-md);
    background: var(--tn-bg);
    color: var(--tn-fg-dark);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-btn.delete:hover:not(:disabled) {
    border-color: var(--tn-red);
    background: rgba(247, 118, 142, 0.1);
  }

  .action-btn.archive:hover:not(:disabled) {
    border-color: var(--tn-blue);
    background: rgba(122, 162, 247, 0.1);
  }

  .action-btn.read:hover:not(:disabled) {
    border-color: var(--tn-green);
    background: rgba(158, 206, 106, 0.1);
  }

  .action-btn.permanent-delete {
    grid-column: 1 / -1;
    border-color: rgba(247, 118, 142, 0.3);
    color: var(--tn-red);
  }

  .action-btn.permanent-delete:hover:not(:disabled) {
    border-color: var(--tn-red);
    background: rgba(247, 118, 142, 0.15);
  }

  .action-btn span:first-child {
    font-size: 20px;
  }

  /* Mass delete */
  .mass-input-row {
    display: flex;
    gap: 8px;
  }

  .mass-input {
    flex: 1;
    padding: 10px 12px;
    background: var(--tn-bg);
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-sm);
    color: var(--tn-fg);
    font-size: 13px;
    outline: none;
  }

  .mass-input:focus {
    border-color: var(--tn-blue);
  }

  .scan-btn {
    padding: 10px 20px;
    background: var(--tn-blue);
    border: none;
    border-radius: var(--radius-sm);
    color: var(--tn-bg-darker);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .scan-btn:hover:not(:disabled) {
    background: #8db0f9;
  }

  .scan-btn:disabled {
    opacity: 0.6;
  }

  .mass-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    margin-top: 12px;
    background: rgba(247, 118, 142, 0.08);
    border: 1px solid rgba(247, 118, 142, 0.2);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--tn-fg-dark);
  }

  .mass-count {
    font-size: 20px;
    font-weight: 700;
    color: var(--tn-red);
  }

  .mass-delete-btn {
    margin-left: auto;
    padding: 6px 16px;
    background: var(--tn-red);
    border: none;
    border-radius: var(--radius-sm);
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mass-delete-btn:hover {
    background: #ff8fa3;
  }

  /* Presets */
  .presets {
    margin-top: 16px;
  }

  .presets h4 {
    font-size: 12px;
    font-weight: 600;
    color: var(--tn-fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .preset-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    color: var(--tn-fg-dark);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
    text-align: left;
  }

  .preset-btn:hover {
    background: var(--tn-bg-highlight);
  }

  .preset-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .preset-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .preset-label {
    font-size: 13px;
    font-weight: 500;
  }

  .preset-desc {
    font-size: 11px;
    color: var(--tn-fg-muted);
  }

  .preset-arrow {
    color: var(--tn-fg-muted);
    font-size: 14px;
  }

  /* Confirmation dialog */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .confirm-dialog {
    padding: 32px;
    border-radius: var(--radius-lg);
    max-width: 400px;
    text-align: center;
  }

  .confirm-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 12px;
  }

  .confirm-dialog h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--tn-fg);
    margin-bottom: 8px;
  }

  .confirm-dialog p {
    font-size: 14px;
    color: var(--tn-fg-dark);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .cancel-btn {
    padding: 10px 24px;
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-md);
    background: none;
    color: var(--tn-fg-dark);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cancel-btn:hover {
    background: var(--tn-bg-highlight);
  }

  .confirm-btn {
    padding: 10px 24px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--tn-red);
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .confirm-btn:hover {
    background: #ff8fa3;
  }
</style>
