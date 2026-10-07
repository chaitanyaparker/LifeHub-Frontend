import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { User } from '../types/auth';

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onOpenGoogleOAuth: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onOpenGoogleOAuth,
  onOpenForgotPassword,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await AuthService.login(identifier, password);
      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = (userKey: 'chaitanya' | 'alex') => {
    if (userKey === 'chaitanya') {
      setIdentifier('chaitanyaparker08@gmail.com');
      setPassword('Password123!');
    } else {
      setIdentifier('alex_rivera');
      setPassword('SecurePass2026!');
    }
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome Back</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sign in to AuthForge
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Use your username, email, or Google account to enter your dashboard
          </p>
        </div>

        {/* Google OAuth Quick Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenGoogleOAuth}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-950/80 hover:bg-slate-800 hover:border-slate-600 text-slate-100 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            <span>Continue with Google (1-Click)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Or continue with password
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username or Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. chaitanya_p or user@domain.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-medium text-slate-400 mb-2.5">
            Quick Test Accounts (Click to auto-fill):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemoUser('chaitanya')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-semibold text-slate-200 group-hover:text-amber-300">
                Chaitanya P.
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                chaitanyaparker08...
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoUser('alex')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-blue-500/40 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-semibold text-slate-200 group-hover:text-blue-300">
                Alex Rivera
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                alex_rivera
              </div>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="mt-5 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};
