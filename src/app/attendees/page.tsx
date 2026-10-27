'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AttendeesDirectory from '@/components/attendees/AttendeesDirectory';
import { ApiService } from '@/lib/api';
import { Attendee } from '@/types';

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const loadAttendees = async () => {
    try {
      const data = await ApiService.getAttendees();
      setAttendees(data);
    } catch (err) {
      console.error('Failed to load attendees:', err);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, []);

  const handleToggleCheckin = async (id: string) => {
    await ApiService.toggleAttendeeCheckin(id);
  };

  return (
    <AdminLayout
      title="Attendees & Ticket Holders"
      breadcrumbs={['Pages', 'Attendees']}
      onRefresh={loadAttendees}
    >
      <AttendeesDirectory
        initialAttendees={attendees}
        onToggleCheckin={handleToggleCheckin}
        onAttendeesImported={loadAttendees}
      />
    </AdminLayout>
  );
}
