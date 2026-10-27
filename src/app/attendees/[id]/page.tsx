'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AttendeeProfileView from '@/components/attendees/AttendeeProfileView';
import { ApiService } from '@/lib/api';
import { Attendee } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function AttendeeProfileContent({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const attendeeId = resolvedParams.id;

  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAttendee = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAttendeeById(attendeeId);
      setAttendee(data);
    } catch (err) {
      console.error('Failed to load attendee:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendee();
  }, [attendeeId]);

  const handleToggleCheckin = async (id: string): Promise<Attendee> => {
    const updated = await ApiService.toggleAttendeeCheckin(id);
    return updated;
  };

  return (
    <AdminLayout
      title={attendee ? attendee.fullName : 'Attendee Profile'}
      breadcrumbs={['Pages', 'Attendees', 'Profile']}
      onRefresh={loadAttendee}
    >
      {loading ? (
        <div className="py-20 text-center text-[#9CA3AF]">
          <div className="w-8 h-8 border-2 border-[#E0E5F2] border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading attendee information...</p>
        </div>
      ) : attendee ? (
        <AttendeeProfileView
          attendee={attendee}
          onToggleCheckin={handleToggleCheckin}
        />
      ) : (
        <div className="py-20 text-center">
          <p className="text-base font-bold text-[#1B254B]">No data</p>
          <p className="text-xs text-[#707EAE] mt-1">Attendee record not found or unavailable.</p>
          <Link
            href="/attendees"
            className="inline-flex items-center gap-1.5 text-xs text-[#B58E29] font-bold hover:underline mt-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Attendees Directory</span>
          </Link>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AttendeeProfilePage({
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
      <AttendeeProfileContent params={params} />
    </Suspense>
  );
}
