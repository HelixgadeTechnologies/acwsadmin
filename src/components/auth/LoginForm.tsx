'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-[440px]">
        {/* Official ACWS Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-3xl bg-white border border-[#E0E5F2] shadow-xs mb-3 flex items-center justify-center">
            <Image
              src="/images/acws-logo.png"
              alt="African & Caribbean Wedding Show Logo"
              width={200}
              height={80}
              priority
              className="object-contain h-auto"
            />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#B58E29]">
              ACWS 2027 Admin Curation Desk
            </span>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-[#E0E5F2] p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-[#2B3674] tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-[#A3AED0] mt-1.5 font-medium">
              Enter your curator email and password to access the portal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B3674] uppercase tracking-wider mb-2">
                Email Address<span className="text-[#D4AF37] ml-0.5">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@acws.co.uk"
                className="w-full px-4 py-3 rounded-xl border border-[#E0E5F2] bg-[#F4F7FE]/60 text-sm font-medium text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B3674] uppercase tracking-wider mb-2">
                Password<span className="text-[#D4AF37] ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-[#E0E5F2] bg-[#F4F7FE]/60 text-sm font-medium text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#2B3674] transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Options: Remember me & Security */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E0E5F2] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                />
                <span className="font-semibold text-[#2B3674]">
                  Keep me logged in
                </span>
              </label>

              <span className="text-[11px] font-bold text-[#8F6E1C] bg-[#FFF9E6] px-2.5 py-0.5 rounded-full border border-[#F3DC82]">
                Enterprise
              </span>
            </div>

            {/* Gold Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-sm transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#070506] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#A3AED0] font-medium mt-6">
          Official ExCeL London Pass & Exhibitor Desk • ACWS 2027
        </p>
      </div>
    </div>
  );
}
