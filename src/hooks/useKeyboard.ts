import { useEffect } from 'react';
import { useStore } from '../stores/useStore';

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useStore.getState();
      if (!store.isAuthenticated) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Command palette — always works
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        store.setShowCommandPalette(!store.showCommandPalette);
        return;
      }

      // Escape — always works
      if (e.key === 'Escape') {
        if (store.showCommandPalette) { store.setShowCommandPalette(false); return; }
        if (store.showCompose) { store.setShowCompose(false); return; }
        if (store.showSettings) { store.setShowSettings(false); return; }
        if (store.showOnboarding) { store.setShowOnboarding(false); return; }
        if (store.showAppLauncher) { store.closeAppLauncher(); return; }
        if (store.showEmailView) { store.setActiveEmail(null); store.setShowEmailView(false); return; }
        return;
      }

      if (isInput) return;

      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') { e.preventDefault(); store.selectAll(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); store.deselectAll(); return; }

      switch (e.key) {
        case '/': e.preventDefault(); (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus(); break;
        case 'c': case 'C': store.setShowCompose(true); break;
        case 'r': store.refreshEmails(); break;
        case '1': store.setCurrentView('inbox'); break;
        case '2': store.setCurrentView('dashboard'); break;
        case '3': store.setCurrentView('bulk'); break;
        case '4': store.setCurrentView('apps'); break;
        case ',': store.setShowSettings(true); break;
        case '?': store.setShowOnboarding(true); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
