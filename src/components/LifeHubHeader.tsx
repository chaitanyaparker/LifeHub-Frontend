import React from 'react';
import { User } from '../types/auth';
import { Compass, Sparkles, LogOut, CheckCircle2, User as UserIcon, Shield } from 'lucide-react';

interface LifeHubHeaderProps {
  currentUser: User | null;
  activeTab: 'dashboard' | 'habits' | 'profile' | 'security';
  setActiveTab: (tab: 'dashboard' | 'habits' | 'profile' | 'security') => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  dbStatus: 'connected' | 'connecting' | 'offline';
}

export const LifeHubHeader: React.FC<LifeHubHeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenLogin,
  onOpenRegister,
  dbStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Compass className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                LifeHub
              </span>
              <span className="ml-1.5 text-[10px] font-medium text-emerald-400/90 font-mono tracking-wider uppercase">
                OS
              </span>
            </div>
          </div>

          {/* Nav links for logged in user */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`transition-colors cursor-pointer py-1 ${
                  activeTab === 'dashboard'
                    ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                    : 'hover:text-slate-200'
                }`}
              >
                Today's Focus
              </button>
              <button
                onClick={() => setActiveTab('habits')}
                className={`transition-colors cursor-pointer py-1 ${
                  activeTab === 'habits'
                    ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                    : 'hover:text-slate-200'
                }`}
              >
                Life Pillars & Habits
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`transition-colors cursor-pointer py-1 ${
                  activeTab === 'profile'
                    ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                    : 'hover:text-slate-200'
                }`}
              >
                Identity & Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`transition-colors cursor-pointer py-1 ${
                  activeTab === 'security'
                    ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                    : 'hover:text-slate-200'
                }`}
              >
                Security & Auth
              </button>
            </nav>
          )}
        </div>

        {/* Right side: Database indicator & User controls */}
        <div className="flex items-center gap-4">
          {/* Real-time DB Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.08] bg-slate-900/60 text-[11px] text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${
                dbStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : dbStatus === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span className="font-mono text-[10px]">
              {dbStatus === 'connected' ? 'Database Synced' : 'Connecting...'}
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-slate-900/60 pl-2 pr-3 py-1.5 text-xs text-slate-200 hover:border-emerald-500/40 hover:bg-slate-800 transition-all cursor-pointer group"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.firstName}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    {currentUser.firstName.charAt(0)}
                  </div>
                )}
                <span className="font-medium group-hover:text-emerald-300 transition-colors">
                  {currentUser.firstName}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20 transition-all cursor-pointer"
                title="Sign out of current device"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenLogin}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRegister}
                className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
