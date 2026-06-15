import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Paperclip, CheckSquare, Square, Minus, ArrowUpDown, Inbox } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { ContextMenu, useContextMenu } from './ContextMenu';

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
}
function formatSize(b: number) { return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`; }

export function EmailList() {
  const {
    emails, selectedIds, activeEmail, searchQuery, sortOrder,
    toggleSelect, selectAll, deselectAll, setActiveEmail, toggleStar,
    setSortOrder, isLoading, activeLabel
  } = useStore();

  const { menu, openMenu, closeMenu } = useContextMenu();
  const listRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return emails;
    const q = searchQuery.toLowerCase();
    return emails.filter(e =>
      e.subject.toLowerCase().includes(q) || e.snippet.toLowerCase().includes(q) ||
      e.from.name.toLowerCase().includes(q) || e.from.email.toLowerCase().includes(q)
    );
  }, [emails, searchQuery]);

  // Keyboard navigation (j/k or arrow up/down)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, filteredEmails.length - 1));
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && focusIndex >= 0 && focusIndex < filteredEmails.length) {
        setActiveEmail(filteredEmails[focusIndex]);
      }
      if (e.key === 'x' && focusIndex >= 0 && focusIndex < filteredEmails.length) {
        toggleSelect(filteredEmails[focusIndex].id);
      }
      if (e.key === 's' && focusIndex >= 0 && focusIndex < filteredEmails.length) {
        toggleStar(filteredEmails[focusIndex].id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusIndex, filteredEmails, setActiveEmail, toggleSelect, toggleStar]);

  // Scroll focused into view
  useEffect(() => {
    if (focusIndex >= 0 && listRef.current) {
      const el = listRef.current.children[focusIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusIndex]);

  const allSelected = filteredEmails.length > 0 && selectedIds.size === filteredEmails.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const labelNames: Record<string, string> = {
    INBOX: 'Inbox', STARRED: 'Starred', SENT: 'Sent', DRAFT: 'Drafts',
    SPAM: 'Spam', TRASH: 'Trash', IMPORTANT: 'Important',
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl p-3.5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-3">
              <div className="skeleton h-4 w-4 rounded" />
              <div className="skeleton h-7 w-7 rounded-full" />
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton ml-auto h-3 w-14 rounded" />
            </div>
            <div className="ml-14 mt-2 space-y-1.5">
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredEmails.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-tn-bg-highlight">
          {searchQuery ? <span className="text-3xl">🔍</span> : <Inbox size={32} className="text-tn-fg-muted" />}
        </div>
        <h3 className="text-base font-bold text-tn-fg">{searchQuery ? 'No results' : `${labelNames[activeLabel] || activeLabel} is empty`}</h3>
        <p className="mt-1 text-sm text-tn-fg-muted">{searchQuery ? `Nothing matches "${searchQuery}"` : 'No emails here yet'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-tn-border px-3 py-1.5">
        <button onClick={() => allSelected ? deselectAll() : selectAll()} className="flex items-center rounded-md p-1 text-tn-fg-muted hover:text-tn-fg">
          {allSelected ? <CheckSquare size={15} className="text-tn-blue" /> : someSelected ? <Minus size={15} className="text-tn-blue" /> : <Square size={15} />}
        </button>
        {selectedIds.size > 0 && <span className="rounded-full bg-tn-blue/20 px-2 py-0.5 text-[10px] font-semibold text-tn-blue">{selectedIds.size}</span>}
        <div className="flex-1" />
        <span className="text-[10px] text-tn-fg-muted">{filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center">
          <ArrowUpDown size={11} className="text-tn-fg-muted mr-1" />
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
            className="bg-transparent text-[10px] text-tn-fg-muted outline-none cursor-pointer">
            <option value="newest">Newest</option><option value="oldest">Oldest</option>
            <option value="sender">Sender</option><option value="subject">Subject</option>
          </select>
        </div>
      </div>

      {/* Email rows */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredEmails.map((email, index) => {
            const isActive = activeEmail?.id === email.id;
            const isSelected = selectedIds.has(email.id);
            const isFocused = index === focusIndex;
            return (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6, height: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.012, 0.2) }}
                onClick={() => { setActiveEmail(email); setFocusIndex(index); }}
                onContextMenu={(e) => openMenu(e, email.id)}
                className={`group relative flex cursor-pointer items-start gap-2.5 border-b border-tn-border/20 px-3 py-3 transition-all duration-100 ${
                  isActive ? 'bg-tn-blue/10 border-l-2 !border-l-tn-blue' :
                  isFocused ? 'bg-tn-bg-highlight/60 ring-1 ring-inset ring-tn-blue/20' :
                  isSelected ? 'bg-tn-selection/40' :
                  email.isRead ? 'hover:bg-tn-bg-highlight/30' : 'bg-tn-bg-dark/20 hover:bg-tn-bg-highlight/30'
                }`}
              >
                {/* Unread dot */}
                {!email.isRead && <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-tn-blue shadow-sm shadow-tn-blue/50" />}

                {/* Checkbox */}
                <button onClick={e => { e.stopPropagation(); toggleSelect(email.id); }}
                  className="mt-1 shrink-0 text-tn-fg-muted hover:text-tn-fg">
                  {isSelected ? <CheckSquare size={15} className="text-tn-blue" /> : <Square size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>

                {/* Star */}
                <button onClick={e => { e.stopPropagation(); toggleStar(email.id); }} className="mt-1 shrink-0">
                  <Star size={14} className={email.isStarred ? 'fill-tn-yellow text-tn-yellow' : 'text-tn-fg-gutter hover:text-tn-yellow transition-colors'} />
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-tn-blue/20 text-tn-blue' : 'bg-gradient-to-br from-tn-purple/20 to-tn-blue/20 text-tn-fg-dark'
                    }`}>
                      {email.from.name.charAt(0)}
                    </div>
                    <span className={`flex-1 truncate text-sm ${email.isRead ? 'text-tn-fg-dark' : 'font-semibold text-tn-fg'}`}>
                      {email.from.name}
                    </span>
                    {email.hasAttachments && <Paperclip size={11} className="shrink-0 text-tn-fg-muted" />}
                    <span className="shrink-0 text-[10px] text-tn-fg-muted">{formatDate(email.date)}</span>
                  </div>
                  <p className={`truncate text-xs mt-0.5 ${email.isRead ? 'text-tn-fg-muted' : 'text-tn-fg-dark font-medium'}`}>{email.subject}</p>
                  <p className="truncate text-[11px] text-tn-fg-muted/60 mt-0.5">{email.snippet}</p>
                  {email.hasAttachments && email.attachments.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="rounded-md bg-tn-bg-highlight/50 px-2 py-0.5 text-[9px] text-tn-fg-muted border border-tn-border/20">
                        📎 {email.attachments[0].filename}{email.attachments.length > 1 ? ` +${email.attachments.length - 1}` : ''} ({formatSize(email.attachments[0].size)})
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <ContextMenu x={menu.x} y={menu.y} emailId={menu.emailId} onClose={closeMenu} />
    </div>
  );
}
