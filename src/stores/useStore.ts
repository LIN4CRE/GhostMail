import { create } from 'zustand';
import type { Email, LabelInfo, AppNotification, ViewMode, GoogleApp } from '../types';
import { generateMockEmails } from '../data/mockEmails';
import { googleApps } from '../data/googleApps';

interface AppStore {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string; name: string; picture: string } | null;
  error: string | null;
  login: () => void;
  logout: () => void;

  // Email
  emails: Email[];
  selectedIds: Set<string>;
  activeEmail: Email | null;
  labels: LabelInfo[];
  activeLabel: string;
  isBulkProcessing: boolean;
  bulkProgress: { current: number; total: number };
  searchQuery: string;
  sortOrder: 'newest' | 'oldest' | 'sender' | 'subject';
  setEmails: (emails: Email[]) => void;
  setActiveEmail: (email: Email | null) => void;
  toggleSelect: (emailId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectByFilter: (predicate: (email: Email) => boolean) => void;
  removeEmails: (ids: string[]) => void;
  markAsRead: (ids: string[]) => void;
  markAsUnread: (ids: string[]) => void;
  toggleStar: (id: string) => void;
  setActiveLabel: (label: string) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: 'newest' | 'oldest' | 'sender' | 'subject') => void;
  setBulkProcessing: (processing: boolean, total?: number) => void;
  updateBulkProgress: (current: number) => void;
  refreshEmails: () => void;

  // UI
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  showAppLauncher: boolean;
  notifications: AppNotification[];
  showBulkPanel: boolean;
  currentView: 'inbox' | 'bulk' | 'apps' | 'dashboard';
  showEmailView: boolean;
  showCompose: boolean;
  showCommandPalette: boolean;
  showSettings: boolean;
  showOnboarding: boolean;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleAppLauncher: () => void;
  closeAppLauncher: () => void;
  toggleBulkPanel: () => void;
  setCurrentView: (view: 'inbox' | 'bulk' | 'apps' | 'dashboard') => void;
  setShowEmailView: (show: boolean) => void;
  setShowCompose: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  notify: (type: AppNotification['type'], message: string) => void;
  dismissNotification: (id: string) => void;

  // Data
  googleApps: GoogleApp[];
}

const defaultLabels: LabelInfo[] = [
  { id: 'INBOX', name: 'Inbox', type: 'system', color: '', unreadCount: 12, totalCount: 847, icon: '📥' },
  { id: 'STARRED', name: 'Starred', type: 'system', color: '', unreadCount: 0, totalCount: 23, icon: '⭐' },
  { id: 'SENT', name: 'Sent', type: 'system', color: '', unreadCount: 0, totalCount: 234, icon: '📤' },
  { id: 'DRAFT', name: 'Drafts', type: 'system', color: '', unreadCount: 0, totalCount: 5, icon: '📝' },
  { id: 'SPAM', name: 'Spam', type: 'system', color: '', unreadCount: 42, totalCount: 42, icon: '⚠️' },
  { id: 'TRASH', name: 'Trash', type: 'system', color: '', unreadCount: 0, totalCount: 156, icon: '🗑️' },
  { id: 'IMPORTANT', name: 'Important', type: 'system', color: '', unreadCount: 3, totalCount: 89, icon: '🏷️' },
  { id: 'newsletters', name: 'Newsletters', type: 'user', color: '#bb9af7', unreadCount: 8, totalCount: 45, icon: '📰' },
  { id: 'work', name: 'Work', type: 'user', color: '#7aa2f7', unreadCount: 5, totalCount: 120, icon: '💼' },
  { id: 'personal', name: 'Personal', type: 'user', color: '#9ece6a', unreadCount: 2, totalCount: 67, icon: '👤' },
];

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  login: () => {
    set({ isLoading: true });
    setTimeout(() => {
      const emails = generateMockEmails(60);
      set({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'ghost@ghostmail.dev', name: 'Ghost User', picture: '' },
        emails,
        showOnboarding: true,
      });
    }, 1800);
  },

  logout: () => {
    set({
      isAuthenticated: false, user: null, emails: [], selectedIds: new Set(),
      activeEmail: null, currentView: 'inbox', showEmailView: false,
    });
  },

  // Email
  emails: [],
  selectedIds: new Set<string>(),
  activeEmail: null,
  labels: defaultLabels,
  activeLabel: 'INBOX',
  isBulkProcessing: false,
  bulkProgress: { current: 0, total: 0 },
  searchQuery: '',
  sortOrder: 'newest',

  setEmails: (emails) => set({ emails }),
  setActiveEmail: (email) => {
    if (email && !email.isRead) {
      set({
        activeEmail: email,
        showEmailView: true,
        emails: get().emails.map(e => e.id === email.id ? { ...e, isRead: true } : e),
      });
    } else {
      set({ activeEmail: email, showEmailView: !!email });
    }
  },

  toggleSelect: (emailId) => {
    const s = new Set(get().selectedIds);
    s.has(emailId) ? s.delete(emailId) : s.add(emailId);
    set({ selectedIds: s });
  },
  selectAll: () => set({ selectedIds: new Set(get().emails.map(e => e.id)) }),
  deselectAll: () => set({ selectedIds: new Set() }),
  selectByFilter: (p) => set({ selectedIds: new Set(get().emails.filter(p).map(e => e.id)) }),

  removeEmails: (ids) => {
    const s = new Set(ids);
    const { emails, selectedIds, activeEmail } = get();
    set({
      emails: emails.filter(e => !s.has(e.id)),
      selectedIds: new Set([...selectedIds].filter(id => !s.has(id))),
      activeEmail: activeEmail && s.has(activeEmail.id) ? null : activeEmail,
      showEmailView: activeEmail && s.has(activeEmail.id) ? false : get().showEmailView,
    });
  },

  markAsRead: (ids) => {
    const s = new Set(ids);
    set({ emails: get().emails.map(e => s.has(e.id) ? { ...e, isRead: true } : e) });
  },
  markAsUnread: (ids) => {
    const s = new Set(ids);
    set({ emails: get().emails.map(e => s.has(e.id) ? { ...e, isRead: false } : e) });
  },
  toggleStar: (id) => set({ emails: get().emails.map(e => e.id === id ? { ...e, isStarred: !e.isStarred } : e) }),

  setActiveLabel: (label) => {
    set({ activeLabel: label, selectedIds: new Set(), activeEmail: null, showEmailView: false, searchQuery: '' });
    setTimeout(() => set({ emails: generateMockEmails(25 + Math.floor(Math.random() * 35)) }), 250);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortOrder: (order) => {
    const sorted = [...get().emails];
    if (order === 'newest') sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    else if (order === 'oldest') sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
    else if (order === 'sender') sorted.sort((a, b) => a.from.name.localeCompare(b.from.name));
    else sorted.sort((a, b) => a.subject.localeCompare(b.subject));
    set({ sortOrder: order, emails: sorted });
  },

  setBulkProcessing: (p, t = 0) => set({ isBulkProcessing: p, bulkProgress: { current: 0, total: t } }),
  updateBulkProgress: (c) => set({ bulkProgress: { ...get().bulkProgress, current: c } }),

  refreshEmails: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ emails: generateMockEmails(40 + Math.floor(Math.random() * 20)), isLoading: false });
      get().notify('success', 'Inbox refreshed');
    }, 800);
  },

  // UI
  sidebarCollapsed: false,
  viewMode: 'comfortable',
  showAppLauncher: false,
  notifications: [],
  showBulkPanel: false,
  currentView: 'inbox',
  showEmailView: false,
  showCompose: false,
  showCommandPalette: false,
  showSettings: false,
  showOnboarding: false,

  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setViewMode: (m) => set({ viewMode: m }),
  toggleAppLauncher: () => set({ showAppLauncher: !get().showAppLauncher }),
  closeAppLauncher: () => set({ showAppLauncher: false }),
  toggleBulkPanel: () => set({ showBulkPanel: !get().showBulkPanel }),
  setCurrentView: (v) => set({ currentView: v, showEmailView: false, activeEmail: null }),
  setShowEmailView: (s) => set({ showEmailView: s }),
  setShowCompose: (s) => set({ showCompose: s }),
  setShowCommandPalette: (s) => set({ showCommandPalette: s }),
  setShowSettings: (s) => set({ showSettings: s }),
  setShowOnboarding: (s) => set({ showOnboarding: s }),

  notify: (type, message) => {
    const id = crypto.randomUUID();
    set({ notifications: [...get().notifications, { id, type, message, duration: 4000 }] });
    setTimeout(() => set({ notifications: get().notifications.filter(n => n.id !== id) }), 4000);
  },
  dismissNotification: (id) => set({ notifications: get().notifications.filter(n => n.id !== id) }),

  googleApps,
}));
