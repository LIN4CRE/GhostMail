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
    <header className="flex items-center gap-2 border-b border-tn-border bg-tn-bg-dark/80 backdrop-blur-sm px-3 py-2">
      <button onClick={onOpenMobileSidebar} className="flex h-9 w-9 items-center justify-center rounded-lg text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg sm:hidden">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none">{v.icon}</span>
        <h1 className="text-sm font-semibold text-tn-fg truncate">{v.title}</h1>
        {currentLabel && currentView === 'inbox' && (
          <span className="hidden xs:inline rounded-full bg-tn-bg-highlight px-2 py-0.5 text-[10px] text-tn-fg-muted">{currentLabel.totalCount}</span>
        )}
      </div>

      {currentView === 'inbox' && (
        <div className="hidden flex-1 max-w-xl mx-auto sm:block"><SearchBar /></div>
      )}
      <div className="flex-1 sm:hidden" />

      {/* Bulk selection actions */}
      <AnimatePresence>
        {selectedCount > 0 && currentView === 'inbox' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-0.5">
            <span className="mr-1 rounded-full bg-tn-blue/20 px-2 py-0.5 text-[10px] font-bold text-tn-blue">{selectedCount}</span>
            <button onClick={() => { removeEmails([...selectedIds]); notify('success', `Archived ${selectedCount}`); }} title="Archive"
              className="rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg"><Archive size={15} /></button>
            <button onClick={() => { removeEmails([...selectedIds]); notify('success', `Deleted ${selectedCount}`); }} title="Delete"
              className="rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-red"><Trash2 size={15} /></button>
            <button onClick={() => { markAsRead([...selectedIds]); deselectAll(); notify('info', `Marked ${selectedCount} read`); }} title="Mark read"
              className="rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg"><MailOpen size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => setShowCommandPalette(true)} title="⌘K"
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border border-tn-border/50 bg-tn-bg-highlight/50 px-2.5 text-[10px] text-tn-fg-muted hover:border-tn-fg-gutter hover:text-tn-fg transition-colors">
          <Command size={11} /> <span className="hidden lg:inline">Commands</span> <kbd className="rounded border border-tn-border bg-tn-bg-darker px-1 text-[9px]">⌘K</kbd>
        </button>

        <button onClick={() => setShowCompose(true)} title="Compose"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-blue sm:hidden">
          <PenSquare size={15} />
        </button>

        <div className="relative">
          <button onClick={toggleAppLauncher}
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
            className="flex flex-col items-center gap-1 rounded-xl p-2.5 transition-colors hover:bg-tn-bg-highlight">
            <span className="text-xl">{app.icon}</span>
            <span className="text-[10px] text-tn-fg-muted">{app.name}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
