'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Vendor, VendorStatus } from '@/types';
import { 
  Search, 
  Download, 
  Eye, 
  Check, 
  X, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

export default function VendorsDirectory({
  initialVendors,
  onStatusUpdate
}: {
  initialVendors: Vendor[];
  onStatusUpdate: (id: string, status: VendorStatus) => Promise<void>;
}) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;

  React.useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  React.useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
      if (tierFilter !== 'all' && v.paymentTier !== tierFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = v.businessName.toLowerCase().includes(q);
        const matchesRef = v.refCode.toLowerCase().includes(q);
        const matchesEmail = v.email.toLowerCase().includes(q);
        const matchesContact = v.contactName && v.contactName.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesEmail && !matchesContact) return false;
      }

      return true;
    });
  }, [vendors, search, statusFilter, categoryFilter, tierFilter]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(start, start + itemsPerPage);
  }, [filteredVendors, currentPage, itemsPerPage]);

  const handleAction = async (id: string, newStatus: VendorStatus) => {
    await onStatusUpdate(id, newStatus);
    setVendors(prev => prev.map(v => v._id === id ? { ...v, status: newStatus } : v));
  };

  const exportCsv = () => {
    const headers = [
      'Reference Code',
      'Business Name',
      'Category',
      'Contact Name',
      'Email',
      'Phone',
      'Base Location',
      'Payment Tier',
      'Status',
      'Submission Date'
    ];

    const rows = filteredVendors.map(v => [
      `"${v.refCode}"`,
      `"${v.businessName.replace(/"/g, '""')}"`,
      `"${v.category}"`,
      `"${(v.contactName || '').replace(/"/g, '""')}"`,
      `"${v.email}"`,
      `"${v.phone || ''}"`,
      `"${(v.baseLocation || '').replace(/"/g, '""')}"`,
      `"${v.paymentTier}"`,
      `"${v.status}"`,
      `"${new Date(v.createdAt).toLocaleDateString('en-GB')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ACWS_Vendors_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusPill = (status: VendorStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">Approved</span>;
      case 'waitlisted':
        return <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">Waitlist</span>;
      case 'rejected':
        return <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">Rejected</span>;
      default:
        return <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Filter Bar */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-5 space-y-4 shadow-xs">
        {/* Status Filter Tabs & Gold Export Button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Registrations' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'waitlisted', label: 'Waitlisted' },
              { id: 'rejected', label: 'Rejected' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                  ${statusFilter === tab.id
                    ? 'bg-[#D4AF37] text-[#070506] shadow-xs'
                    : 'bg-[#F4F7FE] text-[#707EAE] hover:text-[#1B254B] hover:bg-[#EAEFFD]'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#070506] bg-[#D4AF37] hover:bg-[#B58E29] transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E0E5F2]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search vendor, email, ref code..."
              className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3 py-2 text-xs text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Wedding Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3 py-2 text-xs text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Stand Tiers</option>
              <option value="standard">Standard Shell (3m × 3m)</option>
              <option value="premium">Premium Space (4m × 4m)</option>
              <option value="catwalk">Catwalk Feature (6m × 4m)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E0E5F2] flex items-center justify-between text-sm text-[#707EAE]">
          <div>
            Showing <span className="font-bold text-[#1B254B]">{filteredVendors.length}</span> vendor applicants
          </div>
          <div className="font-medium">Page {currentPage} of {totalPages}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F4F7FE] border-b border-[#E0E5F2] text-[#A3AED0] font-bold uppercase tracking-wider text-xs">
                <th className="py-4.5 pl-6">Ref Code</th>
                <th className="py-4.5 px-4">Business & Contact</th>
                <th className="py-4.5 px-4">Category</th>
                <th className="py-4.5 px-4">Stand Tier</th>
                <th className="py-4.5 px-4">Status</th>
                <th className="py-4.5 px-4">Date</th>
                <th className="py-4.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2]">
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#A3AED0] text-sm">
                    No vendors matching current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((v) => (
                  <tr key={v._id} className="hover:bg-[#F4F7FE] transition-colors group">
                    <td className="py-5 pl-6 font-mono font-bold text-[#B58E29] text-sm">
                      {v.refCode}
                    </td>
                    <td className="py-5 px-4">
                      <Link 
                        href={`/vendors/${v._id}`} 
                        className="font-bold text-[#1B254B] hover:text-[#B58E29] transition-colors text-base block"
                      >
                        {v.businessName}
                      </Link>
                      <div className="text-xs text-[#707EAE] mt-1">
                        {v.contactName || v.contactPerson || v.email}
                      </div>
                    </td>
                    <td className="py-5 px-4 text-[#1B254B] font-medium text-sm">
                      {v.category}
                    </td>
                    <td className="py-5 px-4 capitalize text-[#1B254B]">
                      <span className="px-3.5 py-1 rounded-lg bg-[#F4F7FE] border border-[#E0E5F2] font-semibold text-xs tracking-wide">
                        {v.paymentTier}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {getStatusPill(v.status)}
                    </td>
                    <td className="py-5 px-4 text-[#707EAE] text-sm font-medium">
                      {new Date(v.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2.5" data-action-menu>
                        <Link
                          href={`/vendors/${v._id}`}
                          className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenActionMenuId(openActionMenuId === v._id ? null : v._id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#2B3674] text-xs font-bold border border-[#E0E5F2] shadow-xs cursor-pointer"
                          >
                            <span>Actions</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openActionMenuId === v._id ? 'rotate-180' : ''}`} />
                          </button>

                          {openActionMenuId === v._id && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#E0E5F2] py-1.5 z-30 divide-y divide-[#E0E5F2] text-left">
                              <div className="px-3.5 py-1 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
                                Update Status
                              </div>
                              <div className="p-1 space-y-0.5">
                                <button
                                  onClick={() => {
                                    handleAction(v._id, 'approved');
                                    setOpenActionMenuId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${
                                    v.status === 'approved' ? 'bg-[#10B981]/15 text-[#10B981]' : 'text-[#10B981] hover:bg-[#10B981]/10'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleAction(v._id, 'waitlisted');
                                    setOpenActionMenuId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${
                                    v.status === 'waitlisted' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'text-[#F59E0B] hover:bg-[#F59E0B]/10'
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                  <span>Waitlist</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleAction(v._id, 'rejected');
                                    setOpenActionMenuId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${
                                    v.status === 'rejected' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'text-[#EF4444] hover:bg-[#EF4444]/10'
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                  <span>Decline</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleAction(v._id, 'pending');
                                    setOpenActionMenuId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer ${
                                    v.status === 'pending' ? 'bg-[#707EAE]/15 text-[#707EAE]' : 'text-[#707EAE] hover:bg-[#F4F7FE]'
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                  <span>Mark Pending</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-[#E0E5F2] flex items-center justify-between text-sm">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-[#707EAE] text-sm">
              Page <strong className="text-[#1B254B]">{currentPage}</strong> of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
