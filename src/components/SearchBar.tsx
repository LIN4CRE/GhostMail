import { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';

const quickFilters = [
  { label: 'Unread', query: 'is:unread', color: 'bg-tn-blue/15 text-tn-blue border-tn-blue/20' },
  { label: 'Attachments', query: 'has:attachment', color: 'bg-tn-purple/15 text-tn-purple border-tn-purple/20' },
  { label: 'Starred', query: 'is:starred', color: 'bg-tn-yellow/15 text-tn-yellow border-tn-yellow/20' },
  { label: 'Older 1yr', query: 'older_than:1y', color: 'bg-tn-orange/15 text-tn-orange border-tn-orange/20' },
  { label: 'Large (5MB+)', query: 'larger:5M', color: 'bg-tn-red/15 text-tn-red border-tn-red/20' },
  { label: 'Newsletters', query: 'from:noreply', color: 'bg-tn-teal/15 text-tn-teal border-tn-teal/20' },
];

export function SearchBar() {
  const { searchQuery, setSearchQuery, emails, selectByFilter } = useStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalQuery(searchQuery); }, [searchQuery]);

  const handleSearch = (query: string) => { setSearchQuery(query); setLocalQuery(query); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(localQuery);
    if (e.key === 'Escape') { setLocalQuery(''); handleSearch(''); inputRef.current?.blur(); }
  };

  const filteredCount = searchQuery
    ? emails.filter(e => e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.email.toLowerCase().includes(searchQuery.toLowerCase())).length
    : emails.length;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className={`flex flex-1 items-center gap-2 rounded-xl border bg-tn-bg-highlight/60 px-3 py-2 transition-all duration-200 ${
          isFocused ? 'border-tn-blue/40 bg-tn-bg-highlight shadow-sm shadow-tn-blue/10' : 'border-tn-border/50'
        }`}>
          <Search size={14} className="shrink-0 text-tn-fg-muted" />
          <input ref={inputRef} type="text" placeholder="Search emails... ( / )"
            value={localQuery} onChange={e => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted/50 outline-none" />
          {localQuery && (
            <button onClick={() => { setLocalQuery(''); handleSearch(''); }} className="shrink-0 rounded-md p-0.5 text-tn-fg-muted hover:text-tn-fg">
              <X size={13} />
            </button>
          )}
          {searchQuery && <span className="shrink-0 rounded-full bg-tn-blue/20 px-2 py-0.5 text-[9px] font-semibold text-tn-blue">{filteredCount}</span>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
            showFilters ? 'border-tn-blue/40 bg-tn-blue/10 text-tn-blue' : 'border-tn-border/50 bg-tn-bg-highlight/60 text-tn-fg-muted hover:text-tn-fg'
          }`}>
          <SlidersHorizontal size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }} className="mt-2 overflow-hidden rounded-xl border border-tn-border bg-tn-bg-dark p-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-tn-fg-muted">
              <Filter size={10} /> Quick Filters
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickFilters.map(f => (
                <button key={f.label} onClick={() => { handleSearch(f.query); setShowFilters(false); }}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all hover:scale-105 ${f.color}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <button onClick={() => selectByFilter(e => !e.isRead)}
                className="rounded-lg bg-tn-bg-highlight px-2.5 py-1 text-[10px] text-tn-fg-dark hover:bg-tn-bg-float transition-colors">Select unread</button>
              <button onClick={() => selectByFilter(() => true)}
                className="rounded-lg bg-tn-bg-highlight px-2.5 py-1 text-[10px] text-tn-fg-dark hover:bg-tn-bg-float transition-colors">Select all</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
