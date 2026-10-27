'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import SettingsPage from '@/components/settings/SettingsPage';

export default function SettingsRoute() {
  return (
    <AdminLayout
      title="Settings & Operations"
      breadcrumbs={['Pages', 'Settings']}
    >
      <SettingsPage />
    </AdminLayout>
  );
}
