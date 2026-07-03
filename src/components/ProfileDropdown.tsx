import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, HelpCircle, Shield, ExternalLink } from 'lucide-react';
import { useStore } from '../stores/useStore';

export function ProfileDropdown() {
  const { user, logout, setShowSettings, setShowOnboarding, emails } = useStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const unread = emails.filter(e => !e.isRead).length;
  const total = emails.length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-xs font-bold text-white ring-2 ring-transparent transition-all hover:ring-tn-blue/30">
        {user.name.charAt(0)}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[49]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-tn-border bg-tn-bg-dark p-1.5 shadow-2xl"
            >
              <div className="rounded-xl bg-gradient-to-br from-tn-bg-highlight to-tn-bg-float p-4 mb-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-tn-purple to-tn-blue text-lg font-bold text-white shadow-lg shadow-tn-purple/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-tn-fg">{user.name}</p>
                    <p className="text-xs text-tn-fg-muted">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-[10px]">
                  <div className="rounded-lg bg-tn-bg-darker/50 px-2.5 py-1.5">
                    <span className="font-bold text-tn-blue">{unread}</span>
                    <span className="text-tn-fg-muted ml-1">unread</span>
                  </div>
                  <div className="rounded-lg bg-tn-bg-darker/50 px-2.5 py-1.5">
                    <span className="font-bold text-tn-fg">{total}</span>
                    <span className="text-tn-fg-muted ml-1">total</span>
                  </div>
                </div>
              </div>

              <MenuItem icon={<Settings size={14} />} label="Settings" shortcut="," onClick={() => { setShowSettings(true); setOpen(false); }} />
              <MenuItem icon={<Shield size={14} />} label="Privacy" badge="✓ Secure" badgeColor="text-tn-green" onClick={() => { setShowSettings(true); setOpen(false); }} />
              <MenuItem icon={<HelpCircle size={14} />} label="Help & Shortcuts" shortcut="?" onClick={() => { setShowOnboarding(true); setOpen(false); }} />

              <div className="mx-2 my-1 border-t border-tn-border/50" />

              <MenuItem icon={<ExternalLink size={14} />} label="GitHub"
                onClick={() => { window.open('https://github.com/LIN4CRE/GhostMail', '_blank'); setOpen(false); }} />

              <div className="mx-2 my-1 border-t border-tn-border/50" />

              <button onClick={() => { logout(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-tn-red hover:bg-tn-red/10 transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, shortcut, badge, badgeColor, onClick }: {
  icon: React.ReactNode; label: string; shortcut?: string; badge?: string; badgeColor?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-tn-fg-dark hover:bg-tn-bg-highlight hover:text-tn-fg transition-colors">
      <span className="text-tn-fg-muted">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <kbd className="rounded border border-tn-border bg-tn-bg-darker px-1 py-0.5 text-[9px] text-tn-fg-muted">{shortcut}</kbd>}
      {badge && <span className={`text-[9px] font-medium ${badgeColor || 'text-tn-fg-muted'}`}>{badge}</span>}
    </button>
  );
}
