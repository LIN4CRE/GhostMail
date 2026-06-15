import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Paperclip, Smile } from 'lucide-react';
import { useStore } from '../stores/useStore';

export function InlineReply({ recipientName, recipientEmail, onClose }: {
  recipientName: string; recipientEmail: string; onClose: () => void;
}) {
  const { notify } = useStore();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!body.trim()) { notify('warning', 'Type a reply first'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setBody('');
    onClose();
    notify('success', `Reply sent to ${recipientName} ✨`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      className="mt-4 rounded-2xl border border-tn-blue/20 bg-tn-bg-dark overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-tn-border/50 px-4 py-2.5">
        <span className="text-xs text-tn-fg-muted">To:</span>
        <span className="rounded-full bg-tn-bg-highlight px-2.5 py-0.5 text-xs text-tn-fg-dark">
          {recipientName} &lt;{recipientEmail}&gt;
        </span>
        <div className="flex-1" />
        <button onClick={onClose} className="rounded-md p-1 text-tn-fg-muted hover:text-tn-fg"><X size={14} /></button>
      </div>

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your reply..."
        rows={4}
        autoFocus
        className="w-full resize-none bg-transparent px-4 py-3 text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none leading-relaxed"
      />

      <div className="flex items-center gap-2 border-t border-tn-border/50 px-4 py-2.5">
        <motion.button onClick={handleSend} disabled={sending}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-50">
          {sending ? (
            <><svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Sending</>
          ) : (
            <><Send size={12} /> Send Reply</>
          )}
        </motion.button>
        <button className="rounded-lg p-1.5 text-tn-fg-muted hover:text-tn-fg"><Paperclip size={14} /></button>
        <button className="rounded-lg p-1.5 text-tn-fg-muted hover:text-tn-fg"><Smile size={14} /></button>
        <div className="flex-1" />
        <span className="text-[10px] text-tn-fg-muted">{body.length} chars</span>
      </div>
    </motion.div>
  );
}
