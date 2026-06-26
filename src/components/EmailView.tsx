import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Trash2, Archive, MailOpen, Mail,
  Paperclip, Reply, Forward, MoreHorizontal, Tag, Clock, Download,
  ChevronDown, AlarmClock
} from 'lucide-react';
import { useStore } from '../stores/useStore';
import { InlineReply } from './InlineReply';
import { SnoozePicker } from './SnoozePicker';

function formatFullDate(d: Date) { return d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function relativeDate(d: Date) {
  const diff = Date.now() - d.getTime(); const m = Math.floor(diff/60000);
  if(m<1) return 'Just now'; if(m<60) return `${m}m ago`; const h=Math.floor(m/60);
  if(h<24) return `${h}h ago`; const dy=Math.floor(h/24); if(dy<7) return `${dy}d ago`;
  return d.toLocaleDateString([],{month:'short',day:'numeric'});
}
function formatSize(b:number){return b<1024?`${b} B`:b<1048576?`${(b/1024).toFixed(0)} KB`:`${(b/1048576).toFixed(1)} MB`}
function readingTime(t:string){return Math.max(1,Math.ceil(t.split(/\s+/).length/200))}

const fileIcons:Record<string,string>={pdf:'📄',png:'🖼️',jpg:'🖼️',svg:'🎨',csv:'📊',xlsx:'📊',fig:'🎨',md:'📝',pptx:'📽️',yaml:'⚙️'};

function nameColor(name: string): string {
  const c = ['avatar-personal','avatar-work','avatar-service','avatar-social','avatar-alert'];
  let h=0; for(let i=0;i<name.length;i++) h=name.charCodeAt(i)+((h<<5)-h);
  return c[Math.abs(h)%c.length];
}

export function EmailView() {
  const { activeEmail, setActiveEmail, toggleStar, markAsRead, markAsUnread, removeEmails, notify, setShowEmailView, emailFontSize } = useStore();
  const [showReply, setShowReply] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const pct = el.scrollHeight > el.clientHeight ? el.scrollTop / (el.scrollHeight - el.clientHeight) : 0;
      setScrollPct(Math.min(pct, 1));
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [activeEmail]);

  if (!activeEmail) return null;

  const handleBack = () => { setShowReply(false); setActiveEmail(null); setShowEmailView(false); };
  const handleDelete = () => { removeEmails([activeEmail.id]); notify('success', 'Moved to trash'); handleBack(); };
  const handleArchive = () => { removeEmails([activeEmail.id]); notify('success', 'Archived'); handleBack(); };
  const ext = (f:string) => f.split('.').pop()?.toLowerCase()||'';
  const mins = readingTime(activeEmail.body);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="flex h-full flex-col bg-tn-bg-darker relative">

      {/* Reading progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-tn-bg-highlight">
        <motion.div className="h-full bg-gradient-to-r from-tn-blue to-tn-purple rounded-full"
          style={{ width: `${scrollPct * 100}%` }} transition={{ duration: 0.05 }} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-tn-border px-3 py-2 bg-tn-bg-dark/50 backdrop-blur-sm">
        <button onClick={handleBack} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg" data-tip="Back to list">
          <ArrowLeft size={16} /><span className="hidden sm:inline">Back</span>
        </button>

        {/* Reading time badge */}
        <span className="hidden sm:flex items-center gap-1 badge-muted rounded-full px-2 py-0.5 text-[9px] font-medium ml-1">
          <Clock size={9} /> {mins} min read
        </span>

        <div className="flex-1" />

        {/* Snooze */}
        <div className="relative">
          <Btn icon={<AlarmClock size={15} />} tip="Snooze" onClick={() => setShowSnooze(!showSnooze)} />
          <AnimatePresence>
            {showSnooze && <div className="absolute right-0 top-10 z-50"><SnoozePicker emailId={activeEmail.id} onClose={() => { setShowSnooze(false); handleBack(); }} /></div>}
          </AnimatePresence>
        </div>

        <Btn icon={<Archive size={15} />} tip="Archive" onClick={handleArchive} />
        <Btn icon={<Trash2 size={15} />} tip="Delete" onClick={handleDelete} hoverColor="hover:text-tn-red" />
        <Btn icon={activeEmail.isRead ? <Mail size={15} /> : <MailOpen size={15} />} tip={activeEmail.isRead ? 'Mark unread' : 'Mark read'}
          onClick={() => { activeEmail.isRead ? markAsUnread([activeEmail.id]) : markAsRead([activeEmail.id]); notify('info', activeEmail.isRead ? 'Marked unread' : 'Marked read'); }} />
        <Btn icon={<Star size={15} className={activeEmail.isStarred ? 'fill-tn-yellow text-tn-yellow' : ''} />} tip={activeEmail.isStarred ? 'Unstar' : 'Star'}
          onClick={() => toggleStar(activeEmail.id)} />

        {/* More dropdown */}
        <div className="relative">
          <Btn icon={<MoreHorizontal size={15} />} tip="More actions" onClick={() => setShowMore(!showMore)} />
          <AnimatePresence>
            {showMore && (
              <motion.div initial={{opacity:0,y:-4,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-4}}
                className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-tn-border bg-tn-bg-dark p-1.5 shadow-2xl">
                {[
                  { label: 'Print', action: () => { window.print(); } },
                  { label: 'Copy email address', action: () => { navigator.clipboard.writeText(activeEmail.from.email); notify('success','Email copied'); } },
                  { label: 'Copy subject', action: () => { navigator.clipboard.writeText(activeEmail.subject); notify('success','Subject copied'); } },
                  { label: 'Block sender', action: () => notify('info',`Blocked ${activeEmail.from.name}`) },
                ].map(item => (
                  <button key={item.label} onClick={() => { item.action(); setShowMore(false); }}
                    className="flex w-full rounded-lg px-3 py-2 text-xs text-tn-fg-dark hover:bg-tn-bg-highlight hover:text-tn-fg">{item.label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Email body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Subject */}
          <h1 className="text-xl font-bold text-tn-fg leading-snug sm:text-2xl">{activeEmail.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activeEmail.labels.map(l => (
              <span key={l} className="badge-muted rounded-full px-2 py-0.5 text-[9px] font-medium inline-flex items-center gap-1"><Tag size={8} /> {l}</span>
            ))}
            {activeEmail.isImportant && <span className="badge-warning rounded-full px-2 py-0.5 text-[9px] font-bold">Important</span>}
            {activeEmail.isStarred && <span className="badge-info rounded-full px-2 py-0.5 text-[9px] font-bold">⭐ Starred</span>}
          </div>

          {/* Sender card */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-tn-bg-dark/40 p-4 border border-tn-border/20">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${nameColor(activeEmail.from.name)}`}>
              {activeEmail.from.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-tn-fg">{activeEmail.from.name}</span>
                <span className="text-[11px] text-tn-fg-muted">&lt;{activeEmail.from.email}&gt;</span>
                <span className={`ml-auto text-[10px] tabular-nums ${(Date.now()-activeEmail.date.getTime())<3600000?'text-tn-green font-semibold':'text-tn-fg-muted'}`}>
                  {relativeDate(activeEmail.date)}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-tn-fg-muted">To: {activeEmail.to.map(t => t.name || t.email).join(', ')}</div>
              <div className="mt-0.5 text-[10px] text-tn-fg-muted/50">{formatFullDate(activeEmail.date)}</div>
            </div>
          </div>

          {/* Attachments */}
          {activeEmail.hasAttachments && activeEmail.attachments.length > 0 && (
            <div className="mt-4 rounded-2xl border border-tn-border/20 bg-tn-bg-dark/20 p-4">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-tn-fg-muted">
                <Paperclip size={13} />
                {activeEmail.attachments.length} file{activeEmail.attachments.length>1?'s':''}
                <span className="text-[10px] font-normal text-tn-fg-muted/50">
                  ({formatSize(activeEmail.attachments.reduce((a,att) => a+att.size,0))})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeEmail.attachments.map(att => (
                  <motion.div key={att.id} whileHover={{scale:1.02}}
                    className="group flex items-center gap-2.5 rounded-xl border border-tn-border/20 bg-tn-bg-highlight/50 px-3 py-2.5 cursor-pointer hover:border-tn-blue/20 hover:shadow-md transition-all">
                    <span className="text-lg">{fileIcons[ext(att.filename)]||'📎'}</span>
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
          <div className="mt-5 rounded-2xl border border-tn-border/15 bg-tn-bg/15 p-6 sm:p-8">
            <div className="text-tn-fg-dark leading-[1.85] whitespace-pre-wrap" style={{ fontSize: `${emailFontSize}px` }}>
              {activeEmail.body}
            </div>
          </div>

          {/* Inline Reply */}
          <AnimatePresence>
            {showReply && (
              <InlineReply recipientName={activeEmail.from.name} recipientEmail={activeEmail.from.email}
                onClose={() => setShowReply(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply bar */}
      <div className="border-t border-tn-border bg-tn-bg-dark/60 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2 mx-auto max-w-2xl">
          <motion.button onClick={() => setShowReply(!showReply)} whileHover={{scale:1.03}} whileTap={{scale:0.97}}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              showReply ? 'bg-tn-blue text-white shadow-md shadow-tn-blue/20' : 'bg-tn-blue/15 text-tn-blue hover:bg-tn-blue/25'
            }`}>
            <Reply size={15} /> Reply
          </motion.button>
          <button className="flex items-center gap-2 rounded-xl bg-tn-bg-highlight/50 px-4 py-2.5 text-sm text-tn-fg-dark hover:bg-tn-bg-highlight transition-colors">
            <Forward size={15} /> Forward
          </button>
          <div className="flex-1" />
          <button onClick={() => setShowReply(!showReply)}
            className="hidden sm:flex items-center gap-1 rounded-xl bg-tn-bg-highlight/30 px-3 py-2 text-[10px] text-tn-fg-muted hover:text-tn-fg transition-colors">
            <ChevronDown size={11} className={showReply ? 'rotate-180 transition-transform' : 'transition-transform'} />
            {showReply ? 'Hide reply' : 'Quick reply'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Btn({icon,tip,onClick,hoverColor='hover:text-tn-fg'}:{icon:React.ReactNode;tip:string;onClick:()=>void;hoverColor?:string}) {
  return <button onClick={onClick} data-tip={tip} className={`rounded-lg p-2 text-tn-fg-muted hover:bg-tn-bg-highlight transition-colors ${hoverColor}`}>{icon}</button>;
}
