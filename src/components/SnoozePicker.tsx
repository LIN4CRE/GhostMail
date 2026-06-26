import { motion } from 'framer-motion';
import { Clock, Sun, Moon, Calendar, X } from 'lucide-react';
import { useStore } from '../stores/useStore';

const options = [
  { icon: <Sun size={16} />, label: 'Later today', time: '6:00 PM', color: 'text-tn-yellow' },
  { icon: <Moon size={16} />, label: 'Tomorrow morning', time: '8:00 AM', color: 'text-tn-blue' },
  { icon: <Calendar size={16} />, label: 'Next week', time: 'Monday 8:00 AM', color: 'text-tn-purple' },
  { icon: <Calendar size={16} />, label: 'Next month', time: '1st of next month', color: 'text-tn-teal' },
];

export function SnoozePicker({ emailId, onClose }: { emailId: string; onClose: () => void }) {
  const { removeEmails, notify } = useStore();

  const handleSnooze = (label: string) => {
    removeEmails([emailId]);
    notify('success', `⏰ Snoozed: ${label}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      className="w-56 rounded-xl border border-tn-border bg-tn-bg-dark p-1.5 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 mb-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-tn-fg">
          <Clock size={12} /> Snooze until
        </span>
        <button onClick={onClose} className="rounded p-0.5 text-tn-fg-muted hover:text-tn-fg">
          <X size={12} />
        </button>
      </div>
      {options.map(opt => (
        <button key={opt.label} onClick={() => handleSnooze(opt.label)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-tn-fg-dark hover:bg-tn-bg-highlight transition-colors">
          <span className={opt.color}>{opt.icon}</span>
          <span className="flex-1 text-left">{opt.label}</span>
          <span className="text-[10px] text-tn-fg-muted">{opt.time}</span>
        </button>
      ))}
    </motion.div>
  );
}
