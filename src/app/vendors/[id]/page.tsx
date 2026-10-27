'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import VendorProfileView from '@/components/vendors/VendorProfileView';
import { ApiService } from '@/lib/api';
import { Vendor, VendorStatus } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function VendorProfileContent({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.id;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVendor = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getVendorById(vendorId);
      setVendor(data);
    } catch (err) {
      console.error('Failed to load vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  const handleStatusChange = async (id: string, status: VendorStatus) => {
    await ApiService.updateVendorStatus(id, status);
  };

  return (
    <AdminLayout
      title={vendor ? vendor.businessName : 'Vendor Profile'}
      breadcrumbs={['Pages', 'Vendors', 'Profile']}
      onRefresh={loadVendor}
    >
      {loading ? (
        <div className="py-20 text-center text-[#9CA3AF]">
          <div className="w-8 h-8 border-2 border-[#261F2A] border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading vendor dossier...</p>
        </div>
      ) : vendor ? (
        <VendorProfileView
          vendor={vendor}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="py-20 text-center">
          <p className="text-base font-bold text-[#1B254B]">No data</p>
          <p className="text-xs text-[#707EAE] mt-1">Vendor application not found or unavailable.</p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs text-[#B58E29] font-bold hover:underline mt-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vendors Directory</span>
          </Link>
        </div>
      )}
    </AdminLayout>
  );
}

export default function VendorProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-[#707EAE]">
          <div className="w-8 h-8 border-2 border-[#E0E5F2] border-t-[#D4AF37] rounded-full animate-spin" />
        </div>
      }
    >
      <VendorProfileContent params={params} />
    </Suspense>
  );
}
