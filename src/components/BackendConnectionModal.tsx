import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  Code,
  Globe,
  Database,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { getActiveBackendUrl, allotBackendUrl } from '../config/apiConfig';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlChanged?: (newUrl: string) => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose,
  onUrlChanged,
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status: number;
    latencyMs: number;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveBackendUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setSaveSuccess(false);
    try {
      const res = await api.testBackendHealth(inputUrl);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        ok: false,
        status: 0,
        latencyMs: 0,
        error: (err as Error).message || 'Failed to ping backend',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    allotBackendUrl(trimmed || null);
    const active = getActiveBackendUrl();
    setCurrentUrl(active);
    setSaveSuccess(true);
    if (onUrlChanged) {
      onUrlChanged(active);
    }
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleResetToDefault = () => {
    allotBackendUrl(null);
    const active = getActiveBackendUrl();
    setCurrentUrl(active);
    setInputUrl('');
    setTestResult(null);
    setSaveSuccess(true);
    if (onUrlChanged) {
      onUrlChanged(active);
    }
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Backend API Connection Settings</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect LifeHub to any external backend server URL or use the built-in Express backend.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Status Pill */}
        <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Current Active Target:</span>
            <span className="font-mono font-semibold text-white">
              {currentUrl ? currentUrl : 'Built-in Express Core (Local /api)'}
            </span>
          </div>
          {currentUrl && (
            <button
              onClick={handleResetToDefault}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
            >
              Reset to Default (Local)
            </button>
          )}
        </div>

        {/* Custom URL Input Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>Allot Custom Backend Server URL</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              (Leave empty for default local Express)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setSaveSuccess(false);
              }}
              placeholder="e.g. https://api.yourdomain.com or http://localhost:5000"
              className="w-full rounded-2xl border border-white/[0.1] bg-slate-950/80 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-950 focus:outline-none transition-colors font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Accepts any valid HTTP/HTTPS URL. All requests will automatically append endpoints like <code className="text-emerald-300 font-mono">/api/lifehub/tasks</code>.
          </p>
        </div>

        {/* Action Buttons: Test Connection & Save */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl border border-white/[0.1] bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{testing ? 'Testing Ping...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save & Connect Backend</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
              testResult.ok
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : 'border-red-500/30 bg-red-950/40 text-red-300'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                {testResult.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span>
                  {testResult.ok
                    ? `Connection Successful (${testResult.latencyMs}ms)`
                    : 'Connection Failed'}
                </span>
              </span>
              <span className="font-mono text-[10px]">
                {testResult.ok ? `Status: ${testResult.status} OK` : `Error: ${testResult.error}`}
              </span>
            </div>
            {testResult.ok ? (
              <p className="text-[11px] opacity-90 font-mono">
                Backend responded: {JSON.stringify(testResult.data)}
              </p>
            ) : (
              <p className="text-[11px] opacity-90 leading-relaxed">
                Could not connect. Ensure your backend server is running and has CORS enabled (header <code className="font-mono text-white">Access-Control-Allow-Origin: *</code>).
              </p>
            )}
          </div>
        )}

        {/* Save Confirmation */}
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Backend target updated to <strong>{currentUrl || 'Built-in Express (Local)'}</strong>! All subsequent frontend requests will route here.
            </span>
          </div>
        )}

        {/* Collapsible Developer Docs & Endpoints Guide */}
        <div className="pt-2 border-t border-white/[0.08]">
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="w-full text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>Backend Developer Integration Guide & Endpoints Reference</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{showDocs ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showDocs && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] text-xs space-y-4 max-h-64 overflow-y-auto font-sans animate-fade-in">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Authentication & Bearer Token</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upon login/registration, the frontend stores the session token and sends it in every authenticated request header:
                </p>
                <pre className="p-2 rounded-xl bg-slate-900 font-mono text-[10px] text-emerald-300">
                  Authorization: Bearer &lt;session_token&gt;
                </pre>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-amber-400" />
                  <span>Required REST API Endpoints</span>
                </h4>
                <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-slate-300">
                  <div><span className="text-emerald-400 font-bold">GET</span> /api/health</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/auth/register (firstName, lastName, username, email, password)</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/auth/login (identifier, password)</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/auth/verify-otp (email, otp)</div>
                  <div><span className="text-emerald-400 font-bold">GET</span> /api/auth/me</div>
                  <div><span className="text-emerald-400 font-bold">GET</span> /api/lifehub/summary</div>
                  <div><span className="text-emerald-400 font-bold">GET/POST</span> /api/lifehub/tasks</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/lifehub/tasks/:id/toggle</div>
                  <div><span className="text-emerald-400 font-bold">GET/POST</span> /api/lifehub/bills</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/lifehub/bills/:id/toggle-paid</div>
                  <div><span className="text-emerald-400 font-bold">GET/POST</span> /api/lifehub/calendar</div>
                  <div><span className="text-emerald-400 font-bold">GET/POST</span> /api/lifehub/notes</div>
                  <div><span className="text-emerald-400 font-bold">GET</span> /api/lifehub/notifications</div>
                  <div><span className="text-emerald-400 font-bold">PUT</span> /api/user/profile</div>
                  <div><span className="text-emerald-400 font-bold">POST</span> /api/contact</div>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                <h4 className="font-bold text-white text-xs">CORS Configuration:</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  If hosting frontend and backend on different origins, configure your backend CORS policy to allow your frontend URL with <code className="text-emerald-300 font-mono">Content-Type</code> and <code className="text-emerald-300 font-mono">Authorization</code> headers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
