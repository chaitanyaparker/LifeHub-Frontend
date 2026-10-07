import React, { useState } from 'react';
import {
  X,
  Server,
  Code2,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  Terminal,
} from 'lucide-react';
import { BackendConfig } from '../types/auth';
import { saveBackendConfig } from '../services/authStorage';

interface BackendIntegrationGuideProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onConfigChange: (newConfig: BackendConfig) => void;
}

export const BackendIntegrationGuide: React.FC<BackendIntegrationGuideProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState<BackendConfig>(config);
  const [activeTab, setActiveTab] = useState<'config' | 'contract' | 'express-template'>('contract');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveBackendConfig(localConfig);
    onConfigChange(localConfig);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePingBackend = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await fetch(`${localConfig.baseUrl}`, { method: 'GET' });
      setTestStatus({
        loading: false,
        success: res.ok,
        message: res.ok
          ? `Backend responded with HTTP ${res.status} OK!`
          : `Backend reached but returned HTTP ${res.status}`,
      });
    } catch (err: unknown) {
      setTestStatus({
        loading: false,
        success: false,
        message: `Connection failed: ${(err as Error).message}. Check CORS and URL.`,
      });
    }
  };

  const curlRegister = `curl -X POST "${localConfig.baseUrl}${localConfig.endpoints.register}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Chaitanya",
    "lastName": "Parker",
    "username": "chaitanya_p",
    "email": "chaitanyaparker08@gmail.com",
    "password": "Password123!"
  }'`;

  const curlVerify = `curl -X POST "${localConfig.baseUrl}${localConfig.endpoints.verifyOtp}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "chaitanyaparker08@gmail.com",
    "otp": "482910"
  }'`;

  const curlLogin = `curl -X POST "${localConfig.baseUrl}${localConfig.endpoints.login}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "chaitanyaparker08@gmail.com",
    "password": "Password123!"
  }'`;

  const expressSnippet = `// Node.js + Express backend auth routes blueprint
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory or Database store
const users = [];
const pendingOtps = new Map();

// 1. Register: receives firstName, lastName, username, email, password
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(email.toLowerCase(), { otp, firstName, lastName, username, password });
  // Send email via SendGrid, Nodemailer, or Resend here:
  console.log(\`[Email Sent to \${email}] Verification code: \${otp}\`);
  res.json({ success: true, message: 'OTP sent to email', otp });
});

// 2. Verify OTP: receives email, otp
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = pendingOtps.get(email.toLowerCase());
  if (!record || record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  const newUser = {
    id: 'usr_' + Date.now(),
    firstName: record.firstName,
    lastName: record.lastName,
    username: record.username,
    email: email.toLowerCase(),
    isEmailVerified: true,
    authProvider: 'email'
  };
  users.push(newUser);
  pendingOtps.delete(email.toLowerCase());
  res.json({ success: true, message: 'Verified successfully', user: newUser });
});

// 3. Login: receives identifier (username OR email) and password
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  const user = users.find(u => u.email === identifier.toLowerCase() || u.username === identifier.toLowerCase());
  if (!user) return res.status(401).json({ success: false, message: 'Account not found' });
  res.json({ success: true, user, token: 'jwt_mock_token_123' });
});

// 4. Google OAuth: receives Google verified profile
app.post('/api/auth/google', async (req, res) => {
  const { email, firstName, lastName, avatarUrl } = req.body;
  let user = users.find(u => u.email === email.toLowerCase());
  if (!user) {
    user = { id: 'usr_g_' + Date.now(), firstName, lastName, username: email.split('@')[0], email, avatarUrl, isEmailVerified: true, authProvider: 'google' };
    users.push(user);
  }
  res.json({ success: true, user, token: 'jwt_mock_google_token_123' });
});

app.listen(5000, () => console.log('Auth API listening on port 5000'));`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Backend API Blueprint & Connection
              </h2>
              <p className="text-xs text-slate-400">
                Connect your real backend or inspect the exact API contract
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('contract')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'contract'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            API Contract & cURL
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backend URL Config
          </button>
          <button
            onClick={() => setActiveTab('express-template')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'express-template'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Express.js Starter Code
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'contract' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-200">
                <p className="font-semibold mb-1">
                  How the frontend communicates with your backend:
                </p>
                <p className="text-slate-300">
                  This frontend is ready out-of-the-box in <strong>Sandbox Mode</strong> (simulates emails, OTPs, and sessions). To switch to your real backend, configure the Base URL below and toggle <strong>Live Backend Mode</strong>.
                </p>
              </div>

              {/* Endpoint 1: Register */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      POST
                    </span>
                    <span className="font-mono text-xs text-white">/api/auth/register</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlRegister, 'reg')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'reg' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'reg' ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Registers user with <strong>firstName, lastName, username, email, password</strong>. Backend sends 6-digit OTP to the email.
                </p>
                <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {curlRegister}
                </pre>
              </div>

              {/* Endpoint 2: Verify OTP */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      POST
                    </span>
                    <span className="font-mono text-xs text-white">/api/auth/verify-otp</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlVerify, 'verify')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'verify' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'verify' ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Submits 6-digit OTP code to verify account and returns user profile + session token.
                </p>
                <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {curlVerify}
                </pre>
              </div>

              {/* Endpoint 3: Login */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      POST
                    </span>
                    <span className="font-mono text-xs text-white">/api/auth/login</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlLogin, 'login')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'login' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'login' ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  User fills username OR email into <strong>identifier</strong>, and password.
                </p>
                <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {curlLogin}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <label className="block text-xs font-semibold text-white mb-2">
                  Operating Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, mode: 'sandbox' })}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      localConfig.mode === 'sandbox'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>Sandbox Engine (Recommended)</span>
                      {localConfig.mode === 'sandbox' && (
                        <CheckCircle className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Complete in-browser client simulation with instant OTP delivery, account storage, and Google OAuth flow.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, mode: 'live' })}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      localConfig.mode === 'live'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>Live Backend Proxy</span>
                      {localConfig.mode === 'live' && (
                        <CheckCircle className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Sends real HTTP JSON requests to your external Node.js / Express / Python / Go backend.
                    </p>
                  </button>
                </div>
              </div>

              {/* Base URL */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Backend Base URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localConfig.baseUrl}
                      onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                      placeholder="http://localhost:5000"
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handlePingBackend}
                      disabled={testStatus?.loading}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {testStatus?.loading ? 'Testing...' : 'Test Ping'}
                    </button>
                  </div>
                  {testStatus && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        testStatus.success
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950/40 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {testStatus.success ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      )}
                      <span>{testStatus.message}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Endpoint Paths</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">Register:</span>
                      <input
                        type="text"
                        value={localConfig.endpoints.register}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            endpoints: { ...localConfig.endpoints, register: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Verify OTP:</span>
                      <input
                        type="text"
                        value={localConfig.endpoints.verifyOtp}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            endpoints: { ...localConfig.endpoints, verifyOtp: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Login:</span>
                      <input
                        type="text"
                        value={localConfig.endpoints.login}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            endpoints: { ...localConfig.endpoints, login: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Google OAuth:</span>
                      <input
                        type="text"
                        value={localConfig.endpoints.googleAuth}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            endpoints: { ...localConfig.endpoints, googleAuth: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'express-template' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Ready-to-run Express.js backend implementation matching this frontend:
                </p>
                <button
                  onClick={() => copyToClipboard(expressSnippet, 'snippet')}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  {copiedKey === 'snippet' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'snippet' ? 'Copied' : 'Copy All Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {expressSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
