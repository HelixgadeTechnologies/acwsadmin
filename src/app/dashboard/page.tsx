'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCards from '@/components/dashboard/StatCards';
import RecentApplicationsTable from '@/components/dashboard/RecentApplicationsTable';
import CategoryDistribution from '@/components/dashboard/CategoryDistribution';
import { ApiService } from '@/lib/api';
import { KpiStats, Vendor, VendorStatus } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<KpiStats>({
    totalVendors: 0,
    approvedCount: 0,
    pendingCount: 0,
    waitlistedCount: 0,
    rejectedCount: 0,
    catwalkCount: 0,
    premiumCount: 0,
    standardCount: 0,
    totalAttendees: 0,
    attendeesCheckedIn: 0,
    totalRevenue: 0,
    vendorRevenue: 0,
    attendeeRevenue: 0
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const loadData = async () => {
    try {
      const [s, v] = await Promise.all([
        ApiService.getStats(),
        ApiService.getVendors({ limit: 10 })
      ]);
      setStats(s);
      setVendors(v.vendors);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: VendorStatus) => {
    try {
      await ApiService.updateVendorStatus(id, status);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <AdminLayout
      title="Dashboard & Analytics"
      breadcrumbs={['Pages', 'Dashboard']}
      onRefresh={loadData}
    >
      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentApplicationsTable
            vendors={vendors}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div>
          <CategoryDistribution vendors={vendors} />
        </div>
      </div>
    </AdminLayout>
  );
}
