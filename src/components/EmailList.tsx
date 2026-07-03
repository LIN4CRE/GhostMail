import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Paperclip, CheckSquare, Square, Minus, ArrowUpDown, Inbox } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { ContextMenu, useContextMenu } from './ContextMenu';

// Consistent color from name (deterministic hash)
function nameColor(name: string): string {
  const colors = ['avatar-personal', 'avatar-work', 'avatar-service', 'avatar-social', 'avatar-alert'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
}

// Color the timestamp — recent=bright, old=dim
function dateColor(date: Date): string {
  const hrs = (Date.now() - date.getTime()) / 3600000;
  if (hrs < 1) return 'text-tn-green font-semibold';
  if (hrs < 6) return 'text-tn-teal';
  if (hrs < 24) return 'text-tn-fg-dark';
  return 'text-tn-fg-muted';
}

function formatSize(b: number) { return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`; }

// Categorize senders for color-coding
function senderCategory(email: string): 'service' | 'person' {
  if (email.includes('noreply') || email.includes('no-reply') || email.includes('notification') || email.includes('digest') || email.includes('newsletter') || email.includes('mailer')) return 'service';
  return 'person';
}

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i => Math.min(i + 1, filteredEmails.length - 1)); }
      if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && focusIndex >= 0 && focusIndex < filteredEmails.length) setActiveEmail(filteredEmails[focusIndex]);
      if (e.key === 'x' && focusIndex >= 0) toggleSelect(filteredEmails[focusIndex].id);
      if (e.key === 's' && focusIndex >= 0) toggleStar(filteredEmails[focusIndex].id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusIndex, filteredEmails, setActiveEmail, toggleSelect, toggleStar]);

  useEffect(() => {
    if (focusIndex >= 0 && listRef.current) {
      (listRef.current.children[focusIndex] as HTMLElement)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusIndex]);

  const allSelected = filteredEmails.length > 0 && selectedIds.size === filteredEmails.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const unreadCount = filteredEmails.filter(e => !e.isRead).length;

  const labelNames: Record<string, string> = {
    INBOX: 'Inbox', STARRED: 'Starred', SENT: 'Sent', DRAFT: 'Drafts',
    SPAM: 'Spam', TRASH: 'Trash', IMPORTANT: 'Important',
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl p-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-32 rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-2.5 w-full rounded" />
              </div>
              <div className="skeleton h-3 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredEmails.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-tn-bg-highlight border border-tn-border/30">
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
      <div className="flex items-center gap-2 border-b border-tn-border px-3 py-1.5 bg-tn-bg-dark/50">
        <button onClick={() => allSelected ? deselectAll() : selectAll()} className="flex items-center rounded-md p-1 text-tn-fg-muted hover:text-tn-fg" data-tip="Select all">
          {allSelected ? <CheckSquare size={15} className="text-tn-blue" /> : someSelected ? <Minus size={15} className="text-tn-blue" /> : <Square size={15} />}
        </button>
        {selectedIds.size > 0 && <span className="badge-info rounded-full px-2 py-0.5 text-[10px] font-bold">{selectedIds.size} selected</span>}

        <div className="flex-1" />

        {/* Quick stats bar */}
        <div className="hidden sm:flex items-center gap-2 text-[10px]">
          <span className="text-tn-fg-muted">{filteredEmails.length} emails</span>
          {unreadCount > 0 && (
            <span className="badge-warning rounded-full px-1.5 py-0.5 font-semibold">{unreadCount} unread</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ArrowUpDown size={11} className="text-tn-fg-muted" />
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
            className="bg-transparent text-[10px] text-tn-fg-muted outline-none cursor-pointer pr-1">
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
            const cat = senderCategory(email.from.email);
            const isService = cat === 'service';

            return (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.01, 0.15) }}
                onClick={() => { setActiveEmail(email); setFocusIndex(index); }}
                onContextMenu={(e) => openMenu(e, email.id)}
                className={`group relative flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition-all duration-100 border-b border-tn-border/10 ${
                  isActive ? 'bg-tn-blue/[0.08] border-l-[3px] !border-l-tn-blue !pl-[9px]' :
                  isFocused ? 'bg-tn-bg-highlight/50 ring-1 ring-inset ring-tn-blue/15' :
                  isSelected ? 'bg-tn-selection/30' :
                  !email.isRead ? 'bg-tn-bg-dark/30' : ''
                } hover:bg-tn-bg-highlight/30`}
              >
                {/* Checkbox — visible on hover or when selected */}
                <div className="flex flex-col items-center gap-1 mt-0.5 shrink-0">
                  <button onClick={e => { e.stopPropagation(); toggleSelect(email.id); }}
                    className="text-tn-fg-muted hover:text-tn-fg">
                    {isSelected ? <CheckSquare size={14} className="text-tn-blue" /> : <Square size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); toggleStar(email.id); }} data-tip={email.isStarred ? 'Unstar' : 'Star'}>
                    <Star size={13} className={email.isStarred ? 'fill-tn-yellow text-tn-yellow' : 'text-tn-fg-gutter hover:text-tn-yellow transition-colors'} />
                  </button>
                </div>

                {/* Avatar with category color */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ${
                  isActive ? 'ring-2 ring-tn-blue/30' : ''
                } ${nameColor(email.from.name)}`}>
                  {email.from.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {/* Unread indicator */}
                    {!email.isRead && <div className="h-2 w-2 shrink-0 rounded-full bg-tn-blue shadow-sm shadow-tn-blue/40" />}

                    <span className={`truncate text-[13px] leading-tight ${email.isRead ? 'text-tn-fg-dark' : 'font-semibold text-tn-fg'}`}>
                      {email.from.name}
                    </span>

                    {/* Service badge */}
                    {isService && <span className="badge-muted rounded px-1 py-0 text-[8px] font-medium shrink-0">AUTO</span>}

                    {/* Attachment */}
                    {email.hasAttachments && (
                      <span className="shrink-0 text-tn-fg-muted" data-tip={`${email.attachments.length} attachment${email.attachments.length > 1 ? 's' : ''}`}>
                        <Paperclip size={11} />
                      </span>
                    )}

                    {/* Timestamp — color-coded by age */}
                    <span className={`ml-auto shrink-0 text-[10px] tabular-nums ${dateColor(email.date)}`} data-tip={email.date.toLocaleString()}>
                      {formatDate(email.date)}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className={`truncate text-[12px] leading-snug ${email.isRead ? 'text-tn-fg-muted' : 'text-tn-fg-dark'}`}>
                    {email.subject}
                  </p>

                  {/* Snippet */}
                  <p className="truncate text-[11px] text-tn-fg-muted/50 leading-snug mt-0.5">
                    {email.snippet}
                  </p>

                  {/* Attachment chip */}
                  {email.hasAttachments && email.attachments.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {email.attachments.slice(0, 2).map(att => (
                        <span key={att.id} className="inline-flex items-center gap-1 rounded-md bg-tn-bg-highlight/50 px-1.5 py-0.5 text-[9px] text-tn-fg-muted border border-tn-border/15">
                          📎 {att.filename.length > 18 ? att.filename.slice(0, 15) + '...' : att.filename}
                          <span className="text-tn-fg-muted/50">({formatSize(att.size)})</span>
                        </span>
                      ))}
                      {email.attachments.length > 2 && (
                        <span className="text-[9px] text-tn-fg-muted">+{email.attachments.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <ContextMenu x={menu.x} y={menu.y} emailId={menu.emailId} onClose={closeMenu} />
    </div>
  );
}
