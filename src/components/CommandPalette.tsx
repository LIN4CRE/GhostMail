import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Inbox, Zap, Grid3X3, PieChart, PenSquare, Settings,
  Star, Trash2, RefreshCw, LogOut, Mail, Tag, Send
} from 'lucide-react';
import { useStore } from '../stores/useStore';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const {
    showCommandPalette, setShowCommandPalette, setCurrentView,
    setShowCompose, setShowSettings, setShowLabelManager, refreshEmails, selectAll,
    deselectAll, setActiveLabel, logout
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const commands: Command[] = useMemo(() => [
    { id: 'inbox', label: 'Go to Inbox', icon: <Inbox size={16} />, category: 'Navigation', shortcut: '1', action: () => { setCurrentView('inbox'); setActiveLabel('INBOX'); } },
    { id: 'bulk', label: 'Go to Bulk Actions', icon: <Zap size={16} />, category: 'Navigation', shortcut: '2', action: () => setCurrentView('bulk') },
    { id: 'apps', label: 'Go to Google Apps', icon: <Grid3X3 size={16} />, category: 'Navigation', shortcut: '3', action: () => setCurrentView('apps') },
    { id: 'dashboard', label: 'Go to Dashboard', icon: <PieChart size={16} />, category: 'Navigation', shortcut: '4', action: () => setCurrentView('dashboard') },
    { id: 'compose', label: 'Compose New Email', icon: <PenSquare size={16} />, category: 'Actions', shortcut: 'C', action: () => setShowCompose(true) },
    { id: 'refresh', label: 'Refresh Inbox', icon: <RefreshCw size={16} />, category: 'Actions', shortcut: 'R', action: refreshEmails },
    { id: 'selectall', label: 'Select All Emails', icon: <Mail size={16} />, category: 'Actions', shortcut: '⌘A', action: selectAll },
    { id: 'deselect', label: 'Deselect All', icon: <Mail size={16} />, category: 'Actions', shortcut: '⌘D', action: deselectAll },
    { id: 'starred', label: 'View Starred', icon: <Star size={16} />, category: 'Labels', action: () => { setCurrentView('inbox'); setActiveLabel('STARRED'); } },
    { id: 'sent', label: 'View Sent', icon: <Send size={16} />, category: 'Labels', action: () => { setCurrentView('inbox'); setActiveLabel('SENT'); } },
    { id: 'trash', label: 'View Trash', icon: <Trash2 size={16} />, category: 'Labels', action: () => { setCurrentView('inbox'); setActiveLabel('TRASH'); } },
    { id: 'important', label: 'View Important', icon: <Tag size={16} />, category: 'Labels', action: () => { setCurrentView('inbox'); setActiveLabel('IMPORTANT'); } },
    { id: 'labels', label: 'Manage Labels', icon: <Tag size={16} />, category: 'System', action: () => setShowLabelManager(true) },
    { id: 'settings', label: 'Open Settings', icon: <Settings size={16} />, category: 'System', shortcut: ',', action: () => setShowSettings(true) },
    { id: 'logout', label: 'Sign Out', icon: <LogOut size={16} />, category: 'System', action: logout },
  ], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    if (showCommandPalette) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const runCommand = (cmd: Command) => {
    setShowCommandPalette(false);
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[activeIndex]) { runCommand(filtered[activeIndex]); }
    if (e.key === 'Escape') { setShowCommandPalette(false); }
  };

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach(c => {
      const arr = map.get(c.category) || [];
      arr.push(c);
      map.set(c.category, arr);
    });
    return map;
  }, [filtered]);

  let globalIdx = 0;

  if (!showCommandPalette) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh]"
        onClick={() => setShowCommandPalette(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-tn-border bg-tn-bg-dark shadow-2xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-tn-border px-4 py-3">
            <Search size={18} className="shrink-0 text-tn-fg-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted outline-none"
            />
            <kbd className="rounded-md border border-tn-border bg-tn-bg-highlight px-1.5 py-0.5 text-[10px] text-tn-fg-muted">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-tn-fg-muted">No commands found</div>
            ) : (
              [...grouped.entries()].map(([category, cmds]) => (
                <div key={category} className="mb-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-tn-fg-muted">{category}</p>
                  {cmds.map(cmd => {
                    const idx = globalIdx++;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => runCommand(cmd)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          idx === activeIndex ? 'bg-tn-bg-highlight text-tn-fg' : 'text-tn-fg-dark hover:bg-tn-bg-highlight/50'
                        }`}
                      >
                        <span className={idx === activeIndex ? 'text-tn-blue' : 'text-tn-fg-muted'}>{cmd.icon}</span>
                        <span className="flex-1">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="rounded border border-tn-border bg-tn-bg-darker px-1.5 py-0.5 text-[10px] text-tn-fg-muted">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-tn-border px-4 py-2 text-[10px] text-tn-fg-muted">
            <span className="flex items-center gap-1"><kbd className="rounded border border-tn-border px-1">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-tn-border px-1">↵</kbd> Run</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-tn-border px-1">Esc</kbd> Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
