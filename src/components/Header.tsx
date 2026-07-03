import { useStore } from '../stores/useStore';
import { SearchBar } from './SearchBar';
import { ProfileDropdown } from './ProfileDropdown';
import { Menu, Trash2, Archive, MailOpen, Grid3X3, PenSquare, Command } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Header({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const {
    activeLabel, labels, selectedIds,
    removeEmails, markAsRead, deselectAll, notify,
    toggleAppLauncher, showAppLauncher, currentView,
    setShowCompose, setShowCommandPalette
  } = useStore();

  const selectedCount = selectedIds.size;
  const currentLabel = labels.find(l => l.id === activeLabel);

  const viewTitles: Record<string, { title: string; icon: string }> = {
    inbox: { title: currentLabel?.name || 'Inbox', icon: currentLabel?.icon || '📥' },
    bulk: { title: 'Bulk Actions', icon: '⚡' },
    apps: { title: 'Google Apps', icon: '🔲' },
    dashboard: { title: 'Dashboard', icon: '📊' },
  };
  const v = viewTitles[currentView] || viewTitles.inbox;

  return (
    <header className="flex items-center gap-2 border-b border-tn-border bg-tn-bg-dark/60 backdrop-blur-md px-3 py-2">
      <button onClick={onOpenMobileSidebar} className="flex h-9 w-9 items-center justify-center rounded-lg text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg sm:hidden" data-tip="Menu">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none">{v.icon}</span>
        <h1 className="text-sm font-semibold text-tn-fg truncate">{v.title}</h1>
        {currentLabel && currentView === 'inbox' && currentLabel.unreadCount > 0 && (
          <span className="badge-warning rounded-full px-1.5 py-0.5 text-[9px] font-bold">{currentLabel.unreadCount}</span>
        )}
      </div>

      {currentView === 'inbox' && (
        <div className="hidden flex-1 max-w-xl mx-auto sm:block"><SearchBar /></div>
      )}
      <div className="flex-1 sm:hidden" />

      {/* Bulk action bar — appears when emails selected */}
      <AnimatePresence>
        {selectedCount > 0 && currentView === 'inbox' && (
          <motion.div initial={{ opacity: 0, scale: 0.9, width: 0 }} animate={{ opacity: 1, scale: 1, width: 'auto' }} exit={{ opacity: 0, scale: 0.9, width: 0 }}
            className="flex items-center gap-0.5 overflow-hidden rounded-lg border border-tn-blue/20 bg-tn-blue/5 px-1.5 py-0.5">
            <span className="px-1.5 text-[10px] font-bold text-tn-blue">{selectedCount}</span>
            <button onClick={() => { removeEmails([...selectedIds]); notify('success', `Archived ${selectedCount}`); }} data-tip="Archive"
              className="rounded-md p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-teal"><Archive size={14} /></button>
            <button onClick={() => { removeEmails([...selectedIds]); notify('success', `Deleted ${selectedCount}`); }} data-tip="Delete"
              className="rounded-md p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-red"><Trash2 size={14} /></button>
            <button onClick={() => { markAsRead([...selectedIds]); deselectAll(); notify('info', `Marked ${selectedCount} read`); }} data-tip="Mark read"
              className="rounded-md p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-green"><MailOpen size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => setShowCommandPalette(true)} data-tip="Command Palette"
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border border-tn-border/40 bg-tn-bg-highlight/30 px-2.5 text-[10px] text-tn-fg-muted hover:border-tn-fg-gutter hover:text-tn-fg transition-colors">
          <Command size={11} />
          <span className="hidden lg:inline">Search commands</span>
          <kbd className="rounded border border-tn-border/50 bg-tn-bg-darker px-1 text-[8px]">⌘K</kbd>
        </button>
        <button onClick={() => setShowCompose(true)} data-tip="Compose email"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-blue sm:hidden"><PenSquare size={15} /></button>
        <div className="relative">
          <button onClick={toggleAppLauncher} data-tip="Google Apps"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${showAppLauncher ? 'bg-tn-bg-highlight text-tn-teal' : 'text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg'}`}>
            <Grid3X3 size={15} />
          </button>
          <AnimatePresence>{showAppLauncher && <AppLauncherDropdown />}</AnimatePresence>
        </div>
        <ProfileDropdown />
      </div>
    </header>
  );
}

function AppLauncherDropdown() {
  const { googleApps, closeAppLauncher } = useStore();
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-tn-border bg-tn-bg-dark p-3 shadow-2xl">
      <div className="grid grid-cols-3 gap-1.5">
        {googleApps.slice(0, 12).map(app => (
          <a key={app.id} href={app.url} target="_blank" rel="noopener noreferrer" onClick={closeAppLauncher}
            className="flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all hover:bg-tn-bg-highlight hover-lift">
            <span className="text-xl">{app.icon}</span>
            <span className="text-[10px] text-tn-fg-muted">{app.name}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
