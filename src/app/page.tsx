'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#1B254B]">
      <div className="w-10 h-10 border-4 border-[#E0E5F2] border-t-[#D4AF37] rounded-full animate-spin mb-4" />
      <p className="text-xs uppercase tracking-widest text-[#707EAE] font-bold">Redirecting to Curation Desk...</p>
    </div>
  );
}
