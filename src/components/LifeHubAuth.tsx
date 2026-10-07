import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flame,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/auth';

interface LifeHubAuthProps {
  initialView: 'login' | 'register' | 'otp';
  onSuccess: (user: User) => void;
  onOpenGoogleModal: () => void;
  onNotifyOtpDispatched: (email: string, otp: string) => void;
  onBackToWelcome?: () => void;
}

export const LifeHubAuth: React.FC<LifeHubAuthProps> = ({
  initialView,
  onSuccess,
  onOpenGoogleModal,
  onNotifyOtpDispatched,
  onBackToWelcome,
}) => {
  const [view, setView] = useState<'login' | 'register' | 'otp'>(initialView);

  // Registration State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; message: string }>({
    checked: false,
    available: true,
    message: '',
  });

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync initial view prop
  useEffect(() => {
    setView(initialView);
    setError(null);
  }, [initialView]);

  // Username live availability checker
  useEffect(() => {
    if (!username.trim() || username.trim().length < 3) {
      setUsernameStatus({ checked: false, available: true, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      const res = await api.checkUsername(username);
      setUsernameStatus({ checked: true, available: res.available, message: res.message });
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  // OTP countdown timer
  useEffect(() => {
    if (view !== 'otp' || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [view, countdown]);

  // Password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };
  const passScore = getPasswordStrength(password);

  // Registration submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your first and last name.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (usernameStatus.checked && !usernameStatus.available) {
      setError('Please choose a different username.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        firstName,
        lastName,
        username,
        email,
        password,
      });

      if (res.success) {
        setOtpTargetEmail(email);
        setView('otp');
        setCountdown(60);
        if (res.otpForPreview) {
          onNotifyOtpDispatched(email, res.otpForPreview);
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  // OTP digit input handler
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setError(null);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const code = updated.join('');
      if (code.length === 6) {
        handleVerifyOtp(code);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  // Verify OTP submit
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setError('Please provide all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyOtp({
        email: otpTargetEmail || email,
        otp: code,
      });

      if (res.success && res.user) {
        setSuccessNotice('Account successfully verified! Launching your LifeHub...');
        setTimeout(() => {
          onSuccess(res.user!);
        }, 700);
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.resendOtp(otpTargetEmail || email);
      if (res.success) {
        setCountdown(60);
        if (res.otpForPreview) {
          onNotifyOtpDispatched(otpTargetEmail || email, res.otpForPreview);
        }
        setSuccessNotice('A new verification code has been dispatched to your email.');
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        setError(res.message || 'Failed to resend code');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({
        identifier: loginIdentifier,
        password: loginPassword,
      });

      if (res.success && res.user) {
        onSuccess(res.user);
      } else if (res.requiresVerification && res.email) {
        setOtpTargetEmail(res.email);
        setView('otp');
        setError('Please complete email verification first.');
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Brand Showcase (Real Product Presentation) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <Compass className="h-3.5 w-3.5" />
            <span>Personal Operating System</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Master your daily rhythm with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">LifeHub</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed max-w-lg">
              Coordinate all your life pillars — Health, Mind, Craft, and Wealth — in one responsive, database-backed personal dashboard.
            </p>
          </div>

          {/* Life Pillar Interactive Highlights */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Daily Habit Streaks</div>
                  <div className="text-xs text-slate-400">Synced directly with persistent database storage</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                14 Days Active
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Two-Way Authentication</div>
                  <div className="text-xs text-slate-400">Email 6-digit OTP verification + Google OAuth 2.0</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-teal-300">
                Encrypted
              </span>
            </div>
          </div>

          {/* Social proof / Trust statement */}
          <div className="flex items-center gap-6 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Full Express Backend</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Persistent JSON DB</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Secure Authentication</span>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Authentication Card */}
        <div className="lg:col-span-6">
          <div className="w-full max-w-md mx-auto rounded-3xl border border-white/[0.1] bg-slate-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
            {onBackToWelcome && (
              <button
                type="button"
                onClick={onBackToWelcome}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Back to Welcome Page</span>
              </button>
            )}

            {/* Header */}
            <div className="pb-6 border-b border-white/[0.08] text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {view === 'register' && 'Join LifeHub'}
                {view === 'login' && 'Welcome Back'}
                {view === 'otp' && 'Verify Your Email'}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">
                {view === 'register' && 'Create your account to unlock your personal life dashboard'}
                {view === 'login' && 'Sign in to access your habits, pillars, and daily focus'}
                {view === 'otp' && `We sent a 6-digit code to ${otpTargetEmail || email}`}
              </p>
            </div>

            {/* Error & Success notices */}
            {error && (
              <div className="mt-5 p-3 rounded-xl border border-red-500/30 bg-red-950/40 text-xs text-red-300 flex items-start gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="mt-5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Google OAuth Button (Shown on Register and Login) */}
            {view !== 'otp' && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onOpenGoogleModal}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-white/[0.12] bg-slate-950/80 hover:bg-slate-800 text-slate-100 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
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
                  <span>
                    {view === 'register' ? 'Sign up with Google (Instant)' : 'Sign in with Google'}
                  </span>
                </button>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <span className="relative bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Or with email credentials
                  </span>
                </div>
              </div>
            )}

            {/* 1. REGISTER FORM */}
            {view === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Chaitanya"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Parker"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Username</label>
                    {usernameStatus.checked && (
                      <span className={`text-[10px] ${usernameStatus.available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {usernameStatus.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="chaitanya_dev"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 pl-8 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
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

                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passScore <= 25
                              ? 'bg-red-500'
                              : passScore <= 50
                              ? 'bg-amber-500'
                              : passScore <= 75
                              ? 'bg-teal-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${passScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Creating Account in DB...</span>
                    </>
                  ) : (
                    <>
                      <span>Register & Send Verification Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="pt-2 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError(null);
                    }}
                    className="font-semibold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </form>
            )}

            {/* 2. OTP VERIFICATION FORM */}
            {view === 'otp' && (
              <div className="space-y-6 pt-2">
                <div className="flex justify-between gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className={`h-12 w-12 sm:h-13 sm:w-13 text-center text-xl font-bold font-mono rounded-xl border bg-slate-950 text-white transition-all focus:outline-none ${
                        digit
                          ? 'border-emerald-500 shadow-sm shadow-emerald-500/20'
                          : 'border-white/[0.1] focus:border-emerald-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otpDigits.join('').length < 6}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying with Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify & Enter LifeHub</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>

                  <div>
                    {countdown > 0 ? (
                      <span className="font-mono text-slate-500">
                        Resend in <strong className="text-emerald-400">{countdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-semibold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOGIN FORM */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="chaitanya_p or user@domain.com"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your account password"
                      className="w-full rounded-xl border border-white/[0.1] bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter LifeHub Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="pt-2 text-center text-xs text-slate-400">
                  New to LifeHub?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('register');
                      setError(null);
                    }}
                    className="font-semibold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
