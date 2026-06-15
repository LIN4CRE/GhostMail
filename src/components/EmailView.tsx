import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Trash2, Archive, MailOpen, Mail,
  Paperclip, Reply, Forward, MoreHorizontal, Tag, Clock, Download,
  ChevronDown, AlarmClock
} from 'lucide-react';
import { useStore } from '../stores/useStore';
import { InlineReply } from './InlineReply';
import { SnoozePicker } from './SnoozePicker';

function formatFullDate(d: Date) {
  return d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function relativeDate(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function formatSize(b: number) { return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`; }
function readingTime(text: string) { const words = text.split(/\s+/).length; return Math.max(1, Math.ceil(words / 200)); }

const fileIcons: Record<string, string> = {
  pdf: '📄', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', svg: '🎨', csv: '📊',
  xlsx: '📊', fig: '🎨', md: '📝', pptx: '📽️', sketch: '🎨', yaml: '⚙️',
};

export function EmailView() {
  const { activeEmail, setActiveEmail, toggleStar, markAsRead, markAsUnread, removeEmails, notify, setShowEmailView } = useStore();
  const [showReply, setShowReply] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!activeEmail) return null;

  const handleBack = () => { setShowReply(false); setActiveEmail(null); setShowEmailView(false); };
  const handleDelete = () => { removeEmails([activeEmail.id]); notify('success', 'Moved to trash'); handleBack(); };
  const handleArchive = () => { removeEmails([activeEmail.id]); notify('success', 'Archived'); handleBack(); };
  const handleToggleRead = () => {
    activeEmail.isRead ? markAsUnread([activeEmail.id]) : markAsRead([activeEmail.id]);
    notify('info', activeEmail.isRead ? 'Marked unread' : 'Marked read');
  };

  const ext = (f: string) => f.split('.').pop()?.toLowerCase() || '';
  const mins = readingTime(activeEmail.body);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }} className="flex h-full flex-col bg-tn-bg-darker">

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-tn-border px-3 py-2">
        <button onClick={handleBack} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg">
          <ArrowLeft size={16} /><span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex-1" />

        {/* Snooze */}
        <div className="relative">
          <Btn icon={<AlarmClock size={15} />} label="Snooze" onClick={() => setShowSnooze(!showSnooze)} />
          <AnimatePresence>
            {showSnooze && (
              <div className="absolute right-0 top-10 z-50">
                <SnoozePicker emailId={activeEmail.id} onClose={() => { setShowSnooze(false); handleBack(); }} />
              </div>
            )}
          </AnimatePresence>
        </div>

        <Btn icon={<Archive size={15} />} label="Archive" onClick={handleArchive} />
        <Btn icon={<Trash2 size={15} />} label="Delete" onClick={handleDelete} className="hover:!text-tn-red" />
        <Btn icon={activeEmail.isRead ? <Mail size={15} /> : <MailOpen size={15} />} label="Read" onClick={handleToggleRead} />
        <Btn icon={<Star size={15} className={activeEmail.isStarred ? 'fill-tn-yellow text-tn-yellow' : ''} />} label="Star" onClick={() => toggleStar(activeEmail.id)} />

        {/* More dropdown */}
        <div className="relative">
          <Btn icon={<MoreHorizontal size={15} />} label="More" onClick={() => setShowMore(!showMore)} />
          <AnimatePresence>
            {showMore && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-tn-border bg-tn-bg-dark p-1.5 shadow-2xl">
                {[
                  { label: 'Print', action: () => notify('info', 'Print dialog would open') },
                  { label: 'Download as .eml', action: () => notify('info', 'Download started') },
                  { label: 'Block sender', action: () => notify('info', `Blocked ${activeEmail.from.name}`) },
                  { label: 'Report phishing', action: () => notify('warning', 'Reported as phishing') },
                ].map(item => (
                  <button key={item.label} onClick={() => { item.action(); setShowMore(false); }}
                    className="flex w-full rounded-lg px-3 py-2 text-xs text-tn-fg-dark hover:bg-tn-bg-highlight hover:text-tn-fg transition-colors">
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Subject */}
          <h1 className="text-xl font-bold text-tn-fg leading-snug sm:text-2xl">{activeEmail.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {activeEmail.labels.map(l => (
              <span key={l} className="inline-flex items-center gap-1 rounded-full bg-tn-bg-highlight px-2.5 py-0.5 text-[10px] font-medium text-tn-fg-muted">
                <Tag size={9} /> {l}
              </span>
            ))}
            <span className="flex items-center gap-1 rounded-full bg-tn-bg-highlight/50 px-2 py-0.5 text-[10px] text-tn-fg-muted">
              <Clock size={9} /> {mins} min read
            </span>
          </div>

          {/* Sender */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-tn-bg-dark/60 p-4 border border-tn-border/30">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-sm font-bold text-white shadow-md">
              {activeEmail.from.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-tn-fg">{activeEmail.from.name}</span>
                <span className="text-xs text-tn-fg-muted">&lt;{activeEmail.from.email}&gt;</span>
                <span className="ml-auto text-[10px] text-tn-fg-muted">{relativeDate(activeEmail.date)}</span>
              </div>
              <div className="mt-0.5 text-xs text-tn-fg-muted">To: {activeEmail.to.map(t => t.name || t.email).join(', ')}</div>
              <div className="mt-0.5 text-[10px] text-tn-fg-muted/60">{formatFullDate(activeEmail.date)}</div>
            </div>
          </div>

          {/* Attachments */}
          {activeEmail.hasAttachments && activeEmail.attachments.length > 0 && (
            <div className="mt-4 rounded-2xl border border-tn-border/30 bg-tn-bg-dark/30 p-4">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-tn-fg-muted">
                <Paperclip size={13} /> {activeEmail.attachments.length} Attachment{activeEmail.attachments.length > 1 ? 's' : ''}
                <span className="text-[10px] font-normal text-tn-fg-muted/60">
                  ({formatSize(activeEmail.attachments.reduce((a, att) => a + att.size, 0))} total)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeEmail.attachments.map(att => (
                  <motion.div key={att.id} whileHover={{ scale: 1.03 }}
                    className="group flex items-center gap-2.5 rounded-xl border border-tn-border/30 bg-tn-bg-highlight px-3 py-2.5 cursor-pointer hover:border-tn-blue/30 hover:shadow-md transition-all">
                    <span className="text-lg">{fileIcons[ext(att.filename)] || '📎'}</span>
                    <div>
                      <p className="text-xs font-medium text-tn-fg">{att.filename}</p>
                      <p className="text-[10px] text-tn-fg-muted">{formatSize(att.size)}</p>
                    </div>
                    <Download size={13} className="text-tn-fg-muted opacity-0 group-hover:opacity-100 ml-1 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="mt-5 rounded-2xl border border-tn-border/20 bg-tn-bg/20 p-6 sm:p-8">
            <div className="text-sm text-tn-fg-dark leading-[1.85] whitespace-pre-wrap">{activeEmail.body}</div>
          </div>

          {/* Inline Reply */}
          <AnimatePresence>
            {showReply && (
              <InlineReply
                recipientName={activeEmail.from.name}
                recipientEmail={activeEmail.from.email}
                onClose={() => setShowReply(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply bar */}
      <div className="border-t border-tn-border bg-tn-bg-dark px-4 py-3">
        <div className="flex items-center gap-2 mx-auto max-w-2xl">
          <motion.button onClick={() => setShowReply(!showReply)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              showReply ? 'bg-tn-blue text-white shadow-md shadow-tn-blue/20' : 'bg-tn-blue/20 text-tn-blue hover:bg-tn-blue/30'
            }`}>
            <Reply size={15} /> Reply
          </motion.button>
          <button className="flex items-center gap-2 rounded-xl bg-tn-bg-highlight px-4 py-2.5 text-sm text-tn-fg-dark hover:bg-tn-bg-float transition-colors">
            <Forward size={15} /> Forward
          </button>
          <div className="flex-1" />
          <button onClick={() => setShowReply(!showReply)}
            className="hidden sm:flex items-center gap-1 rounded-xl bg-tn-bg-highlight px-3 py-2 text-xs text-tn-fg-muted hover:text-tn-fg transition-colors">
            <ChevronDown size={12} className={showReply ? 'rotate-180 transition-transform' : 'transition-transform'} />
            {showReply ? 'Hide' : 'Quick reply'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Btn({ icon, label, onClick, className = '' }: { icon: React.ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} title={label} className={`rounded-lg p-2 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg transition-colors ${className}`}>
      {icon}
    </button>
  );
}
