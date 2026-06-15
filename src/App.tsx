import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './stores/useStore';
import { useKeyboard } from './hooks/useKeyboard';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { EmailList } from './components/EmailList';
import { EmailView } from './components/EmailView';
import { BulkActions } from './components/BulkActions';
import { AppLauncher } from './components/AppLauncher';
import { Dashboard } from './components/Dashboard';
import { Toast } from './components/Toast';
import { StatusBar } from './components/StatusBar';
import { ComposeModal } from './components/ComposeModal';
import { CommandPalette } from './components/CommandPalette';
import { SettingsPanel } from './components/SettingsPanel';
import { Onboarding } from './components/Onboarding';

export default function App() {
  useKeyboard();
  const { isAuthenticated, currentView, showEmailView, activeEmail } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toast />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-tn-bg-darker">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar drawer */}
      <MobileSidebar open={mobileSidebarOpen} onClose={closeMobileSidebar} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenMobileSidebar={openMobileSidebar} />

        <div className="flex flex-1 overflow-hidden">
          {currentView === 'inbox' && (
            <>
              {/* Email list pane */}
              <div className={`flex flex-1 flex-col overflow-hidden border-r border-tn-border/50 ${
                showEmailView && activeEmail ? 'hidden lg:flex lg:max-w-sm xl:max-w-md' : ''
              }`}>
                <div className="border-b border-tn-border p-2 sm:hidden">
                  <div className="px-1"><SearchBar /></div>
                </div>
                <EmailList />
              </div>

              {/* Email detail pane */}
              <AnimatePresence>
                {showEmailView && activeEmail && (
                  <div className="flex-1 overflow-hidden min-w-0"><EmailView /></div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!showEmailView && (
                <div className="hidden flex-1 items-center justify-center lg:flex">
                  <EmptyState />
                </div>
              )}
            </>
          )}

          {currentView === 'dashboard' && <div className="flex-1 overflow-hidden"><Dashboard /></div>}
          {currentView === 'bulk' && <div className="flex-1 overflow-hidden"><BulkActions /></div>}
          {currentView === 'apps' && <div className="flex-1 overflow-hidden"><AppLauncher /></div>}
        </div>

        <StatusBar />
      </div>

      {/* Modals & Overlays */}
      <ComposeModal />
      <CommandPalette />
      <SettingsPanel />
      <Onboarding />
      <Toast />
    </div>
  );
}

function EmptyState() {
  const { setShowCompose, setShowCommandPalette } = useStore();

  return (
    <div className="flex flex-col items-center gap-6 text-center p-8 max-w-sm">
      <div className="relative">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-tn-bg-highlight to-tn-bg-float border border-tn-border/30">
          <span className="text-6xl animate-float">👻</span>
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-tn-green flex items-center justify-center animate-pulse">
          <span className="text-[10px]">✓</span>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-tn-fg">Select an email</h3>
        <p className="mt-1.5 text-sm text-tn-fg-muted leading-relaxed">Choose one from the list to read it here, or start composing a new message.</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowCompose(true)}
          className="rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-4 py-2 text-xs font-semibold text-white shadow-md shadow-tn-blue/20 hover:shadow-lg transition-shadow">
          ✍️ Compose
        </button>
        <button onClick={() => setShowCommandPalette(true)}
          className="rounded-xl bg-tn-bg-highlight px-4 py-2 text-xs text-tn-fg-muted hover:text-tn-fg hover:bg-tn-bg-float transition-colors">
          ⌘K Commands
        </button>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10px] text-tn-fg-muted">
        {[
          ['j/k', 'Navigate'], ['Enter', 'Open'], ['x', 'Select'],
          ['s', 'Star'], ['/', 'Search'], ['c', 'Compose'],
          ['⌘K', 'Commands'], ['r', 'Refresh'], ['Esc', 'Close'],
        ].map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center min-w-[20px] rounded border border-tn-border bg-tn-bg-highlight px-1 py-0.5 font-mono text-[9px]">{key}</kbd>
            <span className="text-tn-fg-muted/60">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
