import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost, ChevronLeft, ChevronRight, Inbox, Star, Send, FileText,
  AlertTriangle, Trash2, Tag, Zap, Grid3X3, LogOut, Settings,
  RefreshCw, PenSquare, PieChart, Command, Plus
} from 'lucide-react';
import { useStore } from '../stores/useStore';

const labelIcons: Record<string, React.ReactNode> = {
  INBOX: <Inbox size={17} />, STARRED: <Star size={17} />, SENT: <Send size={17} />,
  DRAFT: <FileText size={17} />, SPAM: <AlertTriangle size={17} />, TRASH: <Trash2 size={17} />,
  IMPORTANT: <Tag size={17} />,
};

// Color-code badges by type — red for spam, orange for high unread, etc.
function badgeStyle(id: string, count: number): string {
  if (id === 'SPAM') return 'bg-tn-red/20 text-tn-red';
  if (count > 10) return 'bg-tn-orange/20 text-tn-orange';
  return 'bg-tn-blue/15 text-tn-blue';
}

export function Sidebar() {
  const {
    sidebarCollapsed, toggleSidebar, labels, activeLabel, setActiveLabel,
    currentView, setCurrentView, logout, user, refreshEmails, isLoading,
    setShowCompose, setShowCommandPalette, setShowSettings, setShowLabelManager,
    isLiveMode
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
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta shadow-md shadow-tn-purple/20">
          <Ghost size={18} className="text-white" />
          {/* Live/Demo indicator dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-tn-bg-dark ${isLiveMode ? 'status-online' : 'status-away'}`} />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <span className="whitespace-nowrap text-base font-bold text-gradient">GhostMail</span>
              <p className={`text-[9px] font-medium ${isLiveMode ? 'text-tn-green' : 'text-tn-orange'}`}>
                {isLiveMode ? '● Connected' : '● Demo mode'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleSidebar} className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Compose */}
      <div className="p-2">
        <motion.button onClick={() => setShowCompose(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-tn-blue/15 hover:shadow-lg hover:shadow-tn-blue/25 transition-shadow ${sidebarCollapsed ? 'px-0' : ''}`}>
          <PenSquare size={16} />
          {!sidebarCollapsed && <span>Compose</span>}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {/* Main views */}
        <NavItem icon={<Inbox size={17} />} label="Inbox" active={currentView === 'inbox' && activeLabel === 'INBOX'} collapsed={sidebarCollapsed}
          onClick={() => { setCurrentView('inbox'); setActiveLabel('INBOX'); }}
          badge={labels.find(l => l.id === 'INBOX')?.unreadCount}
          badgeClass={badgeStyle('INBOX', labels.find(l => l.id === 'INBOX')?.unreadCount || 0)} />
        <NavItem icon={<PieChart size={17} />} label="Dashboard" active={currentView === 'dashboard'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('dashboard')} iconColor="text-tn-green" />
        <NavItem icon={<Zap size={17} />} label="Bulk Actions" active={currentView === 'bulk'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('bulk')} iconColor="text-tn-orange" />
        <NavItem icon={<Grid3X3 size={17} />} label="Google Apps" active={currentView === 'apps'} collapsed={sidebarCollapsed}
          onClick={() => setCurrentView('apps')} iconColor="text-tn-teal" />

        <Divider />

        {/* System labels */}
        {!sidebarCollapsed && <SectionHeader>System</SectionHeader>}
        {systemLabels.filter(l => l.id !== 'INBOX').map(label => (
          <NavItem key={label.id} icon={labelIcons[label.id] || <Tag size={17} />} label={label.name}
            badge={label.unreadCount > 0 ? label.unreadCount : undefined}
            badgeClass={badgeStyle(label.id, label.unreadCount)}
            active={currentView === 'inbox' && activeLabel === label.id} collapsed={sidebarCollapsed}
            onClick={() => { setCurrentView('inbox'); setActiveLabel(label.id); }} />
        ))}

        {/* Custom labels */}
        {userLabels.length > 0 && (
          <>
            <Divider />
            {!sidebarCollapsed && <SectionHeader>Custom</SectionHeader>}
            {userLabels.map(label => (
              <NavItem key={label.id}
                icon={<div className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10" style={{ backgroundColor: label.color }} />}
                label={label.name} badge={label.unreadCount > 0 ? label.unreadCount : undefined}
                badgeClass={badgeStyle(label.id, label.unreadCount)}
                active={currentView === 'inbox' && activeLabel === label.id} collapsed={sidebarCollapsed}
                onClick={() => { setCurrentView('inbox'); setActiveLabel(label.id); }} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-tn-border p-2 space-y-0.5">
        <NavItem icon={<Command size={15} />} label="Commands" collapsed={sidebarCollapsed} onClick={() => setShowCommandPalette(true)}
          shortcut={!sidebarCollapsed ? '⌘K' : undefined} />
        <NavItem icon={<RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />} label="Refresh" collapsed={sidebarCollapsed} onClick={refreshEmails} />
        <NavItem icon={<Settings size={15} />} label="Settings" collapsed={sidebarCollapsed} onClick={() => setShowSettings(true)} />
        <NavItem icon={<Plus size={15} />} label="Labels" collapsed={sidebarCollapsed} onClick={() => setShowLabelManager(true)} iconColor="text-tn-purple" />

        {/* User card */}
        <div className="flex items-center gap-2 rounded-xl px-2.5 py-2 mt-1.5 bg-tn-bg-highlight/30 border border-tn-border/20">
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-tn-bg-dark ${isLiveMode ? 'status-online' : 'status-away'}`} />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-xs font-medium text-tn-fg">{user?.name}</p>
                <p className="truncate text-[10px] text-tn-fg-muted">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={logout} className="shrink-0 rounded-md p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-red" data-tip="Sign out">
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function Divider() { return <div className="mx-2 my-2 border-t border-tn-border/30" />; }
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 px-3 pt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-tn-fg-muted/60">{children}</p>;
}

function NavItem({ icon, label, badge, badgeClass, active, collapsed, onClick, iconColor, shortcut }: {
  icon: React.ReactNode; label: string; badge?: number; badgeClass?: string; active?: boolean; collapsed: boolean;
  onClick: () => void; iconColor?: string; shortcut?: string;
}) {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-all duration-100 ${
        active
          ? 'bg-tn-blue/10 text-tn-blue font-medium'
          : 'text-tn-fg-dark hover:bg-tn-bg-highlight/40 hover:text-tn-fg'
      }`}>
      <span className={`shrink-0 ${active ? 'text-tn-blue' : iconColor || 'text-tn-fg-muted group-hover:text-tn-fg-dark'}`}>{icon}</span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
            className="flex-1 overflow-hidden whitespace-nowrap text-left">{label}</motion.span>
        )}
      </AnimatePresence>
      {!collapsed && shortcut && <kbd className="rounded border border-tn-border/50 bg-tn-bg-darker px-1 py-0.5 text-[8px] text-tn-fg-muted/70">{shortcut}</kbd>}
      {badge !== undefined && badge > 0 && !collapsed && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${badgeClass || 'badge-info'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {badge !== undefined && badge > 0 && collapsed && (
        <div className="absolute right-1.5 top-0.5 h-2 w-2 rounded-full bg-tn-blue animate-breathe" />
      )}
    </button>
  );
}
