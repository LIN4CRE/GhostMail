import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { Shield, Wifi, Ghost, Zap } from 'lucide-react';

export function StatusBar() {
  const { emails, selectedIds, activeLabel, labels, currentView, isLiveMode } = useStore();
  const unreadCount = emails.filter(e => !e.isRead).length;
  const currentLabel = labels.find(l => l.id === activeLabel);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="flex items-center justify-between border-t border-tn-border bg-tn-bg-dark/60 backdrop-blur-sm px-4 py-[3px]">
      <div className="flex items-center gap-2.5 text-[10px] text-tn-fg-muted">
        <span className="flex items-center gap-1 font-semibold text-gradient"><Ghost size={9} /> GhostMail</span>
        <span className="text-tn-fg-gutter">|</span>
        {currentView === 'inbox' && (
          <>
            <span>{currentLabel?.name}: {emails.length}</span>
            {unreadCount > 0 && <span className="badge-warning rounded px-1 py-0 text-[9px] font-bold">{unreadCount} new</span>}
          </>
        )}
        {selectedIds.size > 0 && <span className="badge-info rounded px-1 py-0 text-[9px] font-bold">{selectedIds.size} sel</span>}
      </div>
      <div className="flex items-center gap-2.5 text-[10px] text-tn-fg-muted">
        <span className="hidden md:inline tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className={`flex items-center gap-1 font-semibold rounded-full px-1.5 py-0 ${isLiveMode ? 'badge-success' : 'badge-warning'}`}>
          {isLiveMode ? <><Wifi size={8} /> Live</> : <><Zap size={8} /> Demo</>}
        </span>
        <span className="flex items-center gap-1"><Shield size={8} className="text-tn-green" /> E2E</span>
      </div>
    </footer>
  );
}
