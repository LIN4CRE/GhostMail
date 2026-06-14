import { writable, derived } from 'svelte/store';
import type { Email, LabelInfo, PaginationState, SortOrder } from '$lib/types';

function createEmailStore() {
  const { subscribe, set, update } = writable<{
    emails: Email[];
    selectedIds: Set<string>;
    activeEmail: Email | null;
    labels: LabelInfo[];
    activeLabel: string;
    isLoading: boolean;
    isBulkProcessing: boolean;
    bulkProgress: { current: number; total: number };
    pagination: PaginationState;
    sortOrder: SortOrder;
    searchQuery: string;
  }>({
    emails: [],
    selectedIds: new Set(),
    activeEmail: null,
    labels: [],
    activeLabel: 'INBOX',
    isLoading: false,
    isBulkProcessing: false,
    bulkProgress: { current: 0, total: 0 },
    pagination: {
      nextPageToken: null,
      previousPageTokens: [],
      currentPage: 1,
      totalEstimate: 0,
      pageSize: 50
    },
    sortOrder: 'newest',
    searchQuery: ''
  });

  return {
    subscribe,

    setEmails(emails: Email[], nextPageToken: string | null, totalEstimate: number) {
      update(s => ({
        ...s,
        emails,
        isLoading: false,
        pagination: {
          ...s.pagination,
          nextPageToken,
          totalEstimate
        }
      }));
    },

    appendEmails(emails: Email[], nextPageToken: string | null) {
      update(s => ({
        ...s,
        emails: [...s.emails, ...emails],
        isLoading: false,
        pagination: {
          ...s.pagination,
          nextPageToken
        }
      }));
    },

    setActiveEmail(email: Email | null) {
      update(s => ({ ...s, activeEmail: email }));
    },

    setLabels(labels: LabelInfo[]) {
      update(s => ({ ...s, labels }));
    },

    setActiveLabel(label: string) {
      update(s => ({
        ...s,
        activeLabel: label,
        selectedIds: new Set(),
        activeEmail: null,
        pagination: {
          ...s.pagination,
          currentPage: 1,
          previousPageTokens: [],
          nextPageToken: null
        }
      }));
    },

    toggleSelect(emailId: string) {
      update(s => {
        const newSelected = new Set(s.selectedIds);
        if (newSelected.has(emailId)) {
          newSelected.delete(emailId);
        } else {
          newSelected.add(emailId);
        }
        return { ...s, selectedIds: newSelected };
      });
    },

    selectAll() {
      update(s => ({
        ...s,
        selectedIds: new Set(s.emails.map(e => e.id))
      }));
    },

    deselectAll() {
      update(s => ({ ...s, selectedIds: new Set() }));
    },

    selectByFilter(predicate: (email: Email) => boolean) {
      update(s => ({
        ...s,
        selectedIds: new Set(s.emails.filter(predicate).map(e => e.id))
      }));
    },

    removeEmails(ids: string[]) {
      const idSet = new Set(ids);
      update(s => ({
        ...s,
        emails: s.emails.filter(e => !idSet.has(e.id)),
        selectedIds: new Set([...s.selectedIds].filter(id => !idSet.has(id))),
        activeEmail: s.activeEmail && idSet.has(s.activeEmail.id) ? null : s.activeEmail
      }));
    },

    setLoading(loading: boolean) {
      update(s => ({ ...s, isLoading: loading }));
    },

    setBulkProcessing(processing: boolean, total: number = 0) {
      update(s => ({
        ...s,
        isBulkProcessing: processing,
        bulkProgress: { current: 0, total }
      }));
    },

    updateBulkProgress(current: number) {
      update(s => ({
        ...s,
        bulkProgress: { ...s.bulkProgress, current }
      }));
    },

    setSearchQuery(query: string) {
      update(s => ({ ...s, searchQuery: query }));
    },

    setSortOrder(order: SortOrder) {
      update(s => ({ ...s, sortOrder: order }));
    },

    markAsRead(ids: string[]) {
      const idSet = new Set(ids);
      update(s => ({
        ...s,
        emails: s.emails.map(e =>
          idSet.has(e.id) ? { ...e, isRead: true } : e
        )
      }));
    },

    markAsUnread(ids: string[]) {
      const idSet = new Set(ids);
      update(s => ({
        ...s,
        emails: s.emails.map(e =>
          idSet.has(e.id) ? { ...e, isRead: false } : e
        )
      }));
    }
  };
}

export const emailStore = createEmailStore();

export const selectedCount = derived(emailStore, $s => $s.selectedIds.size);
export const hasSelection = derived(emailStore, $s => $s.selectedIds.size > 0);
export const allSelected = derived(emailStore, $s =>
  $s.emails.length > 0 && $s.selectedIds.size === $s.emails.length
);
export const unreadCount = derived(emailStore, $s =>
  $s.emails.filter(e => !e.isRead).length
);
