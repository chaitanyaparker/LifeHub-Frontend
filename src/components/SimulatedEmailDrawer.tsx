import React, { useState, useEffect } from 'react';
import { Mail, X, Copy, Check, ExternalLink, Inbox } from 'lucide-react';
import { SentEmail } from '../types/auth';
import { getSentEmails } from '../services/authStorage';

interface SimulatedEmailDrawerProps {
  onCopyOtp?: (otp: string) => void;
}

export const SimulatedEmailDrawer: React.FC<SimulatedEmailDrawerProps> = ({ onCopyOtp }) => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [activeEmail, setActiveEmail] = useState<SentEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const refreshEmails = () => {
    const list = getSentEmails();
    setEmails(list);
    if (list.length > 0 && !activeEmail) {
      setActiveEmail(list[0]);
    }
  };

  useEffect(() => {
    refreshEmails();
    const interval = setInterval(refreshEmails, 2000);
    return () => clearInterval(interval);
  }, []);

  const latestEmail = emails[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopyOtp) onCopyOtp(code);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!latestEmail) return null;

  return (
    <>
      {/* Floating Mini Notification Banner in bottom right */}
      <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full sm:w-auto animate-bounce-subtle">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Email Dispatch
              </span>
              <span className="text-[10px] text-slate-500">· Now</span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              OTP: <strong className="font-mono text-amber-300 font-bold">{latestEmail.otp}</strong> → {latestEmail.to}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopy(latestEmail.otp)}
              className="rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1"
              title="Copy code"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="View full email message"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Simulated Email Client Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Inbox className="h-4 w-4 text-amber-400" />
                <span>Simulated Mailbox / Sent Messages</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {latestEmail && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span><strong>From:</strong> AuthForge Security &lt;no-reply@authforge.dev&gt;</span>
                      <span className="font-mono text-[11px]">{new Date(latestEmail.sentAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300">
                      <strong>To:</strong> <span className="font-mono text-amber-300">{latestEmail.to}</span>
                    </div>
                    <div className="text-white font-medium">
                      <strong>Subject:</strong> {latestEmail.subject}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="py-2 text-xs text-slate-300 space-y-3">
                    <p>Hello,</p>
                    <p>
                      Please use the following 6-digit verification code to complete your security verification.
                    </p>
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-3.5">
                        <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-400">
                          {latestEmail.otp}
                        </span>
                        <button
                          onClick={() => handleCopy(latestEmail.otp)}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      This code is valid for 10 minutes. If you did not initiate this request, you can safely disregard this email.
                    </p>
                  </div>
                </div>
              )}

              {/* History list if multiple */}
              {emails.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-[11px] font-medium text-slate-400 mb-2">Recent Dispatches:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {emails.slice(1).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 text-[11px] text-slate-400"
                      >
                        <span className="font-mono">{m.to}</span>
                        <span className="font-mono text-amber-300 font-bold">{m.otp}</span>
                        <button
                          onClick={() => handleCopy(m.otp)}
                          className="text-slate-400 hover:text-white"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
