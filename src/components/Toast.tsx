import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../stores/useStore';

const config = {
  success: { icon: <CheckCircle2 size={16} />, bg: 'bg-tn-green/10 border-tn-green/30', text: 'text-tn-green' },
  error:   { icon: <AlertCircle size={16} />,  bg: 'bg-tn-red/10 border-tn-red/30',     text: 'text-tn-red' },
  info:    { icon: <Info size={16} />,          bg: 'bg-tn-blue/10 border-tn-blue/30',   text: 'text-tn-blue' },
  warning: { icon: <AlertTriangle size={16} />, bg: 'bg-tn-yellow/10 border-tn-yellow/30', text: 'text-tn-yellow' },
};

export function Toast() {
  const { notifications, dismissNotification } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map(n => {
          const c = config[n.type];
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${c.bg}`}
            >
              <span className={c.text}>{c.icon}</span>
              <span className="flex-1 text-sm font-medium text-tn-fg">{n.message}</span>
              <button onClick={() => dismissNotification(n.id)} className="shrink-0 rounded-md p-0.5 text-tn-fg-muted hover:text-tn-fg">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
