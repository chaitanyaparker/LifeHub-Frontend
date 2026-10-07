import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Camera,
  Upload,
  Link as LinkIcon,
  X,
  Edit3,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { User } from '../types/auth';
import { api } from '../services/api';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updated: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Avatar Modal / Drawer state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notice & Feedback states
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Fallback Initials
  const initials = `${user.firstName ? user.firstName.charAt(0).toUpperCase() : ''}${
    user.lastName ? user.lastName.charAt(0).toUpperCase() : ''
  }` || 'LH';

  const avatarPresets = [
    '/src/assets/images/user_profile_avatar_1791308904789.jpg',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setIsAvatarModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setAvatarUrl(customAvatarUrl.trim());
      setCustomAvatarUrl('');
      setIsAvatarModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setBio(user.bio || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
    setIsEditing(false);
    setProfileNotice(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice(null);

    try {
      const res = await api.updateProfile({
        id: user.id,
        firstName,
        lastName,
        bio,
        phone,
        avatarUrl: avatarUrl || undefined,
      });

      if (res.success && res.user) {
        onUserUpdate(res.user);
        setIsEditing(false);
        setProfileNotice('Profile information saved successfully to database.');
        setTimeout(() => setProfileNotice(null), 3500);
      }
    } catch (err: unknown) {
      setProfileNotice(`Failed to update: ${(err as Error).message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordNotice({ text: 'New password must be at least 8 characters.', error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: 'New passwords do not match.', error: true });
      return;
    }

    try {
      const res = await api.updatePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordNotice({ text: 'Password successfully changed in DB!', error: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordNotice(null), 3500);
      } else {
        setPasswordNotice({ text: res.message || 'Failed to update password', error: true });
      }
    } catch (err: unknown) {
      setPasswordNotice({ text: (err as Error).message, error: true });
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      {/* Profile Card Header */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/80 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              User Profile & Account
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your personal credentials, profile picture, and bio
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 rounded-2xl border border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {profileNotice && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{profileNotice}</span>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-3xl border border-white/[0.06] bg-slate-950/60">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.firstName}
                referrerPolicy="no-referrer"
                className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-extrabold text-2xl flex items-center justify-center border-2 border-emerald-400/40 shadow-xl">
                {initials}
              </div>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-transform hover:scale-105 shadow-md cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Profile Picture</span>
              {isEditing && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Click camera to change
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {avatarUrl
                ? 'Custom picture uploaded. Displays in top navbar and executive dashboard.'
                : 'Using fallback initials initials badge based on your first and last name.'}
            </p>
            {isEditing && (
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-slate-900 text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Insert / Upload Picture</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-xs text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    Reset to Initials
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-white transition-colors ${
                  isEditing
                    ? 'border-white/[0.12] bg-slate-950 focus:border-emerald-500 focus:outline-none'
                    : 'border-transparent bg-slate-950/40 text-slate-300 cursor-not-allowed'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-white transition-colors ${
                  isEditing
                    ? 'border-white/[0.12] bg-slate-950 focus:border-emerald-500 focus:outline-none'
                    : 'border-transparent bg-slate-950/40 text-slate-300 cursor-not-allowed'
                }`}
                required
              />
            </div>
          </div>

          {/* USERNAME (SENSITIVE - CANNOT BE CHANGED AS REQUESTED) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <span>Username</span>
                <Lock className="h-3 w-3 text-slate-500" />
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Permanent Identity (Cannot be changed)
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-mono">@</span>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full rounded-2xl border border-white/[0.06] bg-slate-950/40 pl-8 pr-3.5 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed select-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Your unique system handle is bound to your account history and database records.
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Verified Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-2xl border border-white/[0.06] bg-slate-950/40 px-3.5 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Bio & Personal Mission
            </label>
            <textarea
              rows={3}
              disabled={!isEditing}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className={`w-full rounded-2xl border p-3 text-xs text-white transition-colors ${
                isEditing
                  ? 'border-white/[0.12] bg-slate-950 focus:border-emerald-500 focus:outline-none'
                  : 'border-transparent bg-slate-950/40 text-slate-300 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-white transition-colors ${
                isEditing
                  ? 'border-white/[0.12] bg-slate-950 focus:border-emerald-500 focus:outline-none'
                  : 'border-transparent bg-slate-950/40 text-slate-300 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Explicit Save button in Edit mode */}
          {isEditing && (
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-2xl border border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{profileSaving ? 'Saving to DB...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security Credentials Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/80 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Security & Password
        </h2>
        <p className="text-xs text-slate-400">
          Update account password stored in the database
        </p>

        {passwordNotice && (
          <div
            className={`p-3.5 rounded-2xl border text-xs ${
              passwordNotice.error
                ? 'bg-red-950/40 border-red-500/30 text-red-300'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {passwordNotice.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3.5 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-2xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-2xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-2xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Picture Insert Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.12] bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-emerald-400" />
                <span>Insert Profile Picture</span>
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Option 1: Upload from computer */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Option 1: Upload from Computer
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-white/[0.15] bg-slate-950/60 hover:bg-slate-800/60 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4 text-emerald-400" />
                <span>Choose Image File (JPG, PNG, WebP)</span>
              </button>
            </div>

            {/* Option 2: Image URL */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Option 2: Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Option 3: Presets */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Option 3: Choose Preset Avatar
              </label>
              <div className="flex items-center gap-3">
                {avatarPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset);
                      setIsAvatarModalOpen(false);
                    }}
                    className="h-12 w-12 rounded-xl overflow-hidden border border-white/[0.1] hover:border-emerald-400 transition-all cursor-pointer hover:scale-105"
                  >
                    <img
                      src={preset}
                      alt={`Preset ${index}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
