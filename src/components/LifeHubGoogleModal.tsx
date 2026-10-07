import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/auth';

interface LifeHubGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const LifeHubGoogleModal: React.FC<LifeHubGoogleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customFirstName, setCustomFirstName] = useState('');
  const [customLastName, setCustomLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.googleAuth(profile);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Google authentication failed');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customFirstName || !customLastName) {
      setError('Please fill all Google account fields.');
      return;
    }
    handleSelectAccount({
      email: customEmail,
      firstName: customFirstName,
      lastName: customLastName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.12] bg-slate-900 p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-white/[0.08]">
          <svg className="h-8 w-8 mb-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
          <p className="mt-1 text-xs text-slate-400">
            Choose an account to immediately access your LifeHub
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Account Selector */}
        {!customMode ? (
          <div className="mt-5 space-y-2.5">
            {/* Account 1: User's Email */}
            <button
              onClick={() =>
                handleSelectAccount({
                  email: 'chaitanyaparker08@gmail.com',
                  firstName: 'Chaitanya',
                  lastName: 'Parker',
                  avatarUrl: '/src/assets/images/user_profile_avatar_1791308904789.jpg',
                })
              }
              disabled={loading}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/user_profile_avatar_1791308904789.jpg"
                  alt="Chaitanya Parker"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-emerald-500/40"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Chaitanya Parker
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    chaitanyaparker08@gmail.com
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Account 2: Alex Rivera */}
            <button
              onClick={() =>
                handleSelectAccount({
                  email: 'alex.rivera@example.com',
                  firstName: 'Alex',
                  lastName: 'Rivera',
                })
              }
              disabled={loading}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-slate-950/60 hover:bg-slate-800/80 hover:border-teal-500/40 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs">
                  AR
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                    Alex Rivera
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    alex.rivera@example.com
                  </div>
                </div>
              </div>
              <span className="text-xs text-teal-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Custom Account */}
            <button
              onClick={() => setCustomMode(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/[0.1] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-left cursor-pointer text-xs font-medium"
            >
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={customFirstName}
                  onChange={(e) => setCustomFirstName(e.target.value)}
                  placeholder="Taylor"
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={customLastName}
                  onChange={(e) => setCustomLastName(e.target.value)}
                  placeholder="Swift"
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Google Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="flex-1 rounded-xl border border-white/[0.1] py-2 text-xs text-slate-400"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Direct DB User Provisioning
          </span>
          <span>OAuth 2.0 Flow</span>
        </div>
      </div>
    </div>
  );
};
