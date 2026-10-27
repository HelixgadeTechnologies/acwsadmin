'use client';

import React, { useState } from 'react';
import { Attendee } from '@/types';
import { 
  Search, 
  Upload, 
  Download, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import CsvImportModal from './CsvImportModal';

export default function AttendeesDirectory({
  initialAttendees,
  onToggleCheckin,
  onAttendeesImported
}: {
  initialAttendees: Attendee[];
  onToggleCheckin: (id: string) => Promise<void>;
  onAttendeesImported: () => void;
}) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [search, setSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  React.useEffect(() => {
    setAttendees(initialAttendees);
  }, [initialAttendees]);

  const filteredAttendees = attendees.filter(a => {
    if (ticketFilter !== 'all' && a.ticketType !== ticketFilter) return false;
    if (statusFilter === 'checkedIn' && !a.checkedIn) return false;
    if (statusFilter === 'notCheckedIn' && a.checkedIn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = a.fullName.toLowerCase().includes(q);
      const matchesRef = a.refCode.toLowerCase().includes(q);
      const matchesEmail = a.email.toLowerCase().includes(q);
      const matchesPartner = a.partnerName && a.partnerName.toLowerCase().includes(q);
      if (!matchesName && !matchesRef && !matchesEmail && !matchesPartner) return false;
    }

    return true;
  });

  const handleToggle = async (id: string) => {
    await onToggleCheckin(id);
    setAttendees(prev => prev.map(a => a._id === id ? { ...a, checkedIn: !a.checkedIn } : a));
  };

  const exportCsv = () => {
    const headers = ['Ref Code', 'Full Name', 'Partner Name', 'Email', 'Phone', 'Ticket Type', 'Checked In'];
    const rows = filteredAttendees.map(a => [
      `"${a.refCode}"`,
      `"${a.fullName}"`,
      `"${a.partnerName || ''}"`,
      `"${a.email}"`,
      `"${a.phone || ''}"`,
      `"${a.ticketType}"`,
      `"${a.checkedIn ? 'Yes' : 'No'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ACWS_GuestList_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Action Bar */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee by name, email, or ref..."
            className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Action Buttons in Gold */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Attendees CSV</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] hover:bg-[#FDF2D0] border border-[#F3DC82] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export List</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: `All Tickets (${attendees.length})` },
          { id: 'vip', label: 'VIP Passholders' },
          { id: 'catwalk-exclusive', label: 'Catwalk Exclusive' },
          { id: 'standard', label: 'General Admission' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTicketFilter(tab.id)}
            className={`
              px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer font-bold
              ${ticketFilter === tab.id
                ? 'bg-[#D4AF37] text-[#070506] shadow-xs'
                : 'bg-white text-[#707EAE] hover:text-[#1B254B] border border-[#E0E5F2]'}
            `}
          >
            {tab.label}
          </button>
        ))}

        <div className="h-4 w-px bg-[#E0E5F2] mx-1" />

        <button
          onClick={() => setStatusFilter(statusFilter === 'checkedIn' ? 'all' : 'checkedIn')}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
            statusFilter === 'checkedIn'
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
              : 'bg-white text-[#707EAE] border-[#E0E5F2]'
          }`}
        >
          Checked In Only
        </button>
      </div>

      {/* Guest List Table */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E0E5F2] flex items-center justify-between text-xs text-[#707EAE]">
          <span>Showing <strong className="text-[#1B254B]">{filteredAttendees.length}</strong> ticket holders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F4F7FE] border-b border-[#E0E5F2] text-[#A3AED0] font-bold uppercase tracking-wider text-xs">
                <th className="py-4.5 pl-6">Ref Code</th>
                <th className="py-4.5 px-4">Guest & Partner</th>
                <th className="py-4.5 px-4">Contact Details</th>
                <th className="py-4.5 px-4">Ticket Type</th>
                <th className="py-4.5 px-4">Venue Check-In</th>
                <th className="py-4.5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2]">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#A3AED0] text-sm">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att) => (
                  <tr key={att._id} className="hover:bg-[#F4F7FE] transition-colors">
                    <td className="py-5 pl-6 font-mono font-bold text-[#B58E29] text-sm">
                      {att.refCode}
                    </td>
                    <td className="py-5 px-4">
                      <div className="font-bold text-[#1B254B] text-base">{att.fullName}</div>
                      {att.partnerName && (
                        <div className="text-xs text-[#707EAE] mt-0.5">Partner: {att.partnerName}</div>
                      )}
                    </td>
                    <td className="py-5 px-4">
                      <div className="text-[#1B254B] font-medium text-sm">{att.email}</div>
                      {att.phone && <div className="text-xs text-[#707EAE] mt-0.5">{att.phone}</div>}
                    </td>
                    <td className="py-5 px-4 capitalize">
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                        att.ticketType === 'vip' 
                          ? 'bg-[#FFF9E6] text-[#8F6E1C] border-[#F3DC82]'
                          : (att.ticketType === 'catwalk-exclusive' 
                            ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                            : 'bg-[#F4F7FE] text-[#2B3674] border-[#E0E5F2]')
                      }`}>
                        {att.ticketType.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {att.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">
                          <Clock className="w-4 h-4" />
                          <span>Pending Arrival</span>
                        </span>
                      )}
                    </td>
                    <td className="py-5 pr-6 text-right">
                      <button
                        onClick={() => handleToggle(att._id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          att.checkedIn
                            ? 'bg-[#FFF5F5] text-[#EF4444] border border-[#FCA5A5]/40 hover:bg-[#FEE2E2]'
                            : 'bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506]'
                        }`}
                      >
                        {att.checkedIn ? 'Revoke Check-In' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportComplete={onAttendeesImported}
      />
    </div>
  );
}
