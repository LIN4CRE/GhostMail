import { useStore } from '../stores/useStore';
import { Shield, Wifi, Ghost, Clock } from 'lucide-react';

export function StatusBar() {
  const { emails, selectedIds, activeLabel, labels, currentView } = useStore();
  const unreadCount = emails.filter(e => !e.isRead).length;
  const currentLabel = labels.find(l => l.id === activeLabel);

  return (
    <footer className="flex items-center justify-between border-t border-tn-border bg-tn-bg-dark/80 backdrop-blur-sm px-4 py-1">
      <div className="flex items-center gap-3 text-[10px] text-tn-fg-muted">
        <span className="flex items-center gap-1 text-gradient font-semibold">
          <Ghost size={10} /> GhostMail v1.0.0
        </span>
        <span className="hidden sm:inline text-tn-fg-gutter">•</span>
        <span className="hidden sm:inline">{currentView === 'inbox' ? `${currentLabel?.name || 'Inbox'}: ${emails.length} emails` : currentView}</span>
        {unreadCount > 0 && currentView === 'inbox' && (
          <><span className="hidden sm:inline text-tn-fg-gutter">•</span><span className="hidden sm:inline text-tn-blue">{unreadCount} unread</span></>
        )}
        {selectedIds.size > 0 && (
          <><span className="text-tn-fg-gutter">•</span><span className="text-tn-purple">{selectedIds.size} selected</span></>
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-tn-fg-muted">
        <span className="hidden md:flex items-center gap-1"><Clock size={9} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="flex items-center gap-1"><Shield size={9} className="text-tn-green" /> Secure</span>
        <span className="flex items-center gap-1"><Wifi size={9} className="text-tn-teal" /> Online</span>
      </div>
    </footer>
  );
}
