'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Vendor } from '@/types';
import { ArrowRight, Eye, Check, X, MoreVertical, Clock } from 'lucide-react';

export default function RecentApplicationsTable({
  vendors,
  onStatusChange
}: {
  vendors: Vendor[];
  onStatusChange: (id: string, status: 'approved' | 'rejected' | 'waitlisted') => void;
}) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  const getStatusBadge = (status: string) => {
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
    <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-[#1B254B]">Recent Applications</h3>
          <p className="text-xs text-[#A3AED0] mt-0.5">Incoming vendor registrations requiring review</p>
        </div>
        <Link
          href="/vendors"
          className="text-xs font-bold text-[#B58E29] hover:underline flex items-center gap-1"
        >
          <span>View All Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto min-h-[300px] pb-10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E0E5F2] text-[#A3AED0] font-bold uppercase tracking-wider text-xs">
              <th className="py-4 pl-3">Ref Code</th>
              <th className="py-4 px-3">Business & Category</th>
              <th className="py-4 px-3">Stand Tier</th>
              <th className="py-4 px-3">Status</th>
              <th className="py-4 text-right pr-3">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E5F2]">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm font-semibold text-[#A3AED0]">
                  No data
                </td>
              </tr>
            ) : (
              vendors.slice(0, 5).map((v) => (
                <tr key={v._id} className="hover:bg-[#F4F7FE] transition-colors">
                  <td className="py-4.5 pl-3 font-mono font-bold text-[#B58E29] text-sm">
                    {v.refCode}
                  </td>
                  <td className="py-4.5 px-3">
                    <div className="font-bold text-[#1B254B] text-base">{v.businessName}</div>
                    <div className="text-xs text-[#707EAE] mt-0.5">{v.category}</div>
                  </td>
                  <td className="py-4.5 px-3 capitalize text-[#1B254B]">
                    <span className="px-3 py-1 rounded-lg bg-[#F4F7FE] border border-[#E0E5F2] font-semibold text-xs tracking-wide">
                      {v.paymentTier}
                    </span>
                  </td>
                  <td className="py-4.5 px-3">
                    {getStatusBadge(v.status)}
                  </td>
                  <td className="py-4.5 text-right pr-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/vendors/${v._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        title="Inspect Profile"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>

                      {/* Dropdown Menu for Approve / Reject / Waitlist */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === v._id ? null : v._id);
                          }}
                          className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                            openDropdownId === v._id
                              ? 'bg-[#1B254B] text-white border-[#1B254B]'
                              : 'bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] border-[#E0E5F2]'
                          }`}
                          title="Application Actions"
                          aria-label="Application Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === v._id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#E0E5F2] py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="px-3.5 py-1 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider border-b border-[#E0E5F2] mb-1">
                              Decisions
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(v._id, 'approved');
                                setOpenDropdownId(null);
                              }}
                              disabled={v.status === 'approved'}
                              className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                v.status === 'approved'
                                  ? 'opacity-40 cursor-not-allowed text-[#A3AED0]'
                                  : 'text-[#10B981] hover:bg-[#10B981]/10'
                              }`}
                            >
                              <Check className="w-4 h-4 text-[#10B981]" />
                              <span>Approve Application</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(v._id, 'rejected');
                                setOpenDropdownId(null);
                              }}
                              disabled={v.status === 'rejected'}
                              className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                v.status === 'rejected'
                                  ? 'opacity-40 cursor-not-allowed text-[#A3AED0]'
                                  : 'text-[#EF4444] hover:bg-[#EF4444]/10'
                              }`}
                            >
                              <X className="w-4 h-4 text-[#EF4444]" />
                              <span>Reject Application</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onStatusChange(v._id, 'waitlisted');
                                setOpenDropdownId(null);
                              }}
                              disabled={v.status === 'waitlisted'}
                              className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                v.status === 'waitlisted'
                                  ? 'opacity-40 cursor-not-allowed text-[#A3AED0]'
                                  : 'text-[#F59E0B] hover:bg-[#F59E0B]/10'
                              }`}
                            >
                              <Clock className="w-4 h-4 text-[#F59E0B]" />
                              <span>Place on Waitlist</span>
                            </button>
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
    </div>
  );
}

