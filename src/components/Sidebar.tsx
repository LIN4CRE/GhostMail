import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost, ChevronLeft, ChevronRight, Inbox, Star, Send, FileText,
  AlertTriangle, Trash2, Tag, Zap, Grid3X3, LogOut, Settings,
  RefreshCw, PenSquare, PieChart, Command
} from 'lucide-react';
import { useStore } from '../stores/useStore';

const labelIcons: Record<string, React.ReactNode> = {
  INBOX: <Inbox size={18} />,
  STARRED: <Star size={18} />,
  SENT: <Send size={18} />,
  DRAFT: <FileText size={18} />,
  SPAM: <AlertTriangle size={18} />,
  TRASH: <Trash2 size={18} />,
  IMPORTANT: <Tag size={18} />,
};

export function Sidebar() {
  const {
    sidebarCollapsed, toggleSidebar, labels, activeLabel, setActiveLabel,
    currentView, setCurrentView, logout, user, refreshEmails, isLoading,
    setShowCompose, setShowCommandPalette, setShowSettings
  } = useStore();

  const systemLabels = labels.filter(l => l.type === 'system');
  const userLabels = labels.filter(l => l.type === 'user');

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 250 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative hidden h-full flex-col border-r border-tn-border bg-tn-bg-dark sm:flex"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-tn-border p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta shadow-md shadow-tn-purple/20">
          <Ghost size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-base font-bold text-gradient"
            >
              GhostMail
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-tn-fg-muted transition-colors hover:bg-tn-bg-highlight hover:text-tn-fg"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Compose Button */}
      <div className="p-2">
        <motion.button
          onClick={() => setShowCompose(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-tn-blue/15 transition-shadow hover:shadow-lg hover:shadow-tn-blue/20 ${
            sidebarCollapsed ? 'px-0' : ''
          }`}
        >
          <PenSquare size={16} />
          {!sidebarCollapsed && <span>Compose</span>}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        <NavItem icon={<Inbox size={18} />} label="Inbox" active={currentView === 'inbox' && activeLabel === 'INBOX'} collapsed={sidebarCollapsed}
          onClick={() => { setCurrentView('inbox'); setActiveLabel('INBOX'); }} badge={labels.find(l => l.id === 'INBOX')?.unreadCount} />
        <NavItem icon={<PieChart size={18} />} label="Dashboard" active={currentView === 'dashboard'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('dashboard')} color="text-tn-green" />
        <NavItem icon={<Zap size={18} />} label="Bulk Actions" active={currentView === 'bulk'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('bulk')} color="text-tn-orange" />
        <NavItem icon={<Grid3X3 size={18} />} label="Google Apps" active={currentView === 'apps'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('apps')} color="text-tn-teal" />

        <div className="mx-2 my-2.5 border-t border-tn-border/50" />

        {!sidebarCollapsed && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted">Labels</p>}
        {systemLabels.filter(l => l.id !== 'INBOX').map(label => (
          <NavItem key={label.id} icon={labelIcons[label.id] || <Tag size={18} />} label={label.name}
            badge={label.unreadCount > 0 ? label.unreadCount : undefined}
            active={currentView === 'inbox' && activeLabel === label.id} collapsed={sidebarCollapsed}
            onClick={() => { setCurrentView('inbox'); setActiveLabel(label.id); }} />
        ))}

        {userLabels.length > 0 && (
          <>
            <div className="mx-2 my-2.5 border-t border-tn-border/50" />
            {!sidebarCollapsed && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted">Custom</p>}
            {userLabels.map(label => (
              <NavItem key={label.id}
                icon={<div className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />}
                label={label.name} badge={label.unreadCount > 0 ? label.unreadCount : undefined}
                active={currentView === 'inbox' && activeLabel === label.id} collapsed={sidebarCollapsed}
                onClick={() => { setCurrentView('inbox'); setActiveLabel(label.id); }} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-tn-border p-2 space-y-0.5">
        <NavItem icon={<Command size={16} />} label="Commands" collapsed={sidebarCollapsed} onClick={() => setShowCommandPalette(true)}
          shortcut={!sidebarCollapsed ? '⌘K' : undefined} />
        <NavItem icon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />} label="Refresh" collapsed={sidebarCollapsed} onClick={refreshEmails} />
        <NavItem icon={<Settings size={16} />} label="Settings" collapsed={sidebarCollapsed} onClick={() => setShowSettings(true)} />

        {/* User */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mt-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-xs font-bold text-white">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium text-tn-fg">{user?.name}</p>
                <p className="truncate text-[10px] text-tn-fg-muted">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={logout} className="shrink-0 rounded-md p-1.5 text-tn-fg-muted transition-colors hover:bg-tn-bg-highlight hover:text-tn-red" title="Sign out">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function NavItem({ icon, label, badge, active, collapsed, onClick, color, shortcut }: {
  icon: React.ReactNode; label: string; badge?: number; active?: boolean; collapsed: boolean;
  onClick: () => void; color?: string; shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-150 ${
        active ? 'bg-tn-bg-highlight text-tn-blue shadow-sm' : `text-tn-fg-dark hover:bg-tn-bg-highlight/50 hover:text-tn-fg ${color || ''}`
      }`}
    >
      <span className={`shrink-0 ${active ? 'text-tn-blue' : color || 'text-tn-fg-muted group-hover:text-tn-fg'}`}>{icon}</span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
            className="flex-1 overflow-hidden whitespace-nowrap text-left">{label}</motion.span>
        )}
      </AnimatePresence>
      {!collapsed && shortcut && <kbd className="rounded border border-tn-border bg-tn-bg-darker px-1 py-0.5 text-[9px] text-tn-fg-muted">{shortcut}</kbd>}
      {badge !== undefined && !collapsed && (
        <span className="rounded-full bg-tn-blue/20 px-1.5 py-0.5 text-[10px] font-semibold text-tn-blue">{badge}</span>
      )}
    </button>
  );
}
