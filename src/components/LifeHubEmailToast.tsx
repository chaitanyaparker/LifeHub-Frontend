import React, { useState, useEffect } from 'react';
import { Mail, Check, Copy, X } from 'lucide-react';

interface LifeHubEmailToastProps {
  notification: { email: string; otp: string } | null;
  onClear: () => void;
  onQuickFill?: (otp: string) => void;
}

export const LifeHubEmailToast: React.FC<LifeHubEmailToastProps> = ({
  notification,
  onClear,
  onQuickFill,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      // Auto-hide after 15 seconds
      onClear();
    }, 15000);
    return () => clearTimeout(timer);
  }, [notification, onClear]);

  if (!notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-subtle">
      <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Verification Code Sent
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-300 truncate">
            Code: <strong className="font-mono text-emerald-300 font-bold tracking-widest">{notification.otp}</strong>
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            to {notification.email}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onQuickFill && (
            <button
              onClick={() => onQuickFill(notification.otp)}
              className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Fill Code
            </button>
          )}
          <button
            onClick={onClear}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
