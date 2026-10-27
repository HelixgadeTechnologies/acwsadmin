'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  KeyRound,
  AlertCircle,
  Smartphone,
  Wifi,
  Share,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiService } from '@/lib/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error - iOS Safari specific property
        (typeof window.navigator !== 'undefined' && window.navigator.standalone === true);
      setIsPwaInstalled(isStandalone);
    }
  }, []);

  // Admin Profile State
  const [fullName, setFullName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Live Backend Health State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setBackendStatus('checking');
    const start = Date.now();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://acwsbackend.onrender.com/api/v1';
    try {
      const res = await fetch(`${apiBase}/admin/vendors/stats`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const latency = Date.now() - start;
      setPingLatency(latency);
      if (res.ok || res.status === 401) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
      setPingLatency(null);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await ApiService.updateProfile({ name: fullName.trim() });
      updateUser({ name: updated.name });
      setProfileSuccess('Profile name updated successfully.');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setPasswordSaving(true);
    try {
      await ApiService.changePassword({
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : (user?.name ? user.name.slice(0, 2).toUpperCase() : '--');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header & Live Health Bar */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1B254B]">Admin Profile & Security</h3>
            <p className="text-xs text-[#A3AED0]">Manage your administrator account credentials and access preferences</p>
          </div>
        </div>

        {/* Live Backend Telemetry Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
            <span className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-[#10B981]' : (backendStatus === 'checking' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]')
            }`} />
            <span className="text-[11px] font-bold text-[#1B254B]">
              {backendStatus === 'connected' ? `API: ${pingLatency}ms` : (backendStatus === 'checking' ? 'Pinging...' : 'Offline')}
            </span>
          </div>

          <button
            onClick={checkHealth}
            title="Ping Health"
            className="p-1.5 rounded-lg bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#707EAE] border border-[#E0E5F2] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Admin Identity Card */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37] text-[#070506] font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-[#1B254B]">
                {user?.name || 'No data'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-[#707EAE] mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#A3AED0]" />
              <span>{user?.email || 'No data'}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#FFF9E6] border border-[#F3DC82] text-xs font-bold text-[#8F6E1C] uppercase tracking-wider">
                {user?.role || 'Curator'}
              </span>
              <span className="text-xs text-[#A3AED0] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Verified Curation Access</span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-[11px] text-[#A3AED0] block">Account Identifier</span>
          <span className="font-mono text-xs font-bold text-[#B58E29] bg-[#FFF9E6] px-3 py-1 rounded-lg border border-[#F3DC82] mt-1 inline-block">
            {user?._id || 'No data'}
          </span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] text-[#B58E29] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B254B]">Personal Information</h4>
            <p className="text-xs text-[#A3AED0]">Update your display name across the curation desk</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-xs text-[#10B981] font-bold">
            <Check className="w-4 h-4" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2 text-xs text-[#EF4444] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">
                Full Name<span className="text-[#D4AF37] ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">
                Email Address <span className="text-[#A3AED0] font-normal">(System Protected)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#EFF4FB] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#707EAE] cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#A3AED0]">
              Name updates immediately synchronize across the sidebar and header.
            </span>

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Name Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] text-[#B58E29] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B254B]">Security & Password</h4>
            <p className="text-xs text-[#A3AED0]">Update your administrator authentication credentials</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-xs text-[#10B981] font-bold">
            <Check className="w-4 h-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2 text-xs text-[#EF4444] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="text-xs">
            <label className="block font-bold text-[#2B3674] mb-1.5">
              Current Password<span className="text-[#D4AF37] ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#1B254B] cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">
                New Password<span className="text-[#D4AF37] ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#1B254B] cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">
                Confirm New Password<span className="text-[#D4AF37] ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#1B254B] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#A3AED0]">
              Must be at least 6 characters in length.
            </span>

            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Phone Access & PWA Status Card */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B254B] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1B254B]">Mobile Phone Access & PWA</h4>
              <p className="text-xs text-[#A3AED0]">Install ACWS Admin on your smartphone for 1-tap full-screen access</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
            isPwaInstalled 
              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
              : 'bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]'
          }`}>
            {isPwaInstalled ? 'Installed as App' : 'PWA Ready'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
          <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
            <div className="flex items-center gap-2 font-bold text-[#1B254B] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Android (Chrome & Edge)</span>
            </div>
            <p className="text-[11px] text-[#707EAE] leading-relaxed">
              Look for the <strong>&quot;Install App&quot;</strong> banner at the bottom of your screen, or open the browser menu (⋮) and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
            <div className="flex items-center gap-2 font-bold text-[#1B254B] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
              <span>iPhone & iPad (Safari)</span>
            </div>
            <p className="text-[11px] text-[#707EAE] leading-relaxed">
              Tap Safari&apos;s <strong>Share</strong> button <Share className="w-3 h-3 inline mx-0.5 text-[#3B82F6]" /> in the browser bar, scroll down, and tap <strong>&quot;Add to Home Screen&quot;</strong> ⊕.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E0E5F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#707EAE] text-[11px]">
            <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Offline caching active • Responsive bottom mobile navigation enabled</span>
          </div>
          <span className="text-[11px] font-mono text-[#A3AED0]">PWA Engine v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
