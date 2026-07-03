import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ghost, Mail, Shield, Trash2, Search, Zap, BarChart3, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { setClientId, getStoredClientId } from '../services/auth';

export function LoginScreen() {
  const { loginWithGoogle, loginDemo, isLoading } = useStore();
  const [clientId, setLocalClientId] = useState(getStoredClientId());
  const [showSetup, setShowSetup] = useState(false);

  const handleGoogleLogin = () => {
    if (!clientId.trim()) {
      setShowSetup(true);
      return;
    }
    setClientId(clientId.trim());
    loginWithGoogle();
  };

  const features = [
    { icon: <Trash2 size={18} />, title: 'Bulk Delete', desc: 'Trash thousands at once', color: 'text-tn-red', bg: 'bg-tn-red/10' },
    { icon: <Search size={18} />, title: 'Power Search', desc: 'Gmail syntax + presets', color: 'text-tn-blue', bg: 'bg-tn-blue/10' },
    { icon: <Shield size={18} />, title: 'Privacy First', desc: 'Data stays on device', color: 'text-tn-green', bg: 'bg-tn-green/10' },
    { icon: <Zap size={18} />, title: 'Lightning Fast', desc: 'Built for performance', color: 'text-tn-yellow', bg: 'bg-tn-yellow/10' },
    { icon: <BarChart3 size={18} />, title: 'Analytics', desc: 'Email insights & stats', color: 'text-tn-purple', bg: 'bg-tn-purple/10' },
    { icon: <Lock size={18} />, title: 'No Ads Ever', desc: 'Open source & free', color: 'text-tn-teal', bg: 'bg-tn-teal/10' },
  ];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-tn-bg-darker">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-tn-blue/[0.04] blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-tn-purple/[0.04] blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-tn-teal/[0.03] blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(var(--color-tn-fg-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-tn-fg-muted) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 mx-4 w-full max-w-lg">
        <motion.div className="mb-10 flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="relative mb-5">
            <motion.div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta opacity-50 blur-xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-tn-blue via-tn-purple to-tn-magenta shadow-2xl shadow-tn-purple/30">
              <Ghost className="h-12 w-12 text-white" />
            </div>
            <motion.div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-tn-green shadow-lg shadow-tn-green/30"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}>
              <Mail size={14} className="text-tn-bg-darker" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gradient">GhostMail</h1>
          <p className="mt-3 text-center text-base text-tn-fg-muted max-w-sm">
            Your email, decluttered. Beautiful, open-source, and privacy-first.
          </p>
        </motion.div>

        <motion.div className="glass-strong rounded-3xl p-7"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                className="group rounded-2xl bg-tn-bg-highlight/40 p-3 transition-all duration-200 hover:bg-tn-bg-highlight hover-lift cursor-default">
                <div className={`mb-1.5 inline-flex rounded-lg p-1.5 ${feat.bg} ${feat.color}`}>{feat.icon}</div>
                <h3 className="text-xs font-semibold text-tn-fg">{feat.title}</h3>
                <p className="text-[10px] text-tn-fg-muted leading-snug">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Google Client ID setup */}
          {showSetup && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
              <div className="rounded-xl border border-tn-orange/30 bg-tn-orange/5 p-4 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-tn-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-tn-fg-dark leading-relaxed">
                    <p className="font-semibold text-tn-orange mb-1">Google Cloud Setup Required</p>
                    <ol className="space-y-1 list-decimal list-inside text-tn-fg-muted">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-tn-blue underline">Google Cloud Console</a></li>
                      <li>Create a project → Enable <strong>Gmail API</strong></li>
                      <li>Create <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
                      <li>Add <code className="bg-tn-bg-highlight px-1 rounded text-tn-cyan">{window.location.origin}</code> to authorized JavaScript origins <strong>and</strong> redirect URIs</li>
                      <li>Copy the Client ID below</li>
                    </ol>
                  </div>
                </div>
              </div>
              <label className="block text-xs text-tn-fg-muted mb-1.5">Google OAuth Client ID</label>
              <input type="text" value={clientId} onChange={e => setLocalClientId(e.target.value)}
                placeholder="123456789.apps.googleusercontent.com"
                className="w-full rounded-xl border border-tn-border bg-tn-bg-highlight/50 px-4 py-3 text-sm text-tn-fg placeholder-tn-fg-muted/40 outline-none focus:border-tn-blue/50 transition-colors font-mono" />
            </motion.div>
          )}

          {/* Sign in with Google */}
          <motion.button onClick={handleGoogleLogin} disabled={isLoading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-tn-blue via-tn-purple to-tn-magenta px-6 py-4 text-base font-bold text-white shadow-xl shadow-tn-purple/25 transition-all duration-300 hover:shadow-2xl hover:shadow-tn-purple/35 disabled:opacity-50 animate-gradient">
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <><svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Connecting to Google...</>
              ) : (
                <><svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Sign in with Google</>
              )}
            </span>
          </motion.button>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 border-t border-tn-border/50" />
            <span className="text-[10px] text-tn-fg-muted">or</span>
            <div className="flex-1 border-t border-tn-border/50" />
          </div>

          {/* Demo mode */}
          <button onClick={loginDemo} disabled={isLoading}
            className="mt-4 w-full rounded-2xl border border-tn-border bg-tn-bg-highlight/30 px-6 py-3 text-sm font-medium text-tn-fg-muted hover:bg-tn-bg-highlight hover:text-tn-fg transition-all disabled:opacity-50">
            👻 Try Demo Mode (mock data)
          </button>

          {!showSetup && (
            <button onClick={() => setShowSetup(true)} className="mt-2 w-full text-center text-[10px] text-tn-fg-muted hover:text-tn-blue transition-colors">
              Need to set up Google Cloud? Click here
            </button>
          )}
        </motion.div>

        <motion.div className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {[
            { text: 'Tokyo Night', color: 'bg-tn-purple/15 text-tn-purple border-tn-purple/20' },
            { text: 'MIT License', color: 'bg-tn-green/15 text-tn-green border-tn-green/20' },
            { text: 'No Ads', color: 'bg-tn-orange/15 text-tn-orange border-tn-orange/20' },
            { text: 'Open Source', color: 'bg-tn-blue/15 text-tn-blue border-tn-blue/20' },
          ].map(badge => (
            <span key={badge.text} className={`rounded-full border px-3 py-1 text-[10px] font-medium ${badge.color}`}>{badge.text}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
