<script lang="ts">
  import { emailStore, selectedCount, hasSelection, allSelected } from '$lib/stores/emails';
  import { ui } from '$lib/stores/ui';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import type { Email } from '$lib/types';

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else if (days < 365) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function selectEmail(email: Email) {
    emailStore.setActiveEmail(email);
  }

  function toggleSelectAll() {
    if ($allSelected) {
      emailStore.deselectAll();
    } else {
      emailStore.selectAll();
    }
  }

  // Quick select helpers
  function selectAllRead() {
    emailStore.selectByFilter(e => e.isRead);
  }

  function selectAllUnread() {
    emailStore.selectByFilter(e => !e.isRead);
  }
</script>

<div class="email-list-container">
  <!-- Selection toolbar -->
  <div class="list-toolbar">
    <label class="select-all">
      <input
        type="checkbox"
        checked={$allSelected}
        indeterminate={$hasSelection && !$allSelected}
        onchange={toggleSelectAll}
      />
      {#if $hasSelection}
        <span class="selected-count">{$selectedCount} selected</span>
      {:else}
        <span>Select all</span>
      {/if}
    </label>

    <div class="quick-select">
      <button onclick={selectAllRead}>Read</button>
      <button onclick={selectAllUnread}>Unread</button>
    </div>

    <span class="email-count">
      {$emailStore.emails.length} of ~{$emailStore.pagination.totalEstimate} emails
    </span>
  </div>

  <!-- Bulk progress bar -->
  {#if $emailStore.isBulkProcessing}
    <div class="bulk-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: {($emailStore.bulkProgress.current / $emailStore.bulkProgress.total) * 100}%"
        ></div>
      </div>
      <span class="progress-text">
        Processing {$emailStore.bulkProgress.current} / {$emailStore.bulkProgress.total}
      </span>
    </div>
  {/if}

  <!-- Email list -->
  <div class="email-list">
    {#if $emailStore.isLoading}
      <div class="loading-state">
        <LoadingSpinner size={32} />
        <span>Loading emails...</span>
      </div>
    {:else if $emailStore.emails.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No emails found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    {:else}
      {#each $emailStore.emails as email (email.id)}
        <button
          class="email-row"
          class:unread={!email.isRead}
          class:selected={$emailStore.selectedIds.has(email.id)}
          class:active={$emailStore.activeEmail?.id === email.id}
          onclick={() => selectEmail(email)}
        >
          <label class="email-checkbox" onclick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={$emailStore.selectedIds.has(email.id)}
              onchange={() => emailStore.toggleSelect(email.id)}
            />
          </label>

          <div class="email-star" class:starred={email.isStarred}>
            {email.isStarred ? '⭐' : '☆'}
          </div>

          <div class="email-content">
            <div class="email-top-row">
              <span class="email-from" class:unread={!email.isRead}>
                {email.from.name || email.from.email}
              </span>
              <div class="email-meta">
                {#if email.hasAttachments}
                  <span class="attachment-icon" title="Has attachments">📎</span>
                {/if}
                {#if email.isImportant}
                  <span class="important-icon" title="Important">🏷️</span>
                {/if}
                <span class="email-size">{formatSize(email.sizeEstimate)}</span>
                <span class="email-date">{formatDate(email.date)}</span>
              </div>
            </div>
            <div class="email-subject" class:unread={!email.isRead}>
              {email.subject}
            </div>
            <div class="email-snippet">{email.snippet}</div>
          </div>
        </button>
      {/each}

      <!-- Load more -->
      {#if $emailStore.pagination.nextPageToken}
        <button class="load-more-btn" onclick={() => {
          // Load next page logic would go here
        }}>
          Load more emails...
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .email-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 400px;
    border-right: 1px solid var(--tn-border);
  }

  .list-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--tn-border);
    background: var(--tn-bg-dark);
    font-size: 13px;
  }

  .select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--tn-fg-dark);
  }

  .select-all input {
    accent-color: var(--tn-blue);
  }

  .selected-count {
    color: var(--tn-blue);
    font-weight: 600;
  }

  .quick-select {
    display: flex;
    gap: 4px;
  }

  .quick-select button {
    padding: 3px 10px;
    border: 1px solid var(--tn-border);
    border-radius: 12px;
    background: none;
    color: var(--tn-fg-muted);
    font-size: 11px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .quick-select button:hover {
    background: var(--tn-bg-highlight);
    color: var(--tn-fg);
  }

  .email-count {
    margin-left: auto;
    color: var(--tn-fg-muted);
    font-size: 12px;
  }

  /* Bulk progress */
  .bulk-progress {
    padding: 8px 16px;
    background: var(--tn-bg-highlight);
    border-bottom: 1px solid var(--tn-border);
  }

  .progress-bar {
    height: 4px;
    background: var(--tn-bg);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--tn-blue), var(--tn-purple));
    border-radius: 2px;
    transition: width 200ms ease;
  }

  .progress-text {
    font-size: 11px;
    color: var(--tn-fg-muted);
  }

  /* Email list */
  .email-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .email-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    border-bottom: 1px solid rgba(59, 66, 97, 0.3);
    background: none;
    cursor: pointer;
    transition: background var(--transition-fast);
    width: 100%;
    text-align: left;
  }

  .email-row:hover {
    background: var(--tn-bg-highlight);
  }

  .email-row.active {
    background: var(--tn-selection);
    border-left: 3px solid var(--tn-blue);
  }

  .email-row.selected {
    background: rgba(122, 162, 247, 0.08);
  }

  .email-row.unread {
    background: rgba(122, 162, 247, 0.03);
  }

  .email-checkbox {
    padding-top: 2px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .email-checkbox input {
    accent-color: var(--tn-blue);
  }

  .email-star {
    padding-top: 2px;
    font-size: 14px;
    flex-shrink: 0;
    opacity: 0.3;
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }

  .email-star.starred,
  .email-star:hover {
    opacity: 1;
  }

  .email-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .email-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .email-from {
    font-size: 13px;
    color: var(--tn-fg-dark);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .email-from.unread {
    font-weight: 700;
    color: var(--tn-fg);
  }

  .email-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .attachment-icon, .important-icon {
    font-size: 12px;
  }

  .email-size {
    font-size: 11px;
    color: var(--tn-fg-muted);
  }

  .email-date {
    font-size: 12px;
    color: var(--tn-fg-muted);
    white-space: nowrap;
  }

  .email-subject {
    font-size: 13px;
    color: var(--tn-fg-dark);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .email-subject.unread {
    font-weight: 600;
    color: var(--tn-fg);
  }

  .email-snippet {
    font-size: 12px;
    color: var(--tn-fg-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* States */
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    gap: 12px;
    color: var(--tn-fg-muted);
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 16px;
    color: var(--tn-fg-dark);
  }

  .empty-state p {
    font-size: 13px;
  }

  .load-more-btn {
    width: 100%;
    padding: 16px;
    border: none;
    background: var(--tn-bg-highlight);
    color: var(--tn-blue);
    font-size: 14px;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .load-more-btn:hover {
    background: var(--tn-selection);
  }
</style>
