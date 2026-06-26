import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Archive, MailOpen, Mail, AlertTriangle,
  Zap, CheckCircle2, Loader2, Search, Sparkles
} from 'lucide-react';
import { useStore } from '../stores/useStore';

const presetQueries = [
  { label: '📧 All newsletters', query: 'from:noreply OR from:newsletter', description: 'Bulk newsletters and digests', count: '~340' },
  { label: '🕐 Older than 6 months', query: 'older_than:6m', description: 'Emails older than 6 months', count: '~1.2k' },
  { label: '📢 Promotional', query: 'category:promotions', description: 'All promotional emails', count: '~890' },
  { label: '🔔 Notifications', query: 'from:notification', description: 'App notifications & updates', count: '~560' },
  { label: '📎 Large attachments', query: 'has:attachment larger:10M', description: 'Emails with large files', count: '~45' },
  { label: '📖 Read & old', query: 'is:read older_than:1m', description: 'Read emails older than 1 month', count: '~2.1k' },
  { label: '🛒 Receipts', query: 'subject:receipt OR subject:order', description: 'Shopping receipts & orders', count: '~120' },
  { label: '🗑️ Spam-like', query: 'from:noreply subject:unsubscribe', description: 'Potential spam emails', count: '~230' },
];

export function BulkActions() {
  const {
    selectedIds, deselectAll, selectByFilter,
    removeEmails, markAsRead, markAsUnread, notify,
    isBulkProcessing, bulkProgress, setBulkProcessing, updateBulkProgress
  } = useStore();

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  const selectedCount = selectedIds.size;

  const handleBulkAction = async (action: string) => {
    if (selectedCount === 0 && action !== 'confirm-delete') {
      notify('warning', 'No emails selected — pick a preset first');
      return;
    }
    const ids = [...selectedIds];

    switch (action) {
      case 'delete': setConfirmAction('delete'); break;
      case 'confirm-delete':
        setConfirmAction(null);
        setBulkProcessing(true, ids.length);
        for (let i = 0; i < ids.length; i += 8) { await new Promise(r => setTimeout(r, 80)); updateBulkProgress(Math.min(i + 8, ids.length)); }
        removeEmails(ids);
        setBulkProcessing(false);
        notify('success', `🗑️ Deleted ${ids.length} email(s)`);
        break;
      case 'archive':
        setBulkProcessing(true, ids.length);
        for (let i = 0; i < ids.length; i += 8) { await new Promise(r => setTimeout(r, 60)); updateBulkProgress(Math.min(i + 8, ids.length)); }
        removeEmails(ids);
        setBulkProcessing(false);
        notify('success', `📦 Archived ${ids.length} email(s)`);
        break;
      case 'mark-read':
        markAsRead(ids); deselectAll();
        notify('success', `✅ Marked ${ids.length} as read`);
        break;
      case 'mark-unread':
        markAsUnread(ids); deselectAll();
        notify('success', `📬 Marked ${ids.length} as unread`);
        break;
    }
  };

  const handlePresetClick = (query: string) => {
    setActivePreset(query);
    const q = query.toLowerCase();
    selectByFilter(e => {
      if (q.includes('noreply') || q.includes('newsletter')) return e.from.email.includes('noreply') || e.from.email.includes('notification');
      if (q.includes('older_than')) { const d = new Date(); d.setMonth(d.getMonth() - 6); return e.date < d; }
      if (q.includes('has:attachment')) return e.hasAttachments;
      if (q.includes('is:read')) return e.isRead;
      if (q.includes('notification')) return e.from.email.includes('noreply');
      return Math.random() > 0.5;
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-tn-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tn-orange to-tn-red shadow-md shadow-tn-red/15">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tn-fg">Bulk Actions</h2>
            <p className="text-xs text-tn-fg-muted">Mass manage your emails with smart queries</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Custom query */}
        <div className="rounded-2xl border border-tn-border bg-tn-bg-dark p-4">
          <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-tn-fg"><Search size={14} /> Custom Query</h3>
          <div className="flex gap-2">
            <input type="text" value={customQuery} onChange={e => setCustomQuery(e.target.value)}
              placeholder="e.g., from:github older_than:3m"
              className="flex-1 rounded-xl border border-tn-border bg-tn-bg-highlight px-3 py-2.5 text-sm text-tn-fg placeholder-tn-fg-muted/50 outline-none focus:border-tn-blue/50 transition-colors" />
            <motion.button onClick={() => handlePresetClick(customQuery || 'is:read')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-tn-blue/20 px-5 py-2.5 text-sm font-semibold text-tn-blue hover:bg-tn-blue/30 transition-colors">
              Find
            </motion.button>
          </div>
        </div>

        {/* Presets */}
        <div className="rounded-2xl border border-tn-border bg-tn-bg-dark p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-tn-fg"><Sparkles size={14} className="text-tn-yellow" /> Smart Presets</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {presetQueries.map(preset => (
              <motion.button key={preset.query} onClick={() => handlePresetClick(preset.query)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${
                  activePreset === preset.query ? 'border-tn-blue/50 bg-tn-blue/10 glow-blue' : 'border-tn-border/40 bg-tn-bg-highlight/40 hover:border-tn-border hover:bg-tn-bg-highlight'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-tn-fg">{preset.label}</span>
                  <span className="text-[10px] text-tn-fg-muted bg-tn-bg-darker rounded-full px-2 py-0.5">{preset.count}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-tn-fg-muted">{preset.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selection info */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-tn-blue/30 bg-tn-blue/10 p-4 glow-blue">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-tn-blue" />
                <span className="text-sm font-semibold text-tn-blue">{selectedCount} email{selectedCount !== 1 ? 's' : ''} selected</span>
                <button onClick={deselectAll} className="ml-auto rounded-lg px-2.5 py-1 text-xs text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg transition-colors">Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="rounded-2xl border border-tn-border bg-tn-bg-dark p-4">
          <h3 className="mb-3 text-sm font-semibold text-tn-fg">Actions</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: <Trash2 size={18} />, label: 'Delete', color: 'bg-tn-red/15 text-tn-red hover:bg-tn-red/25 border-tn-red/20', action: 'delete' },
              { icon: <Archive size={18} />, label: 'Archive', color: 'bg-tn-yellow/15 text-tn-yellow hover:bg-tn-yellow/25 border-tn-yellow/20', action: 'archive' },
              { icon: <MailOpen size={18} />, label: 'Mark Read', color: 'bg-tn-green/15 text-tn-green hover:bg-tn-green/25 border-tn-green/20', action: 'mark-read' },
              { icon: <Mail size={18} />, label: 'Unread', color: 'bg-tn-blue/15 text-tn-blue hover:bg-tn-blue/25 border-tn-blue/20', action: 'mark-unread' },
            ].map(btn => (
              <motion.button key={btn.action} onClick={() => handleBulkAction(btn.action)}
                disabled={selectedCount === 0 || isBulkProcessing}
                whileHover={selectedCount > 0 ? { scale: 1.05 } : {}} whileTap={selectedCount > 0 ? { scale: 0.95 } : {}}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm font-medium transition-all duration-200 ${btn.color} ${
                  selectedCount === 0 || isBulkProcessing ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer hover-lift'
                }`}>
                {btn.icon}
                <span className="text-xs">{btn.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {isBulkProcessing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-tn-purple/30 bg-tn-purple/10 p-4 glow-purple">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-tn-purple" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-tn-purple">Processing...</p>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-tn-bg-highlight">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-tn-purple to-tn-blue"
                      animate={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                      transition={{ duration: 0.1 }} />
                  </div>
                  <p className="mt-1 text-xs text-tn-fg-muted">{bulkProgress.current} / {bulkProgress.total}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm delete */}
        <AnimatePresence>
          {confirmAction === 'delete' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-tn-red/30 bg-tn-red/10 p-5 glow-red">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="shrink-0 text-tn-red mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-tn-red">Confirm Deletion</h4>
                  <p className="mt-1.5 text-xs text-tn-fg-muted leading-relaxed">
                    Permanently delete <span className="font-semibold text-tn-red">{selectedCount}</span> email{selectedCount !== 1 ? 's' : ''}? This cannot be undone.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <motion.button onClick={() => handleBulkAction('confirm-delete')}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="rounded-xl bg-tn-red px-5 py-2 text-xs font-bold text-white shadow-lg shadow-tn-red/20">
                      Delete Forever
                    </motion.button>
                    <button onClick={() => setConfirmAction(null)}
                      className="rounded-xl bg-tn-bg-highlight px-5 py-2 text-xs text-tn-fg-dark hover:bg-tn-bg-float transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
