<script lang="ts">
  import { filters, gmailQuery } from '$lib/stores/filters';
  import { emailStore } from '$lib/stores/emails';
  import { ui } from '$lib/stores/ui';
  import { fetchEmails } from '$lib/services/gmailService';

  let searchInput = '';
  let showAdvanced = false;
  let fromFilter = '';
  let readFilter: 'all' | 'read' | 'unread' = 'all';
  let hasAttachment = false;
  let sizeFilter = '';

  async function handleSearch() {
    filters.setQuery(searchInput);
    filters.setFrom(fromFilter);
    filters.setReadFilter(readFilter === 'all' ? null : readFilter === 'read');
    filters.setAttachmentFilter(hasAttachment || null);
    filters.setSizeFilter(sizeFilter ? parseInt(sizeFilter) * 1024 * 1024 : null); // MB to bytes

    const query = $gmailQuery;
    await fetchEmails($emailStore.activeLabel, query);
  }

  function clearSearch() {
    searchInput = '';
    fromFilter = '';
    readFilter = 'all';
    hasAttachment = false;
    sizeFilter = '';
    filters.reset();
    fetchEmails($emailStore.activeLabel);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') clearSearch();
  }

  // Quick filters
  const quickFilters = [
    { label: 'Unread', query: 'is:unread', icon: '🔵' },
    { label: 'Has attachments', query: 'has:attachment', icon: '📎' },
    { label: 'Older than 1 year', query: 'older_than:1y', icon: '📅' },
    { label: 'Large emails', query: 'larger:5M', icon: '📦' },
    { label: 'Newsletters', query: 'category:promotions', icon: '📰' },
    { label: 'Social', query: 'category:social', icon: '👥' },
  ];

  async function applyQuickFilter(query: string) {
    searchInput = query;
    filters.setQuery(query);
    await fetchEmails($emailStore.activeLabel, query);
  }
</script>

<div class="search-container">
  <div class="search-main">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        class="search-input"
        placeholder="Search emails... (Gmail syntax supported)"
        bind:value={searchInput}
        onkeydown={handleKeydown}
      />
      {#if searchInput}
        <button class="clear-btn" onclick={clearSearch}>✕</button>
      {/if}
    </div>

    <button class="search-btn" onclick={handleSearch}>Search</button>
    <button
      class="advanced-btn"
      class:active={showAdvanced}
      onclick={() => showAdvanced = !showAdvanced}
      title="Advanced filters"
    >
      ⚙️
    </button>
    <button
      class="bulk-btn"
      onclick={() => ui.toggleBulkPanel()}
      title="Bulk actions"
    >
      ⚡
    </button>
    <button
      class="apps-btn"
      onclick={() => ui.toggleAppLauncher()}
      title="Google Apps"
    >
      ▦
    </button>
  </div>

  {#if showAdvanced}
    <div class="advanced-filters animate-fade-in">
      <div class="filter-row">
        <div class="filter-group">
          <label>From</label>
          <input
            type="text"
            placeholder="sender@example.com"
            bind:value={fromFilter}
          />
        </div>

        <div class="filter-group">
          <label>Read status</label>
          <select bind:value={readFilter}>
            <option value="all">All</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Larger than (MB)</label>
          <input
            type="number"
            placeholder="5"
            bind:value={sizeFilter}
            min="0"
          />
        </div>

        <label class="checkbox-group">
          <input type="checkbox" bind:checked={hasAttachment} />
          <span>Has attachments</span>
        </label>
      </div>
    </div>
  {/if}

  <div class="quick-filters">
    {#each quickFilters as qf}
      <button
        class="quick-filter-chip"
        onclick={() => applyQuickFilter(qf.query)}
      >
        <span>{qf.icon}</span>
        <span>{qf.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .search-container {
    padding: 12px 16px;
    border-bottom: 1px solid var(--tn-border);
    background: var(--tn-bg-dark);
  }

  .search-main {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--tn-bg);
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-md);
    padding: 0 12px;
    transition: border-color var(--transition-fast);
  }

  .search-input-wrapper:focus-within {
    border-color: var(--tn-blue);
    box-shadow: 0 0 0 3px rgba(122, 162, 247, 0.1);
  }

  .search-icon {
    font-size: 14px;
    margin-right: 8px;
    opacity: 0.5;
  }

  .search-input {
    flex: 1;
    padding: 10px 0;
    border: none;
    background: none;
    color: var(--tn-fg);
    font-size: 14px;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--tn-fg-muted);
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--tn-fg-muted);
    cursor: pointer;
    padding: 4px;
    font-size: 12px;
    border-radius: 50%;
    transition: all var(--transition-fast);
  }

  .clear-btn:hover {
    background: var(--tn-bg-highlight);
    color: var(--tn-fg);
  }

  .search-btn, .advanced-btn, .bulk-btn, .apps-btn {
    padding: 10px 16px;
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-md);
    background: var(--tn-bg);
    color: var(--tn-fg-dark);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .search-btn {
    background: var(--tn-blue);
    border-color: var(--tn-blue);
    color: var(--tn-bg-darker);
    font-weight: 600;
  }

  .search-btn:hover {
    background: #8db0f9;
  }

  .advanced-btn:hover, .bulk-btn:hover, .apps-btn:hover {
    background: var(--tn-bg-highlight);
  }

  .advanced-btn.active {
    background: var(--tn-selection);
    border-color: var(--tn-blue);
  }

  .bulk-btn {
    color: var(--tn-orange);
  }

  .apps-btn {
    font-size: 18px;
    padding: 10px 12px;
  }

  /* Advanced filters */
  .advanced-filters {
    padding: 16px 0 8px;
  }

  .filter-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 150px;
  }

  .filter-group label {
    font-size: 11px;
    font-weight: 600;
    color: var(--tn-fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-group input,
  .filter-group select {
    padding: 8px 12px;
    background: var(--tn-bg);
    border: 1px solid var(--tn-border);
    border-radius: var(--radius-sm);
    color: var(--tn-fg);
    font-size: 13px;
    outline: none;
  }

  .filter-group input:focus,
  .filter-group select:focus {
    border-color: var(--tn-blue);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--tn-fg-dark);
    cursor: pointer;
    padding-bottom: 8px;
  }

  .checkbox-group input[type="checkbox"] {
    accent-color: var(--tn-blue);
  }

  /* Quick filters */
  .quick-filters {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .quick-filter-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border: 1px solid var(--tn-border);
    border-radius: 20px;
    background: none;
    color: var(--tn-fg-muted);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .quick-filter-chip:hover {
    background: var(--tn-bg-highlight);
    border-color: var(--tn-blue);
    color: var(--tn-blue);
  }
</style>
