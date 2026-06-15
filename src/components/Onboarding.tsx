import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Keyboard, ArrowRight, X, Sparkles } from 'lucide-react';
import { useStore } from '../stores/useStore';

const steps = [
  {
    title: 'Welcome to GhostMail 👻',
    description: 'Your email, decluttered. Beautiful, open-source, and privacy-first.',
    icon: <Ghost size={32} className="text-white" />,
    gradient: 'from-tn-blue via-tn-purple to-tn-magenta',
    tips: [
      'Manage your Gmail with powerful bulk actions',
      'Beautiful Tokyo Night theme, easy on the eyes',
      'Your data stays on YOUR device — always',
    ],
  },
  {
    title: 'Quick Navigation',
    description: 'Everything is one click or keystroke away.',
    icon: <Sparkles size={32} className="text-white" />,
    gradient: 'from-tn-teal to-tn-cyan',
    tips: [
      '📥 Inbox — Read and manage emails',
      '⚡ Bulk Actions — Mass delete, archive, mark',
      '📊 Dashboard — Email analytics at a glance',
      '🔲 Google Apps — Quick access to all services',
    ],
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Power users rejoice — GhostMail is keyboard-first.',
    icon: <Keyboard size={32} className="text-white" />,
    gradient: 'from-tn-orange to-tn-yellow',
    tips: [
      '⌘K — Open Command Palette',
      '/ — Focus search bar',
      'C — Compose new email',
      '1-4 — Switch views',
      'R — Refresh inbox',
      'Esc — Close panels',
    ],
  },
];

export function Onboarding() {
  const { showOnboarding, setShowOnboarding } = useStore();
  const [step, setStep] = useState(0);

  if (!showOnboarding) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-tn-border bg-tn-bg-dark shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={() => setShowOnboarding(false)}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>

          {/* Hero */}
          <div className={`flex items-center justify-center bg-gradient-to-br ${current.gradient} p-8`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm"
            >
              {current.icon}
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-tn-fg">{current.title}</h2>
            <p className="mt-1 text-sm text-tn-fg-muted">{current.description}</p>

            <div className="mt-4 space-y-2">
              {current.tips.map((tip, i) => (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2 rounded-xl bg-tn-bg-highlight/50 px-3 py-2 text-sm text-tn-fg-dark"
                >
                  {tip}
                </motion.div>
              ))}
            </div>

            {/* Progress + Actions */}
            <div className="mt-6 flex items-center justify-between">
              {/* Dots */}
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? 'w-6 bg-tn-blue' : 'w-1.5 bg-tn-fg-gutter'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="rounded-xl bg-tn-bg-highlight px-4 py-2 text-sm text-tn-fg-muted hover:text-tn-fg transition-colors"
                  >
                    Back
                  </button>
                )}
                <motion.button
                  onClick={() => isLast ? setShowOnboarding(false) : setStep(step + 1)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-tn-blue to-tn-purple px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-tn-blue/20"
                >
                  {isLast ? 'Get Started' : 'Next'}
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
