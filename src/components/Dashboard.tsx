import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MailOpen, Star, Paperclip, Trash2,
  TrendingUp, Clock, Users, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { useStore } from '../stores/useStore';

export function Dashboard() {
  const { emails, labels, setCurrentView, setActiveLabel } = useStore();
  const [hoveredSender, setHoveredSender] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = emails.length;
    const unread = emails.filter(e => !e.isRead).length;
    const starred = emails.filter(e => e.isStarred).length;
    const withAttachments = emails.filter(e => e.hasAttachments).length;
    const totalSize = emails.reduce((a, e) => a + e.sizeEstimate, 0);
    const readRate = total > 0 ? Math.round((1 - unread / total) * 100) : 0;
    const avgSize = total > 0 ? Math.round(totalSize / total) : 0;
    const important = emails.filter(e => e.isImportant).length;

    const senderMap = new Map<string, { count: number; email: string }>();
    emails.forEach(e => {
      const existing = senderMap.get(e.from.name);
      senderMap.set(e.from.name, { count: (existing?.count || 0) + 1, email: e.from.email });
    });
    const topSenders = [...senderMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = Array(7).fill(0);
    emails.forEach(e => byDay[e.date.getDay()]++);
    const maxDay = Math.max(...byDay, 1);

    const byHour = Array(24).fill(0);
    emails.forEach(e => byHour[e.date.getHours()]++);
    const maxHour = Math.max(...byHour, 1);

    // Composition: read vs unread vs starred
    const donut = [
      { label: 'Read', value: total - unread - starred, color: '#7aa2f7' },
      { label: 'Unread', value: unread, color: '#ff9e64' },
      { label: 'Starred', value: starred, color: '#e0af68' },
    ];

    return { total, unread, starred, withAttachments, totalSize, readRate, avgSize, important, topSenders, dayNames, byDay, maxDay, byHour, maxHour, donut };
  }, [emails]);

  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const cards = [
    { label: 'Total Emails', value: stats.total, icon: <Mail size={18} />, gradient: 'from-tn-blue/20 to-tn-blue/5', ic: 'text-tn-blue', border: 'border-tn-blue/20', trend: '+12%', up: true },
    { label: 'Unread', value: stats.unread, icon: <MailOpen size={18} />, gradient: 'from-tn-orange/20 to-tn-orange/5', ic: 'text-tn-orange', border: 'border-tn-orange/20', trend: '-8%', up: false },
    { label: 'Starred', value: stats.starred, icon: <Star size={18} />, gradient: 'from-tn-yellow/20 to-tn-yellow/5', ic: 'text-tn-yellow', border: 'border-tn-yellow/20' },
    { label: 'Attachments', value: stats.withAttachments, icon: <Paperclip size={18} />, gradient: 'from-tn-purple/20 to-tn-purple/5', ic: 'text-tn-purple', border: 'border-tn-purple/20' },
    { label: 'Read Rate', value: `${stats.readRate}%`, icon: <TrendingUp size={18} />, gradient: 'from-tn-green/20 to-tn-green/5', ic: 'text-tn-green', border: 'border-tn-green/20', trend: '+5%', up: true },
    { label: 'Storage', value: formatSize(stats.totalSize), icon: <BarChart3 size={18} />, gradient: 'from-tn-teal/20 to-tn-teal/5', ic: 'text-tn-teal', border: 'border-tn-teal/20' },
  ];

  // SVG donut
  const donutTotal = stats.donut.reduce((a, d) => a + d.value, 0) || 1;
  let donutOffset = 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-tn-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tn-green to-tn-teal shadow-md shadow-tn-green/15">
            <PieChart size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-tn-fg">Dashboard</h2>
            <p className="text-xs text-tn-fg-muted">Your email analytics at a glance</p>
          </div>
          <button onClick={() => { setCurrentView('inbox'); setActiveLabel('INBOX'); }}
            className="rounded-xl bg-tn-bg-highlight px-3 py-1.5 text-xs text-tn-fg-muted hover:text-tn-fg transition-colors">
            ← Back to Inbox
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border bg-gradient-to-br p-3.5 ${c.gradient} ${c.border} hover-lift cursor-default`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={c.ic}>{c.icon}</span>
                {c.trend && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-medium ${c.up ? 'text-tn-green' : 'text-tn-red'}`}>
                    {c.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{c.trend}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-tn-fg">{c.value}</p>
              <p className="text-[10px] text-tn-fg-muted mt-0.5">{c.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Donut chart */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-tn-border bg-tn-bg-dark p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-tn-fg">
              <PieChart size={14} className="text-tn-purple" /> Composition
            </h3>
            <div className="flex items-center gap-6">
              <svg viewBox="0 0 36 36" className="h-28 w-28 shrink-0 -rotate-90">
                {stats.donut.map((seg) => {
                  const pct = (seg.value / donutTotal) * 100;
                  const dashArray = `${pct} ${100 - pct}`;
                  const offset = donutOffset;
                  donutOffset += pct;
                  return (
                    <circle key={seg.label} cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                      stroke={seg.color} strokeDasharray={dashArray} strokeDashoffset={-offset}
                      strokeLinecap="round" className="transition-all duration-500" />
                  );
                })}
                <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="fill-tn-fg text-[5px] font-bold rotate-90" style={{ transformOrigin: '18px 18px' }}>
                  {stats.total}
                </text>
              </svg>
              <div className="space-y-2">
                {stats.donut.map(seg => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-tn-fg-dark">{seg.label}</span>
                    <span className="text-xs text-tn-fg-muted ml-auto">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Activity by Day */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border border-tn-border bg-tn-bg-dark p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-tn-fg">
              <Clock size={14} className="text-tn-cyan" /> By Day of Week
            </h3>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {stats.byDay.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-tn-fg-muted mb-1">{count}</span>
                  <motion.div initial={{ height: 0 }}
                    animate={{ height: `${Math.max((count / stats.maxDay) * 100, 4)}%` }}
                    transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 180 }}
                    className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-tn-blue to-tn-cyan" />
                  <span className="text-[9px] text-tn-fg-muted">{stats.dayNames[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hourly heatmap */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="rounded-2xl border border-tn-border bg-tn-bg-dark p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-tn-fg">
              <BarChart3 size={14} className="text-tn-purple" /> Hourly Heatmap
            </h3>
            <div className="grid grid-cols-12 gap-1">
              {stats.byHour.map((count, i) => {
                const intensity = stats.maxHour > 0 ? count / stats.maxHour : 0;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.015 }}
                    title={`${i}:00 — ${count} emails`}
                    className="aspect-square rounded-md transition-colors cursor-default"
                    style={{
                      backgroundColor: intensity > 0
                        ? `rgba(187, 154, 247, ${0.1 + intensity * 0.6})`
                        : 'rgba(59, 66, 97, 0.3)',
                    }} />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[8px] text-tn-fg-muted">
              <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[8px] text-tn-fg-muted">
              <span>Less</span>
              {[0.1, 0.25, 0.45, 0.7].map((o) => (
                <div key={o} className="h-3 w-3 rounded-sm" style={{ backgroundColor: `rgba(187, 154, 247, ${o})` }} />
              ))}
              <span>More</span>
            </div>
          </motion.div>
        </div>

        {/* Top senders + Labels */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="rounded-2xl border border-tn-border bg-tn-bg-dark p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-tn-fg">
              <Users size={14} className="text-tn-orange" /> Top Senders
            </h3>
            <div className="space-y-2">
              {stats.topSenders.map(([name, data], i) => {
                const pct = (data.count / stats.total) * 100;
                const colors = ['bg-tn-blue', 'bg-tn-purple', 'bg-tn-teal', 'bg-tn-orange', 'bg-tn-yellow', 'bg-tn-red', 'bg-tn-green', 'bg-tn-cyan'];
                const isHovered = hoveredSender === name;
                return (
                  <motion.div key={name}
                    onMouseEnter={() => setHoveredSender(name)}
                    onMouseLeave={() => setHoveredSender(null)}
                    className={`rounded-xl p-2.5 transition-colors cursor-default ${isHovered ? 'bg-tn-bg-highlight' : ''}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${colors[i % colors.length]}`}>
                          {name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-tn-fg-dark font-medium">{name}</span>
                          {isHovered && <p className="text-[9px] text-tn-fg-muted">{data.email}</p>}
                        </div>
                      </div>
                      <span className="text-tn-fg-muted">{data.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-tn-bg-highlight">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.04, duration: 0.5 }}
                        className={`h-full rounded-full ${colors[i % colors.length]}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="rounded-2xl border border-tn-border bg-tn-bg-dark p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-tn-fg">
              <Trash2 size={14} className="text-tn-red" /> Labels & Storage
            </h3>
            <div className="space-y-1.5">
              {labels.map(label => (
                <button key={label.id} onClick={() => { setCurrentView('inbox'); setActiveLabel(label.id); }}
                  className="flex w-full items-center gap-3 rounded-xl bg-tn-bg-highlight/30 px-3 py-2 hover:bg-tn-bg-highlight transition-colors text-left">
                  <span className="text-sm">{label.icon}</span>
                  <span className="flex-1 text-xs text-tn-fg-dark">{label.name}</span>
                  <span className="text-[10px] text-tn-fg-muted">{label.totalCount}</span>
                  {label.unreadCount > 0 && <span className="rounded-full bg-tn-blue/20 px-1.5 py-0.5 text-[9px] font-semibold text-tn-blue">{label.unreadCount}</span>}
                </button>
              ))}
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-tn-bg-highlight/30 p-3">
                <p className="text-[10px] text-tn-fg-muted">Avg email size</p>
                <p className="text-sm font-bold text-tn-fg">{formatSize(stats.avgSize)}</p>
              </div>
              <div className="rounded-xl bg-tn-bg-highlight/30 p-3">
                <p className="text-[10px] text-tn-fg-muted">Important</p>
                <p className="text-sm font-bold text-tn-fg">{stats.important}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick action banner */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="rounded-2xl border border-tn-purple/20 bg-gradient-to-r from-tn-purple/10 to-tn-blue/10 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tn-purple/20">
            <Zap size={24} className="text-tn-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-tn-fg">Ready to clean up?</h3>
            <p className="text-xs text-tn-fg-muted">Use Bulk Actions to mass-manage your {stats.total} emails</p>
          </div>
          <button onClick={() => setCurrentView('bulk')}
            className="shrink-0 rounded-xl bg-tn-purple/20 px-4 py-2 text-xs font-semibold text-tn-purple hover:bg-tn-purple/30 transition-colors">
            Go to Bulk Actions →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
