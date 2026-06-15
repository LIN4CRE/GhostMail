import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Tag, Palette, Trash2 } from 'lucide-react';
import { useStore } from '../stores/useStore';

const colorOptions = [
  '#f7768e', '#ff9e64', '#e0af68', '#9ece6a', '#73daca',
  '#7dcfff', '#7aa2f7', '#bb9af7', '#c0caf5', '#565f89',
];

export function LabelManager({ onClose }: { onClose: () => void }) {
  const { labels, notify } = useStore();
  const [newLabel, setNewLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[6]);
  const userLabels = labels.filter(l => l.type === 'user');
  const systemLabels = labels.filter(l => l.type === 'system');

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    notify('success', `Label "${newLabel}" created`);
    setNewLabel('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="mx-4 w-full max-w-md rounded-2xl border border-tn-border bg-tn-bg-dark shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-tn-border px-5 py-3.5">
          <Tag size={16} className="text-tn-purple" />
          <h2 className="flex-1 text-base font-semibold text-tn-fg">Manage Labels</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Create new */}
          <div className="rounded-xl border border-tn-border bg-tn-bg-highlight/50 p-4">
            <h3 className="text-xs font-semibold text-tn-fg mb-2.5 flex items-center gap-1.5">
              <Plus size={12} /> Create Label
            </h3>
            <div className="flex gap-2 mb-2.5">
              <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Label name..." onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="flex-1 rounded-lg border border-tn-border bg-tn-bg-darker px-3 py-2 text-sm text-tn-fg placeholder-tn-fg-muted/50 outline-none focus:border-tn-blue/50" />
              <motion.button onClick={handleCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="rounded-lg bg-tn-blue/20 px-4 py-2 text-sm font-medium text-tn-blue hover:bg-tn-blue/30">
                Create
              </motion.button>
            </div>
            <div className="flex items-center gap-1.5">
              <Palette size={11} className="text-tn-fg-muted mr-1" />
              {colorOptions.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`h-5 w-5 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-white/50 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* User labels */}
          {userLabels.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted mb-2">Custom Labels</h3>
              <div className="space-y-1">
                {userLabels.map(l => (
                  <div key={l.id} className="flex items-center gap-2.5 rounded-xl bg-tn-bg-highlight/30 px-3 py-2.5 hover:bg-tn-bg-highlight transition-colors group">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="flex-1 text-sm text-tn-fg">{l.name}</span>
                    <span className="text-[10px] text-tn-fg-muted">{l.totalCount}</span>
                    <button className="rounded p-1 text-tn-fg-muted opacity-0 group-hover:opacity-100 hover:text-tn-red transition-all"
                      onClick={() => notify('info', `Label "${l.name}" deleted`)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System labels */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-tn-fg-muted mb-2">System Labels</h3>
            <div className="space-y-1">
              {systemLabels.map(l => (
                <div key={l.id} className="flex items-center gap-2.5 rounded-xl bg-tn-bg-highlight/20 px-3 py-2.5">
                  <span className="text-sm">{l.icon}</span>
                  <span className="flex-1 text-sm text-tn-fg-dark">{l.name}</span>
                  <span className="text-[10px] text-tn-fg-muted">{l.totalCount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
