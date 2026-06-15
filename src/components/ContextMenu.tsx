import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MailOpen, Mail, Star, Archive, Trash2, Tag, Clock,
  Copy, Forward, Reply
} from 'lucide-react';
import { useStore } from '../stores/useStore';

interface ContextMenuState {
  x: number;
  y: number;
  emailId: string | null;
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({ x: 0, y: 0, emailId: null });

  const openMenu = useCallback((e: React.MouseEvent, emailId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 350);
    setMenu({ x, y, emailId });
  }, []);

  const closeMenu = useCallback(() => setMenu({ x: 0, y: 0, emailId: null }), []);

  useEffect(() => {
    const handleClick = () => closeMenu();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('click', handleClick); window.removeEventListener('keydown', handleKey); };
  }, [closeMenu]);

  return { menu, openMenu, closeMenu };
}

export function ContextMenu({ x, y, emailId, onClose }: { x: number; y: number; emailId: string | null; onClose: () => void }) {
  const { emails, toggleStar, markAsRead, markAsUnread, removeEmails, notify } = useStore();

  if (!emailId) return null;
  const email = emails.find(e => e.id === emailId);
  if (!email) return null;

  const items = [
    { icon: <Reply size={14} />, label: 'Reply', action: () => notify('info', 'Reply opened') },
    { icon: <Forward size={14} />, label: 'Forward', action: () => notify('info', 'Forward opened') },
    null, // divider
    { icon: email.isRead ? <Mail size={14} /> : <MailOpen size={14} />, label: email.isRead ? 'Mark as unread' : 'Mark as read',
      action: () => { email.isRead ? markAsUnread([emailId]) : markAsRead([emailId]); notify('info', email.isRead ? 'Marked unread' : 'Marked read'); } },
    { icon: <Star size={14} className={email.isStarred ? 'text-tn-yellow' : ''} />, label: email.isStarred ? 'Unstar' : 'Star',
      action: () => toggleStar(emailId) },
    { icon: <Clock size={14} />, label: 'Snooze', action: () => notify('info', '⏰ Snoozed until tomorrow') },
    null,
    { icon: <Archive size={14} />, label: 'Archive', action: () => { removeEmails([emailId]); notify('success', 'Archived'); } },
    { icon: <Tag size={14} />, label: 'Add label', action: () => notify('info', 'Label picker opened') },
    { icon: <Copy size={14} />, label: 'Copy subject', action: () => { navigator.clipboard.writeText(email.subject); notify('success', 'Subject copied'); } },
    null,
    { icon: <Trash2 size={14} />, label: 'Delete', action: () => { removeEmails([emailId]); notify('success', 'Moved to trash'); }, danger: true },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.12 }}
        style={{ left: x, top: y }}
        className="fixed z-[100] w-52 rounded-xl border border-tn-border bg-tn-bg-dark p-1.5 shadow-2xl backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        {items.map((item, i) =>
          item === null ? (
            <div key={`d${i}`} className="mx-2 my-1 border-t border-tn-border/50" />
          ) : (
            <button
              key={item.label}
              onClick={() => { item.action(); onClose(); }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                (item as any).danger
                  ? 'text-tn-red hover:bg-tn-red/10'
                  : 'text-tn-fg-dark hover:bg-tn-bg-highlight hover:text-tn-fg'
              }`}
            >
              <span className="text-tn-fg-muted">{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </motion.div>
    </AnimatePresence>
  );
}
