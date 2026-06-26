import { create } from 'zustand';
import type { Email, LabelInfo, AppNotification, ViewMode, GoogleApp } from '../types';
import { generateMockEmails } from '../data/mockEmails';
import { googleApps } from '../data/googleApps';
import * as gmail from '../services/gmail';
import * as auth from '../services/auth';

interface AppStore {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  isLiveMode: boolean;
  user: { email: string; name: string; picture: string } | null;
  error: string | null;
  loginWithGoogle: () => void;
  loginDemo: () => void;
  restoreSession: () => Promise<void>;
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
  sendEmail: (to: string, subject: string, body: string, cc?: string, bcc?: string) => Promise<void>;

  // UI
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  showAppLauncher: boolean;
  notifications: AppNotification[];
  currentView: 'inbox' | 'bulk' | 'apps' | 'dashboard';
  showEmailView: boolean;
  showCompose: boolean;
  showCommandPalette: boolean;
  showSettings: boolean;
  showOnboarding: boolean;
  showLabelManager: boolean;
  selectedTheme: string;
  emailFontSize: number;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleAppLauncher: () => void;
  closeAppLauncher: () => void;
  setCurrentView: (view: 'inbox' | 'bulk' | 'apps' | 'dashboard') => void;
  setShowEmailView: (show: boolean) => void;
  setShowCompose: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowLabelManager: (show: boolean) => void;
  setSelectedTheme: (theme: string) => void;
  setEmailFontSize: (size: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  createLabel: (name: string, color: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  notify: (type: AppNotification['type'], message: string) => void;
  dismissNotification: (id: string) => void;
  googleApps: GoogleApp[];
}

const defaultLabels: LabelInfo[] = [
  { id: 'INBOX', name: 'Inbox', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '📥' },
  { id: 'STARRED', name: 'Starred', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '⭐' },
  { id: 'SENT', name: 'Sent', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '📤' },
  { id: 'DRAFT', name: 'Drafts', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '📝' },
  { id: 'SPAM', name: 'Spam', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '⚠️' },
  { id: 'TRASH', name: 'Trash', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '🗑️' },
  { id: 'IMPORTANT', name: 'Important', type: 'system', color: '', unreadCount: 0, totalCount: 0, icon: '🏷️' },
];

const demoLabels: LabelInfo[] = [
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
  isAuthenticated: false,
  isLoading: false,
  isLiveMode: false,
  user: null,
  error: null,

  loginWithGoogle: () => {
    auth.initiateGoogleLogin();
  },

  loginDemo: () => {
    set({ isLoading: true });
    setTimeout(() => {
      const emails = generateMockEmails(60);
      set({
        isAuthenticated: true,
        isLoading: false,
        isLiveMode: false,
        user: { email: 'ghost@ghostmail.dev', name: 'Ghost User', picture: '' },
        emails,
        labels: demoLabels,
        showOnboarding: true,
      });
    }, 1200);
  },

  restoreSession: async () => {
    // Check for OAuth callback
    const oauthResult = auth.parseOAuthCallback();
    if (oauthResult) {
      set({ isLoading: true });
      gmail.setAccessToken(oauthResult.accessToken);
      try {
        const profile = await gmail.getProfile();
        const labelsData = await gmail.fetchLabels();
        const { emails } = await gmail.fetchMessages('INBOX', '');
        set({
          isAuthenticated: true,
          isLoading: false,
          isLiveMode: true,
          user: profile,
          emails,
          labels: labelsData,
          showOnboarding: true,
        });
        get().notify('success', `Welcome, ${profile.name}!`);
      } catch (err: any) {
        set({ isLoading: false, error: err.message });
        get().notify('error', 'Failed to connect to Gmail: ' + err.message);
      }
      return;
    }

    // Check for stored token
    const storedToken = auth.getStoredToken();
    if (storedToken && auth.hasClientId()) {
      set({ isLoading: true });
      gmail.setAccessToken(storedToken);
      try {
        const profile = await gmail.getProfile();
        const labelsData = await gmail.fetchLabels();
        const { emails } = await gmail.fetchMessages('INBOX', '');
        set({
          isAuthenticated: true,
          isLoading: false,
          isLiveMode: true,
          user: profile,
          emails,
          labels: labelsData,
        });
      } catch {
        // Token expired/invalid
        auth.clearStoredToken();
        set({ isLoading: false });
      }
    }
  },

  logout: () => {
    auth.clearStoredToken();
    gmail.setAccessToken(null);
    set({
      isAuthenticated: false, isLiveMode: false, user: null, emails: [],
      selectedIds: new Set(), activeEmail: null, currentView: 'inbox',
      showEmailView: false, labels: defaultLabels,
    });
  },

  emails: [],
  selectedIds: new Set<string>(),
  activeEmail: null,
  labels: defaultLabels,
  activeLabel: 'INBOX',
  isBulkProcessing: false,
  bulkProgress: { current: 0, total: 0 },
  searchQuery: '',
  sortOrder: 'newest',

  setActiveEmail: (email) => {
    if (!email) { set({ activeEmail: null, showEmailView: false }); return; }
    if (email && !email.isRead) {
      set({
        activeEmail: { ...email, isRead: true },
        showEmailView: true,
        emails: get().emails.map(e => e.id === email.id ? { ...e, isRead: true } : e),
      });
      if (get().isLiveMode) {
        gmail.modifyMessage(email.id, [], ['UNREAD']).catch(() => {});
      }
    } else {
      set({ activeEmail: email, showEmailView: true });
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
    if (get().isLiveMode) {
      Promise.all(ids.map(id => gmail.trashMessage(id))).catch((err) => {
        get().notify('error', 'Failed to trash some messages: ' + err.message);
      });
    }
  },

  markAsRead: (ids) => {
    const s = new Set(ids);
    set({ emails: get().emails.map(e => s.has(e.id) ? { ...e, isRead: true } : e) });
    if (get().isLiveMode) {
      gmail.batchModify(ids, [], ['UNREAD']).catch(() => {});
    }
  },

  markAsUnread: (ids) => {
    const s = new Set(ids);
    set({ emails: get().emails.map(e => s.has(e.id) ? { ...e, isRead: false } : e) });
    if (get().isLiveMode) {
      gmail.batchModify(ids, ['UNREAD'], []).catch(() => {});
    }
  },

  toggleStar: (id) => {
    const email = get().emails.find(e => e.id === id);
    set({ emails: get().emails.map(e => e.id === id ? { ...e, isStarred: !e.isStarred } : e) });
    if (get().isLiveMode && email) {
      if (email.isStarred) {
        gmail.modifyMessage(id, [], ['STARRED']).catch(() => {});
      } else {
        gmail.modifyMessage(id, ['STARRED'], []).catch(() => {});
      }
    }
  },

  setActiveLabel: (label) => {
    set({ activeLabel: label, selectedIds: new Set(), activeEmail: null, showEmailView: false, searchQuery: '', isLoading: true });
    if (get().isLiveMode) {
      gmail.fetchMessages(label, '').then(({ emails }) => {
        set({ emails, isLoading: false });
      }).catch((err) => {
        get().notify('error', err.message);
        set({ isLoading: false });
      });
    } else {
      setTimeout(() => {
        set({ emails: generateMockEmails(25 + Math.floor(Math.random() * 35)), isLoading: false });
      }, 300);
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (get().isLiveMode && query.trim()) {
      set({ isLoading: true });
      gmail.fetchMessages('', query).then(({ emails }) => {
        set({ emails, isLoading: false });
      }).catch((err) => {
        get().notify('error', err.message);
        set({ isLoading: false });
      });
    } else if (get().isLiveMode && !query.trim()) {
      // Clear search — reload current label
      set({ isLoading: true });
      gmail.fetchMessages(get().activeLabel, '').then(({ emails }) => {
        set({ emails, isLoading: false });
      }).catch(() => set({ isLoading: false }));
    }
  },

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
    if (get().isLiveMode) {
      gmail.fetchMessages(get().activeLabel, get().searchQuery).then(({ emails }) => {
        set({ emails, isLoading: false });
        get().notify('success', 'Inbox refreshed');
      }).catch((err) => {
        get().notify('error', err.message);
        set({ isLoading: false });
      });
    } else {
      setTimeout(() => {
        set({ emails: generateMockEmails(40 + Math.floor(Math.random() * 20)), isLoading: false });
        get().notify('success', 'Inbox refreshed');
      }, 800);
    }
  },

  sendEmail: async (to, subject, body, cc, bcc) => {
    if (get().isLiveMode) {
      await gmail.sendMessage(to, subject, body, cc, bcc);
    }
    get().notify('success', `Email sent to ${to} ✨`);
  },

  // UI
  sidebarCollapsed: false,
  viewMode: 'comfortable',
  showAppLauncher: false,
  notifications: [],
  currentView: 'inbox',
  showEmailView: false,
  showCompose: false,
  showCommandPalette: false,
  showSettings: false,
  showOnboarding: false,
  showLabelManager: false,
  selectedTheme: 'storm',
  emailFontSize: 14,
  soundEnabled: false,
  desktopNotifications: true,

  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setViewMode: (m) => set({ viewMode: m }),
  toggleAppLauncher: () => set({ showAppLauncher: !get().showAppLauncher }),
  closeAppLauncher: () => set({ showAppLauncher: false }),
  setCurrentView: (v) => set({ currentView: v, showEmailView: false, activeEmail: null }),
  setShowEmailView: (s) => set({ showEmailView: s }),
  setShowCompose: (s) => set({ showCompose: s }),
  setShowCommandPalette: (s) => set({ showCommandPalette: s }),
  setShowSettings: (s) => set({ showSettings: s }),
  setShowOnboarding: (s) => set({ showOnboarding: s }),
  setShowLabelManager: (s) => set({ showLabelManager: s }),
  setSelectedTheme: (t) => set({ selectedTheme: t }),
  setEmailFontSize: (s) => set({ emailFontSize: s }),
  setSoundEnabled: (e) => set({ soundEnabled: e }),
  setDesktopNotifications: (e) => set({ desktopNotifications: e }),

  createLabel: async (name, color) => {
    if (get().isLiveMode) {
      try {
        const label = await gmail.createGmailLabel(name, color);
        set({ labels: [...get().labels, label] });
        get().notify('success', `Label "${name}" created`);
      } catch (err: any) {
        get().notify('error', err.message);
      }
    } else {
      const id = `label_${Date.now()}`;
      set({ labels: [...get().labels, { id, name, type: 'user', color, unreadCount: 0, totalCount: 0, icon: '📌' }] });
      get().notify('success', `Label "${name}" created`);
    }
  },

  deleteLabel: async (id) => {
    const label = get().labels.find(l => l.id === id);
    set({ labels: get().labels.filter(l => l.id !== id) });
    get().notify('info', `Label "${label?.name || id}" deleted`);
    if (get().isLiveMode) {
      gmail.deleteGmailLabel(id).catch(() => {});
    }
  },

  notify: (type, message) => {
    const id = crypto.randomUUID();
    set({ notifications: [...get().notifications, { id, type, message, duration: 4000 }] });
    setTimeout(() => set({ notifications: get().notifications.filter(n => n.id !== id) }), 4000);
  },
  dismissNotification: (id) => set({ notifications: get().notifications.filter(n => n.id !== id) }),

  googleApps,
}));
