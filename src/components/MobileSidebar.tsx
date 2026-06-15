import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost, X, Inbox, Star, Send, FileText, AlertTriangle, Trash2, Tag,
  Zap, Grid3X3, LogOut, Settings, PenSquare, PieChart, Command, RefreshCw
} from 'lucide-react';
import { useStore } from '../stores/useStore';

const labelIcons: Record<string, React.ReactNode> = {
  INBOX: <Inbox size={18} />, STARRED: <Star size={18} />, SENT: <Send size={18} />,
  DRAFT: <FileText size={18} />, SPAM: <AlertTriangle size={18} />, TRASH: <Trash2 size={18} />,
  IMPORTANT: <Tag size={18} />,
};

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    labels, activeLabel, setActiveLabel, currentView, setCurrentView,
    logout, user, setShowCompose, setShowCommandPalette, setShowSettings,
    refreshEmails, isLoading
  } = useStore();

  const nav = (view: typeof currentView, label?: string) => {
    setCurrentView(view);
    if (label) setActiveLabel(label);
    onClose();
  };

  const systemLabels = labels.filter(l => l.type === 'system');
  const userLabels = labels.filter(l => l.type === 'user');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm sm:hidden"
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-[91] w-72 flex flex-col border-r border-tn-border bg-tn-bg-dark shadow-2xl sm:hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-tn-border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta">
                <Ghost size={18} className="text-white" />
              </div>
              <span className="text-base font-bold text-gradient">GhostMail</span>
              <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg">
                <X size={18} />
              </button>
            </div>

            {/* Compose */}
            <div className="p-3">
              <button onClick={() => { setShowCompose(true); onClose(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-3 py-2.5 text-sm font-semibold text-white shadow-md">
                <PenSquare size={16} /> Compose
              </button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
              <MobileNavItem icon={<Inbox size={18} />} label="Inbox" active={currentView === 'inbox' && activeLabel === 'INBOX'}
                badge={labels.find(l => l.id === 'INBOX')?.unreadCount} onClick={() => nav('inbox', 'INBOX')} />
              <MobileNavItem icon={<PieChart size={18} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => nav('dashboard')} color="text-tn-green" />
              <MobileNavItem icon={<Zap size={18} />} label="Bulk Actions" active={currentView === 'bulk'} onClick={() => nav('bulk')} color="text-tn-orange" />
              <MobileNavItem icon={<Grid3X3 size={18} />} label="Google Apps" active={currentView === 'apps'} onClick={() => nav('apps')} color="text-tn-teal" />

              <div className="!my-3 border-t border-tn-border/50" />
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted mb-1">Labels</p>
              {systemLabels.filter(l => l.id !== 'INBOX').map(l => (
                <MobileNavItem key={l.id} icon={labelIcons[l.id] || <Tag size={18} />} label={l.name}
                  badge={l.unreadCount > 0 ? l.unreadCount : undefined}
                  active={currentView === 'inbox' && activeLabel === l.id}
                  onClick={() => nav('inbox', l.id)} />
              ))}

              {userLabels.length > 0 && (
                <>
                  <div className="!my-3 border-t border-tn-border/50" />
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted mb-1">Custom</p>
                  {userLabels.map(l => (
                    <MobileNavItem key={l.id}
                      icon={<div className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />}
                      label={l.name} badge={l.unreadCount > 0 ? l.unreadCount : undefined}
                      active={currentView === 'inbox' && activeLabel === l.id}
                      onClick={() => nav('inbox', l.id)} />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-tn-border p-3 space-y-0.5">
              <MobileNavItem icon={<Command size={16} />} label="Commands ⌘K" onClick={() => { setShowCommandPalette(true); onClose(); }} />
              <MobileNavItem icon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />} label="Refresh" onClick={() => { refreshEmails(); onClose(); }} />
              <MobileNavItem icon={<Settings size={16} />} label="Settings" onClick={() => { setShowSettings(true); onClose(); }} />

              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mt-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-tn-fg">{user?.name}</p>
                  <p className="truncate text-[10px] text-tn-fg-muted">{user?.email}</p>
                </div>
                <button onClick={() => { logout(); onClose(); }} className="rounded-md p-1.5 text-tn-fg-muted hover:text-tn-red">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileNavItem({ icon, label, badge, active, onClick, color }: {
  icon: React.ReactNode; label: string; badge?: number; active?: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
        active ? 'bg-tn-bg-highlight text-tn-blue' : `text-tn-fg-dark hover:bg-tn-bg-highlight/50 ${color || ''}`
      }`}>
      <span className={active ? 'text-tn-blue' : color || 'text-tn-fg-muted'}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && <span className="rounded-full bg-tn-blue/20 px-1.5 py-0.5 text-[10px] font-semibold text-tn-blue">{badge}</span>}
    </button>
  );
}
