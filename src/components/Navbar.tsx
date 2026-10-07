import React from 'react';
import { User, BackendConfig } from '../types/auth';
import { ShieldCheck, LogOut, Server, UserCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeView: 'login' | 'register' | 'otp' | 'dashboard';
  setActiveView: (view: 'login' | 'register' | 'otp' | 'dashboard') => void;
  onLogout: () => void;
  backendConfig: BackendConfig;
  onOpenBackendSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onLogout,
  backendConfig,
  onOpenBackendSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentUser) setActiveView('dashboard');
              else setActiveView('login');
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-sm">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              AuthForge
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Text with subtle hover) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button
            onClick={onOpenBackendSettings}
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
          >
            <Server className="h-4 w-4 text-amber-400" />
            <span>Backend API Docs</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs uppercase tracking-wider text-amber-400/90 font-mono">
              {backendConfig.mode === 'live' ? 'Live API' : 'Sandbox Engine'}
            </span>
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeView === 'dashboard' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBackendSettings}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configure Backend URL & View Payloads"
          >
            <Server className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Backend API</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.firstName}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                    {currentUser.firstName.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-slate-200">
                  {currentUser.firstName}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40 hover:border-red-500/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {activeView !== 'login' && (
                <button
                  onClick={() => setActiveView('login')}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Log In
                </button>
              )}
              {activeView !== 'register' && (
                <button
                  onClick={() => setActiveView('register')}
                  className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                >
                  Create Account
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
