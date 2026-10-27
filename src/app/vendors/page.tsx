'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import VendorsDirectory from '@/components/vendors/VendorsDirectory';
import { ApiService } from '@/lib/api';
import { Vendor, VendorStatus } from '@/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const loadVendors = async () => {
    try {
      const res = await ApiService.getVendors({ limit: 100 });
      setVendors(res.vendors);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleStatusUpdate = async (id: string, status: VendorStatus) => {
    await ApiService.updateVendorStatus(id, status);
  };

  return (
    <AdminLayout
      title="Vendors Directory"
      breadcrumbs={['Pages', 'Vendors']}
      onRefresh={loadVendors}
    >
      <VendorsDirectory
        initialVendors={vendors}
        onStatusUpdate={handleStatusUpdate}
      />
    </AdminLayout>
  );
}
