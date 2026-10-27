'use client';

import React, { useState } from 'react';
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
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2B3674] tracking-tight">
            Sign In
          </h1>
          <p className="text-sm text-[#A3AED0] mt-2 font-medium">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-2.5">
              Email<span className="text-[#D4AF37] ml-0.5">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@acws.co.uk"
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E0E5F2] bg-white text-sm text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-2.5">
              Password<span className="text-[#D4AF37] ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E0E5F2] bg-white text-sm text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37] transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#2B3674] transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Options: Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E0E5F2] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#2B3674]">
                Keep me logged in
              </span>
            </label>

            <span className="text-xs text-[#A3AED0] font-medium">
              Enterprise Access
            </span>
          </div>

          {/* Gold Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-[#070506] border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
