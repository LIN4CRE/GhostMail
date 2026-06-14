import { writable } from 'svelte/store';
import type { AppNotification, ViewMode } from '$lib/types';

function createUIStore() {
  const { subscribe, update } = writable<{
    sidebarCollapsed: boolean;
    viewMode: ViewMode;
    showAppLauncher: boolean;
    notifications: AppNotification[];
    showBulkPanel: boolean;
  }>({
    sidebarCollapsed: false,
    viewMode: 'comfortable',
    showAppLauncher: false,
    notifications: [],
    showBulkPanel: false
  });

  return {
    subscribe,

    toggleSidebar() {
      update(s => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }));
    },

    setViewMode(mode: ViewMode) {
      update(s => ({ ...s, viewMode: mode }));
    },

    toggleAppLauncher() {
      update(s => ({ ...s, showAppLauncher: !s.showAppLauncher }));
    },

    closeAppLauncher() {
      update(s => ({ ...s, showAppLauncher: false }));
    },

    toggleBulkPanel() {
      update(s => ({ ...s, showBulkPanel: !s.showBulkPanel }));
    },

    notify(type: AppNotification['type'], message: string, duration = 4000) {
      const id = crypto.randomUUID();
      update(s => ({
        ...s,
        notifications: [...s.notifications, { id, type, message, duration }]
      }));
      setTimeout(() => {
        update(s => ({
          ...s,
          notifications: s.notifications.filter(n => n.id !== id)
        }));
      }, duration);
    },

    dismissNotification(id: string) {
      update(s => ({
        ...s,
        notifications: s.notifications.filter(n => n.id !== id)
      }));
    }
  };
}

export const ui = createUIStore();
