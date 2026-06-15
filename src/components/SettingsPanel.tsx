import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Palette, Bell, Shield, Info, ExternalLink, Ghost } from 'lucide-react';
import { useStore } from '../stores/useStore';

export function SettingsPanel() {
  const { showSettings, setShowSettings, viewMode, setViewMode, notify } = useStore();
  const [activeTab, setActiveTab] = useState('appearance');

  if (!showSettings) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-tn-border bg-tn-bg-dark shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-tn-border px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tn-bg-highlight">
              <Monitor size={16} className="text-tn-fg-muted" />
            </div>
            <h2 className="flex-1 text-base font-semibold text-tn-fg">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="rounded-lg p-1.5 text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex max-h-[calc(80vh-60px)]">
            {/* Sidebar */}
            <div className="w-48 shrink-0 border-r border-tn-border bg-tn-bg-darker p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-tn-bg-highlight text-tn-blue'
                      : 'text-tn-fg-muted hover:bg-tn-bg-highlight/50 hover:text-tn-fg'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-tn-fg mb-1">Theme</h3>
                    <p className="text-xs text-tn-fg-muted mb-3">Choose your preferred visual theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'storm', label: 'Tokyo Night Storm', colors: ['#24283b', '#7aa2f7', '#bb9af7'], active: true },
                        { id: 'night', label: 'Tokyo Night', colors: ['#1a1b26', '#7aa2f7', '#bb9af7'], active: false },
                        { id: 'day', label: 'Tokyo Day', colors: ['#d5d6db', '#34548a', '#5a4a78'], active: false },
                      ].map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => notify('info', `Theme "${theme.label}" selected`)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            theme.active ? 'border-tn-blue/50 bg-tn-blue/10' : 'border-tn-border hover:border-tn-fg-gutter'
                          }`}
                        >
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((c, i) => (
                              <div key={i} className="h-4 w-4 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-tn-fg">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-tn-fg mb-1">Density</h3>
                    <p className="text-xs text-tn-fg-muted mb-3">Adjust how compact emails appear</p>
                    <div className="flex gap-2">
                      {(['comfortable', 'cozy', 'compact'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`rounded-xl border px-4 py-2 text-xs font-medium capitalize transition-all ${
                            viewMode === mode
                              ? 'border-tn-blue/50 bg-tn-blue/10 text-tn-blue'
                              : 'border-tn-border text-tn-fg-muted hover:border-tn-fg-gutter hover:text-tn-fg'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-tn-fg mb-1">Font Size</h3>
                    <p className="text-xs text-tn-fg-muted mb-3">Adjust the reading font size</p>
                    <input type="range" min="12" max="18" defaultValue="14" className="w-full accent-tn-blue" />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-tn-fg">Notification Preferences</h3>
                  {[
                    { label: 'Email notifications', desc: 'Get notified for new emails', defaultChecked: true },
                    { label: 'Sound effects', desc: 'Play sounds for actions', defaultChecked: false },
                    { label: 'Desktop notifications', desc: 'Show browser notifications', defaultChecked: true },
                    { label: 'Badge counter', desc: 'Show unread count in tab', defaultChecked: true },
                  ].map(item => (
                    <label key={item.label} className="flex items-center justify-between rounded-xl bg-tn-bg-highlight/50 p-3 cursor-pointer hover:bg-tn-bg-highlight transition-colors">
                      <div>
                        <p className="text-sm text-tn-fg">{item.label}</p>
                        <p className="text-xs text-tn-fg-muted">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked={item.defaultChecked} className="h-4 w-4 rounded accent-tn-blue" />
                    </label>
                  ))}
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-tn-fg">Privacy & Security</h3>
                  <div className="rounded-xl border border-tn-green/20 bg-tn-green/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-tn-green" />
                      <span className="text-sm font-semibold text-tn-green">Privacy-First Design</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-tn-fg-muted">
                      <li>✅ All data processed locally on your device</li>
                      <li>✅ OAuth tokens stored in OS keychain</li>
                      <li>✅ No analytics or telemetry collected</li>
                      <li>✅ No third-party tracking scripts</li>
                      <li>✅ We never see, store, or process your emails</li>
                      <li>✅ Open source — verify the code yourself</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta">
                      <Ghost size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gradient">GhostMail</h3>
                      <p className="text-xs text-tn-fg-muted">Version 1.0.0 — Release Build</p>
                    </div>
                  </div>
                  <p className="text-sm text-tn-fg-dark leading-relaxed">
                    A beautiful, open-source Google Workspace hub with powerful bulk email management.
                    Built with the Tokyo Night color palette, zero ads, privacy-first.
                  </p>
                  <div className="space-y-2">
                    <InfoRow label="Tech Stack" value="React + Vite + Tailwind" />
                    <InfoRow label="Theme" value="Tokyo Night Storm" />
                    <InfoRow label="License" value="MIT" />
                    <InfoRow label="Author" value="LIN4CRE" />
                  </div>
                  <a
                    href="https://github.com/LIN4CRE/GhostMail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-tn-bg-highlight px-4 py-2 text-sm text-tn-fg-dark hover:bg-tn-bg-float transition-colors"
                  >
                    <span>🐙</span>
                    View on GitHub
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-tn-bg-highlight/50 px-3 py-2">
      <span className="text-xs text-tn-fg-muted">{label}</span>
      <span className="text-xs font-medium text-tn-fg">{value}</span>
    </div>
  );
}
