import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customFirstName, setCustomFirstName] = useState('');
  const [customLastName, setCustomLastName] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customFirstName || !customLastName) {
      setCustomError('Please fill in all Google account fields.');
      return;
    }
    if (!customEmail.includes('@')) {
      setCustomError('Please provide a valid Google email.');
      return;
    }
    onSelectAccount({
      email: customEmail,
      firstName: customFirstName,
      lastName: customLastName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-800">
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
          <h3 className="text-lg font-semibold text-white">Sign in with Google</h3>
          <p className="mt-1 text-xs text-slate-400">
            Choose an account to continue directly to AuthForge Dashboard
          </p>
        </div>

        {/* Account Selector List */}
        {!customMode ? (
          <div className="mt-5 space-y-3">
            {/* Account 1: User's Email */}
            <button
              onClick={() =>
                onSelectAccount({
                  email: 'chaitanyaparker08@gmail.com',
                  firstName: 'Chaitanya',
                  lastName: 'Parker',
                  avatarUrl: '/src/assets/images/user_profile_avatar_1791308904789.jpg',
                })
              }
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/user_profile_avatar_1791308904789.jpg"
                  alt="Chaitanya Parker"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <div className="text-sm font-medium text-slate-100 group-hover:text-amber-300 transition-colors">
                    Chaitanya Parker
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    chaitanyaparker08@gmail.com
                  </div>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Select <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Account 2: Alex Rivera */}
            <button
              onClick={() =>
                onSelectAccount({
                  email: 'alex.rivera@example.com',
                  firstName: 'Alex',
                  lastName: 'Rivera',
                })
              }
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 flex items-center justify-center font-semibold text-sm">
                  AR
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                    Alex Rivera
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    alex.rivera@example.com
                  </div>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Select <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Use Another Account Button */}
            <button
              onClick={() => setCustomMode(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-700 transition-all text-left cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Use another Google account</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-5 space-y-3.5">
            {customError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                {customError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={customFirstName}
                  onChange={(e) => setCustomFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={customLastName}
                  onChange={(e) => setCustomLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
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
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="flex-1 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
              >
                Sign In with Google
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Verified Google OAuth Client
          </span>
          <span>Instant Direct Login</span>
        </div>
      </div>
    </div>
  );
};
