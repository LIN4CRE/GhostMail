import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Search, Grid3X3 } from 'lucide-react';
import { useStore } from '../stores/useStore';

export function AppLauncher() {
  const { googleApps } = useStore();
  const [search, setSearch] = useState('');

  const filtered = search
    ? googleApps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
    : googleApps;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-tn-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tn-teal to-tn-cyan shadow-md shadow-tn-teal/15">
            <Grid3X3 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tn-fg">Google Apps</h2>
            <p className="text-xs text-tn-fg-muted">Quick access to all your Google services</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-tn-border bg-tn-bg-highlight px-3 py-2">
          <Search size={14} className="text-tn-fg-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search apps..." className="flex-1 bg-transparent text-sm text-tn-fg placeholder-tn-fg-muted outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((app, index) => (
            <motion.a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-tn-border/40 bg-tn-bg-dark p-5 transition-all duration-300 hover:border-tn-border hover:bg-tn-bg-highlight hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${app.color}15` }}>
                {app.icon}
              </div>
              <span className="text-sm font-medium text-tn-fg">{app.name}</span>
              <span className="text-[10px] text-tn-fg-muted">{app.description}</span>
              <ExternalLink size={11} className="absolute right-2.5 top-2.5 text-tn-fg-gutter opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm text-tn-fg-muted">No apps match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
