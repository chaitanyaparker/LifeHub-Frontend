import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Mail, Sparkles } from 'lucide-react';
import { AuthService } from '../services/authService';
import { User } from '../types/auth';

interface OTPVerificationProps {
  email: string;
  onSuccess: (user: User) => void;
  onBackToRegister: () => void;
  previewOtp?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSuccess,
  onBackToRegister,
  previewOtp,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [currentPreviewOtp, setCurrentPreviewOtp] = useState<string | undefined>(previewOtp);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleaned ? cleaned.slice(-1) : '';
    setDigits(newDigits);
    setError(null);

    // If digit entered, auto advance
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (cleaned && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    if (pasteData.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerify(pasteData);
    } else {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.verifyOTP(email, code);
      if (res.success && res.data) {
        setSuccessMsg('Email verified successfully! Entering dashboard...');
        setTimeout(() => {
          onSuccess(res.data!);
        }, 800);
      } else {
        setError(res.message || 'Invalid 6-digit code. Please try again.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await AuthService.resendOTP(email);
      if (res.success) {
        setCountdown(60);
        if (res.otpForPreview || res.data?.otp) {
          setCurrentPreviewOtp(res.otpForPreview || res.data?.otp);
        }
        setSuccessMsg('A new verification code has been dispatched to your email.');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsResending(false);
    }
  };

  const handleAutoFillCode = () => {
    if (!currentPreviewOtp) return;
    const chars = currentPreviewOtp.split('').slice(0, 6);
    setDigits(chars);
    handleVerify(currentPreviewOtp);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl backdrop-blur-xl">
        {/* Back Link */}
        <button
          onClick={onBackToRegister}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Change registration email</span>
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <Mail className="h-6 w-6 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Verify your email
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
            We sent a 6-digit confirmation code to{' '}
            <span className="font-semibold text-slate-200 font-mono break-all">{email}</span>
          </p>
        </div>

        {/* Instant Sandbox Helper Notification */}
        {currentPreviewOtp && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Dev Demo Code: <strong className="font-mono text-amber-300 font-bold tracking-widest">{currentPreviewOtp}</strong>
              </span>
            </div>
            <button
              onClick={handleAutoFillCode}
              className="rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Fill & Verify
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="mt-6 flex justify-between gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`h-12 w-12 sm:h-13 sm:w-13 text-center text-xl font-bold font-mono rounded-xl border bg-slate-950 text-white transition-all focus:outline-none ${
                digit
                  ? 'border-amber-500/70 shadow-sm shadow-amber-500/10'
                  : 'border-slate-800 focus:border-amber-500'
              }`}
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || digits.join('').length < 6}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Verify & Enter Dashboard</span>
            </>
          )}
        </button>

        {/* Resend Code Section */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span className="text-slate-500 font-mono">
                Resend in <span className="text-amber-400 font-semibold">{countdown}s</span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
