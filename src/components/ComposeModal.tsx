import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Minimize2, Maximize2, Trash2, Bold, Italic, Link, List, Image } from 'lucide-react';
import { useStore } from '../stores/useStore';

export function ComposeModal() {
  const { showCompose, setShowCompose, notify, sendEmail } = useStore();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  if (!showCompose) return null;

  const handleSend = async () => {
    if (!to.trim()) { notify('warning', 'Add a recipient'); return; }
    if (!subject.trim()) { notify('warning', 'Add a subject'); return; }
    setSending(true);
    try {
      await sendEmail(to.trim(), subject, body, cc || undefined, bcc || undefined);
      setTo(''); setCc(''); setBcc(''); setSubject(''); setBody(''); setShowCcBcc(false);
      setShowCompose(false);
    } catch (err: any) {
      notify('error', err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    if (body.trim() || subject.trim()) notify('info', 'Draft discarded');
    setTo(''); setCc(''); setBcc(''); setSubject(''); setBody(''); setShowCcBcc(false);
    setShowCompose(false);
  };

  return (
    <AnimatePresence>
      {showCompose && (
        <>
          {!minimized && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMinimized(true)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          )}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed z-50 overflow-hidden rounded-2xl border border-tn-border shadow-2xl ${
              minimized ? 'bottom-4 right-4 w-80' : 'bottom-4 right-4 w-[580px] max-w-[calc(100vw-24px)] sm:bottom-auto sm:right-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2'
            }`}
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-tn-bg-dark via-tn-bg to-tn-bg-dark px-4 py-2.5 border-b border-tn-border/50">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-tn-blue to-tn-purple">
                <Send size={10} className="text-white" />
              </div>
              <span className="flex-1 text-sm font-semibold text-tn-fg truncate">
                {minimized && subject ? subject : 'New Message'}
              </span>
              <button onClick={() => setMinimized(!minimized)} className="rounded-md p-1 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg">
                {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button onClick={handleDiscard} className="rounded-md p-1 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-red">
                <X size={13} />
              </button>
            </div>
            {!minimized && (
              <div className="bg-tn-bg-darker">
                <div className="flex items-center border-b border-tn-border/30 px-4 py-2">
                  <span className="w-10 text-[10px] text-tn-fg-muted font-medium">To</span>
                  <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" autoFocus
                    className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none" />
                  {!showCcBcc && <button onClick={() => setShowCcBcc(true)} className="text-[10px] text-tn-fg-muted hover:text-tn-blue transition-colors">Cc/Bcc</button>}
                </div>
                <AnimatePresence>
                  {showCcBcc && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="flex items-center border-b border-tn-border/30 px-4 py-2">
                        <span className="w-10 text-[10px] text-tn-fg-muted font-medium">Cc</span>
                        <input type="email" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com" className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none" />
                      </div>
                      <div className="flex items-center border-b border-tn-border/30 px-4 py-2">
                        <span className="w-10 text-[10px] text-tn-fg-muted font-medium">Bcc</span>
                        <input type="email" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com" className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center border-b border-tn-border/30 px-4 py-2">
                  <span className="w-10 text-[10px] text-tn-fg-muted font-medium">Sub</span>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject"
                    className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none" />
                </div>
                <div className="flex items-center gap-0.5 border-b border-tn-border/30 px-3 py-1">
                  {[Bold, Italic, Link, List, Image].map((Icon, i) => (
                    <button key={i} className="rounded-md p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg transition-colors"><Icon size={13} /></button>
                  ))}
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={10}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-tn-fg placeholder-tn-fg-muted/30 outline-none leading-relaxed" />
                <div className="flex items-center gap-2 border-t border-tn-border/30 bg-tn-bg-dark px-4 py-2.5">
                  <motion.button onClick={handleSend} disabled={sending}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-tn-blue/20 disabled:opacity-50">
                    {sending ? (
                      <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Sending...</>
                    ) : (<><Send size={13} /> Send</>)}
                  </motion.button>
                  <button className="rounded-lg p-2 text-tn-fg-muted hover:text-tn-fg"><Paperclip size={15} /></button>
                  <div className="flex-1" />
                  <button onClick={handleDiscard} className="rounded-lg p-2 text-tn-fg-muted hover:text-tn-red"><Trash2 size={15} /></button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
