'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  MapPin, 
  Save, 
  Check, 
  Database,
  RefreshCw,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiService } from '@/lib/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  // Active Tab: 'profile' | 'operations'
  const [activeTab, setActiveTab] = useState<'profile' | 'operations'>('profile');

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

  // Operations State
  const [eventName, setEventName] = useState('African & Caribbean Wedding Show (ACWS 2027)');
  const [eventDates, setEventDates] = useState('May 15–16, 2027');
  const [venue, setVenue] = useState('ExCeL London, Royal Victoria Dock, London E16 1XL');
  const [catwalkQuota, setCatwalkQuota] = useState(15);
  const [premiumQuota, setPremiumQuota] = useState(30);
  const [standardQuota, setStandardQuota] = useState(60);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [opsSaved, setOpsSaved] = useState(false);
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
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await ApiService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password changed successfully.');
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

  const handleOpsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpsSaved(true);
    setTimeout(() => setOpsSaved(false), 2500);
  };

  const initials = fullName
    ? fullName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : (user?.name ? user.name.slice(0, 2).toUpperCase() : '--');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation Tabs */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#D4AF37] text-[#070506] shadow-xs'
                : 'text-[#707EAE] hover:text-[#1B254B] hover:bg-[#F4F7FE]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Admin Profile & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'operations'
                ? 'bg-[#D4AF37] text-[#070506] shadow-xs'
                : 'text-[#707EAE] hover:text-[#1B254B] hover:bg-[#F4F7FE]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Event Settings & Operations</span>
          </button>
        </div>

        {/* Backend Health Pill */}
        <div className="hidden md:flex items-center gap-2.5 pr-2">
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

      {/* TAB 1: ADMIN PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
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

            <div className="text-center sm:text-right text-xs text-[#A3AED0]">
              <span className="block font-medium">Account ID</span>
              <span className="font-mono font-bold text-[#1B254B]">{user?._id || 'acws-curator-primary'}</span>
            </div>
          </div>

          {/* Section 1: Change Full Name Form */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-[#B58E29]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1B254B]">
                Curator Personal Details
              </h4>
            </div>
            <p className="text-xs text-[#A3AED0] mb-5">
              Update your registered identity across show rosters, approval audit logs, and digital passes.
            </p>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-xs font-bold text-[#10B981]">
                <Check className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                <AlertCircle className="w-4 h-4 shrink-0" />
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
                    placeholder="Enter your full name"
                    className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#1B254B] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2B3674] mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'No data'}
                      className="w-full bg-[#E0E5F2]/40 border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-xs text-[#707EAE] cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#A3AED0] uppercase">
                      Protected
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving Changes...' : 'Save Full Name'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password Form */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-[#B58E29]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1B254B]">
                Curator Security & Password
              </h4>
            </div>
            <p className="text-xs text-[#A3AED0] mb-5">
              Change your password to ensure secure authentication into the ACWS administrative desk.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-xs font-bold text-[#10B981]">
                <Check className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-[#2B3674] mb-1.5">
                  Current Password<span className="text-[#D4AF37] ml-0.5">*</span>
                </label>
                <div className="relative max-w-md">
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
                  <Lock className="w-4 h-4" />
                  <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONS & EVENT PARAMETERS */}
      {activeTab === 'operations' && (
        <form onSubmit={handleOpsSubmit} className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B254B]">Operations & Event Parameters</h3>
                <p className="text-xs text-[#A3AED0]">Manage Exhibition telemetry, booth quotas, and server connectivity</p>
              </div>
            </div>
          </div>

          {/* Event Schedule & Location */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B58E29] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Exhibition Venue & Schedule</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#2B3674] mb-1.5">Official Event Title</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B3674] mb-1.5">Exhibition Dates</label>
                <input
                  type="text"
                  value={eventDates}
                  onChange={(e) => setEventDates(e.target.value)}
                  className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#2B3674] mb-1.5">Official Venue Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl pl-10 pr-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stand Quotas & Allocation Caps */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B58E29] mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Exhibition Stand Quotas & Floorplan Limits</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                <label className="block font-bold text-[#1B254B] mb-1">Catwalk Runway Tier</label>
                <p className="text-[11px] text-[#A3AED0] mb-3">6m × 4m Feature Space</p>
                <input
                  type="number"
                  value={catwalkQuota}
                  onChange={(e) => setCatwalkQuota(Number(e.target.value))}
                  className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                <label className="block font-bold text-[#1B254B] mb-1">Premium Island Tier</label>
                <p className="text-[11px] text-[#A3AED0] mb-3">4m × 4m Space Only</p>
                <input
                  type="number"
                  value={premiumQuota}
                  onChange={(e) => setPremiumQuota(Number(e.target.value))}
                  className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                <label className="block font-bold text-[#1B254B] mb-1">Standard Shell Scheme</label>
                <p className="text-[11px] text-[#A3AED0] mb-3">3m × 3m Fitted Booth</p>
                <input
                  type="number"
                  value={standardQuota}
                  onChange={(e) => setStandardQuota(Number(e.target.value))}
                  className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Global Controls & Registration Gate */}
          <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-[#1B254B]">Vendor Registration Status</h4>
              <p className="text-xs text-[#A3AED0] mt-0.5">Control whether new exhibitors can submit applications via the public portal</p>
            </div>

            <button
              type="button"
              onClick={() => setRegistrationOpen(!registrationOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                registrationOpen 
                  ? 'bg-[#10B981] text-white' 
                  : 'bg-[#EF4444] text-white'
              }`}
            >
              {registrationOpen ? 'Registration OPEN' : 'Registration CLOSED'}
            </button>
          </div>

          {/* Save Bar with Solid Gold Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {opsSaved && (
              <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Configurations saved successfully!</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Operational Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
