<script lang="ts">
  import { emailStore } from '$lib/stores/emails';
  import { executeBulkAction } from '$lib/services/gmailService';
  import { ui } from '$lib/stores/ui';

  $: email = $emailStore.activeEmail;

  function formatFullDate(date: Date): string {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async function trashEmail() {
    if (!email) return;
    await executeBulkAction({ type: 'delete', emailIds: [email.id] });
    ui.notify('success', 'Moved to trash');
  }

  async function archiveEmail() {
    if (!email) return;
    await executeBulkAction({ type: 'archive', emailIds: [email.id] });
    ui.notify('success', 'Archived');
  }

  async function toggleRead() {
    if (!email) return;
    const type = email.isRead ? 'markUnread' : 'markRead';
    await executeBulkAction({ type, emailIds: [email.id] });
  }

  function close() {
    emailStore.setActiveEmail(null);
  }
</script>

<div class="email-view">
  {#if email}
    <div class="view-toolbar">
      <button class="back-btn" onclick={close}>← Back</button>
      <div class="toolbar-actions">
        <button onclick={archiveEmail} title="Archive">📦</button>
        <button onclick={trashEmail} title="Delete">🗑️</button>
        <button onclick={toggleRead} title={email.isRead ? 'Mark unread' : 'Mark read'}>
          {email.isRead ? '🔵' : '✅'}
        </button>
      </div>
    </div>

    <div class="view-content animate-fade-in">
      <h1 class="email-subject">{email.subject}</h1>

      <div class="email-header">
        <div class="sender-info">
          <div class="sender-avatar">
            {email.from.name.charAt(0).toUpperCase() || ''}
          </div>
          <div class="sender-details">
            <span class="sender-name">{email.from.name}</span>
            <span class="sender-email">&lt;{email.from.email}&gt;</span>
          </div>
        </div>
        <div class="email-date">{formatFullDate(email.date)}</div>
      </div>

      {#if email.to.length > 0}
        <div class="recipients">
          <span class="to-label">To:</span>
          {#each email.to as recipient}
            <span class="recipient">{recipient.name || recipient.email}</span>
          {/each}
        </div>
      {/if}

      {#if email.labels.length > 0}
        <div class="label-tags">
          {#each email.labels.filter(l => !['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL'].includes(l)) as label}
            <span class="label-tag">{label.replace('CATEGORY_', '').toLowerCase()}</span>
          {/each}
        </div>
      {/if}

      {#if email.hasAttachments}
        <div class="attachments">
          <h4>📎 Attachments ({email.attachments.length})</h4>
          <div class="attachment-list">
            {#each email.attachments as att}
              <div class="attachment-item">
                <span class="att-icon">📄</span>
                <span class="att-name">{att.filename}</span>
                <span class="att-size">{(att.size / 1024).toFixed(0)} KB</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="email-body">
        {#if email.bodyHtml}
          <iframe
            srcdoc={email.bodyHtml}
            class="body-iframe"
            sandbox=""
            title="Email content"
          ></iframe>
        {:else}
          <pre class="body-text">{email.body || email.snippet}</pre>
        {/if}
      </div>
    </div>
  {:else}
    <div class="no-email">
      <span class="no-email-icon">📧</span>
      <h3>Select an email to read</h3>
      <p>Click on any email in the list to view it here</p>
    </div>
  {/if}
</div>

<style>
  .email-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
  }

  .view-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--tn-border);
    background: var(--tn-bg-dark);
    flex-shrink: 0;
  }

  .back-btn {
    padding: 6px 12px;
    border: none;
    background: none;
    color: var(--tn-blue);
    font-size: 13px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
  }

  .back-btn:hover {
    background: var(--tn-bg-highlight);
  }

  .toolbar-actions {
    display: flex;
    gap: 4px;
  }

  .toolbar-actions button {
    padding: 6px 10px;
    border: 1px solid var(--tn-border);
    background: none;
    border-radius: var(--radius-sm);
    font-size: 16px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .toolbar-actions button:hover {
    background: var(--tn-bg-highlight);
  }

  .view-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .email-subject {
    font-size: 22px;
    font-weight: 700;
    color: var(--tn-fg);
    line-height: 1.3;
    margin-bottom: 20px;
  }

  .email-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .sender-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sender-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--tn-blue), var(--tn-purple));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
  }

  .sender-details {
    display: flex;
    flex-direction: column;
  }

  .sender-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--tn-fg);
  }

  .sender-email {
    font-size: 12px;
    color: var(--tn-fg-muted);
  }

  .email-date {
    font-size: 12px;
    color: var(--tn-fg-muted);
  }

  .recipients {
    font-size: 12px;
    color: var(--tn-fg-muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .to-label {
    font-weight: 600;
  }

  .recipient {
    padding: 2px 8px;
    background: var(--tn-bg-highlight);
    border-radius: 10px;
    font-size: 11px;
  }

  .label-tags {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .label-tag {
    padding: 3px 10px;
    background: var(--tn-selection);
    border-radius: 10px;
    font-size: 11px;
    color: var(--tn-blue);
    text-transform: capitalize;
  }

  .attachments {
    margin-bottom: 20px;
    padding: 12px;
    background: var(--tn-bg-highlight);
    border-radius: var(--radius-md);
  }

  .attachments h4 {
    font-size: 13px;
    margin-bottom: 8px;
    color: var(--tn-fg-dark);
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--tn-bg);
    border-radius: var(--radius-sm);
    font-size: 12px;
  }

  .att-name {
    flex: 1;
    color: var(--tn-fg-dark);
  }

  .att-size {
    color: var(--tn-fg-muted);
    font-size: 11px;
  }

  .email-body {
    margin-top: 20px;
    border-top: 1px solid var(--tn-border);
    padding-top: 20px;
  }

  .body-iframe {
    width: 100%;
    min-height: 400px;
    height: 60vh;
    border: none;
    border-radius: var(--radius-md);
    background: white;
  }

  .body-text {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: var(--tn-fg-dark);
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .no-email {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--tn-fg-muted);
  }

  .no-email-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  .no-email h3 {
    font-size: 16px;
    color: var(--tn-fg-dark);
  }

  .no-email p {
    font-size: 13px;
  }
</style>
