'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { ApiService } from '@/lib/api';

export default function AdminLayout({
  children,
  title = 'Dashboard & Analytics',
  breadcrumbs = ['Pages', 'Dashboard'],
  onRefresh
}: {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: string[];
  onRefresh?: () => void;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorCount, setVendorCount] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      ApiService.getStats().then((stats) => {
        setVendorCount(stats.totalVendors);
        setAttendeeCount(stats.totalAttendees);
      }).catch(console.error);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#1B254B]">
        <div className="w-10 h-10 border-4 border-[#E0E5F2] border-t-[#D4AF37] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#707EAE]">Initializing Curation Desk...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-[#1B254B]">
      {/* Sidebar */}
      <AdminSidebar
        vendorCount={vendorCount}
        attendeeCount={attendeeCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={onRefresh}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
