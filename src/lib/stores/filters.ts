import { writable, derived } from 'svelte/store';
import type { EmailFilter } from '$lib/types';

const defaultFilter: EmailFilter = {
  query: '',
  label: '',
  isRead: null,
  hasAttachment: null,
  from: '',
  dateAfter: null,
  dateBefore: null,
  sizeGreaterThan: null
};

function createFilterStore() {
  const { subscribe, set, update } = writable<EmailFilter>({ ...defaultFilter });

  return {
    subscribe,

    setQuery(query: string) {
      update(f => ({ ...f, query }));
    },

    setFrom(from: string) {
      update(f => ({ ...f, from }));
    },

    setReadFilter(isRead: boolean | null) {
      update(f => ({ ...f, isRead }));
    },

    setAttachmentFilter(hasAttachment: boolean | null) {
      update(f => ({ ...f, hasAttachment }));
    },

    setDateRange(after: Date | null, before: Date | null) {
      update(f => ({ ...f, dateAfter: after, dateBefore: before }));
    },

    setSizeFilter(bytes: number | null) {
      update(f => ({ ...f, sizeGreaterThan: bytes }));
    },

    reset() {
      set({ ...defaultFilter });
    }
  };
}

export const filters = createFilterStore();

/* Build Gmail search query from filters */
export const gmailQuery = derived(filters, $f => {
  const parts: string[] = [];

  if ($f.query) parts.push($f.query);
  if ($f.from) parts.push(`from:${$f.from}`);
  if ($f.isRead === true) parts.push('is:read');
  if ($f.isRead === false) parts.push('is:unread');
  if ($f.hasAttachment) parts.push('has:attachment');
  if ($f.label) parts.push(`label:${$f.label}`);

  if ($f.dateAfter) {
    const d = $f.dateAfter;
    parts.push(`after:${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`);
  }
  if ($f.dateBefore) {
    const d = $f.dateBefore;
    parts.push(`before:${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`);
  }
  if ($f.sizeGreaterThan) {
    parts.push(`larger:${$f.sizeGreaterThan}`);
  }

  return parts.join(' ');
});
