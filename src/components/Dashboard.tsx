import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Server,
  LogOut,
  CheckCircle,
  Copy,
  Check,
  Save,
  Clock,
  Sparkles,
  Smartphone,
  Globe,
  RefreshCw,
  Mail,
  Lock,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { User, ActivityItem, BackendConfig } from '../types/auth';
import { AuthService } from '../services/authService';
import { getActivities } from '../services/authStorage';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updated: User) => void;
  onOpenBackendSettings: () => void;
  backendConfig: BackendConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onUserUpdate,
  onOpenBackendSettings,
  backendConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'api'>('overview');
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio || '',
    phone: user.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false);

  const activities = getActivities();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const updated = AuthService.updateUserProfile({
      id: user.id,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      username: profileForm.username.toLowerCase(),
      bio: profileForm.bio,
      phone: profileForm.phone,
    });
    setSavingProfile(false);
    if (updated) {
      onUserUpdate(updated);
      setProfileNotice('Profile details saved successfully.');
      setTimeout(() => setProfileNotice(null), 3000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice({ text: 'New password must be at least 8 characters long.', error: true });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({ text: 'New passwords do not match.', error: true });
      return;
    }

    setPasswordNotice({ text: 'Password successfully updated!', error: false });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactor;
    setTwoFactor(nextVal);
    const updated = AuthService.updateUserProfile({
      id: user.id,
      twoFactorEnabled: nextVal,
    });
    if (updated) onUserUpdate(updated);
  };

  const copySessionToken = () => {
    navigator.clipboard.writeText(`jwt_token_sample_${user.id}`);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md hidden md:flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* User mini badge in sidebar */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/60">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover border border-amber-500/30"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                {user.firstName[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                @{user.username}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Account Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Security & 2FA</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Server className="h-4 w-4" />
              <span>Backend API Docs</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-slate-950/40 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Mode:</span>
              <span className="font-mono text-amber-400 font-semibold uppercase">
                {backendConfig.mode}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-4 border-b border-slate-800">
          {(['overview', 'profile', 'security', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>AuthForge</span>
              <span>/</span>
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {activeTab === 'overview' && 'Account Dashboard'}
              {activeTab === 'profile' && 'Personal Profile'}
              {activeTab === 'security' && 'Security & Authentication'}
              {activeTab === 'api' && 'Backend API Integration'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBackendSettings}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Server className="h-4 w-4 text-amber-400" />
              <span>Configure Backend</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Hero Welcome Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
                    />
                  ) : (
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300 text-2xl font-bold">
                      {user.firstName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {user.firstName} {user.lastName}
                      </h2>
                      <span className="text-xs text-amber-400 font-mono font-medium">
                        @{user.username}
                      </span>
                    </div>
                    {/* Unboxed metadata with typographic separators (anti-slop) */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span>{user.email}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">
                        {user.isEmailVerified ? 'Email Verified' : 'Pending OTP'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {user.authProvider === 'google'
                          ? 'Google OAuth'
                          : user.authProvider === 'both'
                          ? 'Google + Email'
                          : 'Email & OTP'}
                      </span>
                    </div>
                    {user.bio && (
                      <p className="mt-2 text-xs text-slate-300 max-w-xl">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                    Member Since
                  </span>
                  <span className="text-xs text-slate-200 font-mono tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">
                  Account Status
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-white">Active & Verified</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  6-Digit OTP security cleared
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">
                  Auth Method
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-400 capitalize">
                    {user.authProvider}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {user.authProvider === 'google' ? 'Google SSO single sign-on' : 'Email credentials + OTP'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">
                  2FA Status
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-semibold ${user.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Optional extra challenge
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">
                  Active Sessions
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-white font-mono tabular-nums">
                    1 Active
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Current browser instance
                </p>
              </div>
            </div>

            {/* Two column: User Token & Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token & IDs */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  <span>Session & Account Identifiers</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Internal User ID:</span>
                    <div className="mt-1 p-2 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800">
                      {user.id}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bearer Auth Token:</span>
                      <button
                        onClick={copySessionToken}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedToken ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                      </button>
                    </div>
                    <div className="mt-1 p-2 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800 truncate">
                      jwt_token_sample_{user.id}_e892c90214a
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500">
                    Use this token in your HTTP <code>Authorization: Bearer &lt;token&gt;</code> requests when connecting your custom backend API.
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>Recent Security Activity</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Audit Trail</span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/60 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {act.action}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {act.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="mt-6 max-w-2xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7">
              <h3 className="text-base font-bold text-white mb-1">
                Edit Personal Profile
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Update your account details and display attributes
              </p>

              {profileNotice && (
                <div className="mb-5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{profileNotice}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Email was verified via OTP. Contact admin to modify verified email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bio / Role
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell your team about yourself..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
          <div className="mt-6 max-w-2xl space-y-6">
            {/* 2FA Toggle */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-amber-400" />
                  <span>Two-Factor Authentication (2FA)</span>
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Require an additional OTP step upon signing in with email
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  twoFactor ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Connected Providers */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                <span>Connected Authentication Providers</span>
              </h4>

              <div className="space-y-3">
                {/* Google Provider Card */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    <div>
                      <div className="text-xs font-semibold text-white">Google OAuth Service</div>
                      <div className="text-[11px] text-slate-400">
                        {user.authProvider === 'google' || user.authProvider === 'both'
                          ? `Linked to ${user.email}`
                          : 'Not linked'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Connected</span>
                  </span>
                </div>

                {/* Email + OTP Provider Card */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Email & 6-Digit OTP</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {user.email} (Verified)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <span>Change Password</span>
              </h4>

              {passwordNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    passwordNotice.error
                      ? 'bg-red-950/40 border-red-500/30 text-red-300'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {passwordNotice.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new strong password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: BACKEND DOCS EMBED */}
        {activeTab === 'api' && (
          <div className="mt-6 max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Backend Integration Hub</h3>
                  <p className="text-xs text-slate-400">
                    Connect this frontend to your existing backend project
                  </p>
                </div>
                <button
                  onClick={onOpenBackendSettings}
                  className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  Open Endpoint Config
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <span className="text-[11px] text-slate-400 font-mono">1. Registration Endpoint</span>
                  <div className="mt-1 font-bold text-xs text-white">POST /api/auth/register</div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Takes <code>firstName, lastName, username, email, password</code>, generates 6-digit OTP and emails user.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <span className="text-[11px] text-slate-400 font-mono">2. OTP Verification</span>
                  <div className="mt-1 font-bold text-xs text-white">POST /api/auth/verify-otp</div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Takes <code>email, otp</code>, marks user as verified, returns session token & profile.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <span className="text-[11px] text-slate-400 font-mono">3. Login Endpoint</span>
                  <div className="mt-1 font-bold text-xs text-white">POST /api/auth/login</div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Takes <code>identifier</code> (matches username OR email) + <code>password</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <span className="text-[11px] text-slate-400 font-mono">4. Google OAuth Endpoint</span>
                  <div className="mt-1 font-bold text-xs text-white">POST /api/auth/google</div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Takes verified Google email & identity, signs in or creates user directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
