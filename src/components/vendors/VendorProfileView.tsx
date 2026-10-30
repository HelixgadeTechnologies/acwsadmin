'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Vendor, VendorStatus } from '@/types';
import {
  ArrowLeft,
  Copy,
  Check,
  X,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Clock,
  MoreHorizontal,
  QrCode,
  Download,
  ChevronDown
} from 'lucide-react';

export default function VendorProfileView({
  vendor: initialVendor,
  onStatusChange
}: {
  vendor: Vendor;
  onStatusChange: (id: string, status: VendorStatus) => Promise<void>;
}) {
  const [vendor, setVendor] = useState<Vendor>(initialVendor);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardDropdownOpen, setCardDropdownOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const cardDropdownRef = React.useRef<HTMLDivElement>(null);
  const headerDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardDropdownRef.current && !cardDropdownRef.current.contains(e.target as Node)) {
        setCardDropdownOpen(false);
      }
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target as Node)) {
        setHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (vendor.qrCode && vendor.qrCode.startsWith('data:image')) {
      setQrDataUrl(vendor.qrCode);
      return;
    }

    const payload = JSON.stringify({
      ref: vendor.refCode,
      business: vendor.businessName,
      tier: vendor.paymentTier,
      status: vendor.status
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1B254B',
        light: '#FFFFFF'
      }
    }).then(url => setQrDataUrl(url)).catch(console.error);
  }, [vendor.refCode, vendor.businessName, vendor.paymentTier, vendor.qrCode]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `ACWS_Pass_${vendor.refCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(vendor.refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (status: VendorStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(vendor._id, status);
      setVendor(prev => ({ ...prev, status }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Avatar initials
  const initials = vendor.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();


  const getStatusBadge = () => {
    switch (vendor.status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">Approved Exhibitor</span>;
      case 'waitlisted':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">Waitlisted</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">Declined</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">Pending Review</span>;
    }
  };

  return (
    <div className="w-full text-[#2B3674] font-sans pb-10">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#707EAE] mb-1">
            <Link href="/dashboard" className="hover:text-[#2B3674] transition-colors">Pages</Link>
            <span>/</span>
            <Link href="/vendors" className="hover:text-[#2B3674] transition-colors">Vendors</Link>
            <span>/</span>
            <span className="text-[#2B3674] font-semibold">Profile</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1B254B] tracking-tight">
            Vendor Profile
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vendors"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#1B254B] text-xs font-bold border border-[#E0E5F2] shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Directory</span>
          </Link>

          {/* Header Actions Dropdown */}
          <div className="relative" ref={headerDropdownRef}>
            <button
              type="button"
              onClick={() => setHeaderDropdownOpen(prev => !prev)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Actions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${headerDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {headerDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E0E5F2] py-2 z-40 divide-y divide-[#E0E5F2]">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
                  Vendor Decisions
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      handleStatusUpdate('approved');
                      setHeaderDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'approved'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'text-[#2B3674] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span>Approve Application</span>
                    </span>
                    {vendor.status === 'approved' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('waitlisted');
                      setHeaderDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'waitlisted'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        : 'text-[#2B3674] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span>Move to Waitlist</span>
                    </span>
                    {vendor.status === 'waitlisted' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('rejected');
                      setHeaderDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'rejected'
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'text-[#EF4444] hover:bg-[#FFF5F5]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-[#EF4444]" />
                      <span>Decline Application</span>
                    </span>
                    {vendor.status === 'rejected' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('pending');
                      setHeaderDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'pending'
                        ? 'bg-[#707EAE]/15 text-[#707EAE]'
                        : 'text-[#707EAE] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#707EAE]" />
                      <span>Mark as Pending</span>
                    </span>
                    {vendor.status === 'pending' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      handleDownloadQr();
                      setHeaderDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-[#2B3674] hover:bg-[#F4F7FE] flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#B58E29]" />
                    <span>Download QR Pass</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCopyRef();
                      setHeaderDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-[#2B3674] hover:bg-[#F4F7FE] flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#707EAE]" />
                    <span>Copy Reference Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#F4F7FE] px-3 py-1.5 rounded-xl border border-[#E0E5F2] shadow-xs">
            <span className="font-mono text-xs font-bold text-[#8F6E1C]">
              {vendor.refCode}
            </span>
            <button
              onClick={handleCopyRef}
              title="Copy Reference Code"
              className="p-1 rounded text-[#A3AED0] hover:text-[#B58E29] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* TOP ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Profile Summary Card */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] overflow-hidden flex flex-col justify-between">
          {/* Top Solid Banner */}
          <div className="h-32 bg-[#1B254B] relative flex items-end justify-center">
            {/* Circular Avatar overlapping banner */}
            <div className="absolute -bottom-10 w-20 h-20 rounded-full bg-[#D4AF37] text-[#070506] font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
              {initials}
            </div>
          </div>

          {/* Identity & 3 Stats */}
          <div className="pt-12 pb-6 px-6 text-center">
            <h3 className="text-xl font-bold text-[#2B3674]">{vendor.businessName}</h3>
            <p className="text-xs font-medium text-[#707EAE] mt-1">
              {vendor.category}
            </p>

            {/* Quick Location & Phone Badges */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#F3DC82] font-semibold text-[#8F6E1C]">
                <MapPin className="w-3.5 h-3.5 text-[#B58E29]" />
                <span>{vendor.baseLocation || 'Location not specified'}</span>
              </span>

              {vendor.phone ? (
                <a
                  href={`tel:${vendor.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 font-semibold text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                  title="Call Vendor"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{vendor.phone}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F7FE] border border-[#E0E5F2] font-semibold text-[#A3AED0]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>No phone</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-[#E0E5F2] text-center">
              <div>
                <p className="text-xl font-bold text-[#2B3674] capitalize">{vendor.paymentTier || 'standard'}</p>
                <p className="text-xs font-medium text-[#A3AED0] mt-0.5">Stand Tier</p>
              </div>
              <div className="border-x border-[#E0E5F2]">
                <p className="text-xl font-bold text-[#2B3674]">
                  {vendor.weddingVolume && vendor.weddingVolume !== 'Not specified' ? vendor.weddingVolume.split(' ')[0] : 'No data'}
                </p>
                <p className="text-xs font-medium text-[#A3AED0] mt-0.5">Weddings/Yr</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#2B3674]">
                  {vendor.typicalSpend && vendor.typicalSpend !== 'Not specified' ? vendor.typicalSpend.split(' ')[0] : 'No data'}
                </p>
                <p className="text-xs font-medium text-[#A3AED0] mt-0.5">Avg. Spend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Application Audit & Compliance */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] px-2.5 py-1 rounded-full border border-[#F3DC82]">
                Application Audit
              </span>
              <span className="text-xs font-mono font-bold text-[#A3AED0]">
                ID: {vendor._id.slice(-6)}
              </span>
            </div>

            <div className="space-y-3.5 mt-2">
              <div className="p-3.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                <p className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">Registered At</p>
                <p className="text-xs font-bold text-[#1B254B] mt-1">
                  {new Date(vendor.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                <p className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">Last Record Update</p>
                <p className="text-xs font-bold text-[#1B254B] mt-1">
                  {vendor.updatedAt ? (
                    new Date(vendor.updatedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    'No data'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <p className="text-[10px] font-bold text-[#A3AED0] uppercase">Privacy Policy</p>
                  <p className="text-xs font-bold text-[#10B981] mt-0.5">
                    {vendor.privacyAcknowledged ? 'Confirmed' : 'No data'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <p className="text-[10px] font-bold text-[#A3AED0] uppercase">Marketing</p>
                  <p className="text-xs font-bold text-[#1B254B] mt-0.5">
                    {vendor.marketingConsent ? 'Opted In' : 'No data'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#E0E5F2] flex items-center justify-between text-xs">
            <span className="text-[#A3AED0] font-medium">Stand Tier:</span>
            <span className="font-bold text-[#1B254B] capitalize">{vendor.paymentTier || 'standard'}</span>
          </div>
        </div>

        {/* Card 3: Curator Decision Actions (Dropdown) */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] text-[#B58E29] flex items-center justify-center border border-[#F3DC82]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#2B3674]">Curator Decision</h4>
                  <p className="text-xs text-[#A3AED0]">Exhibitor review desk</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF9E6] text-[#8F6E1C] uppercase border border-[#F3DC82]">
                Active
              </span>
            </div>

            <p className="text-xs text-[#707EAE] leading-relaxed mb-4">
              Update exhibitor application status. Changing status automatically synchronizes database records and triggers event correspondence.
            </p>

            {/* Current Decision Summary Card */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2] mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#A3AED0]">Current Decision:</span>
                <div>{getStatusBadge()}</div>
              </div>
              <p className="text-xs text-[#707EAE] leading-relaxed">
                {vendor.status === 'approved' && 'Accredited for ACWS 2027. Credentials and booth space reserved.'}
                {vendor.status === 'waitlisted' && 'Positioned on the standby queue pending booth reallocation.'}
                {vendor.status === 'rejected' && 'Application declined. Exhibitor not scheduled for this edition.'}
                {(!vendor.status || vendor.status === 'pending') && 'Awaiting curator evaluation and documentation review.'}
              </p>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative mt-2" ref={cardDropdownRef}>
            <button
              type="button"
              onClick={() => setCardDropdownOpen(prev => !prev)}
              disabled={isUpdating}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#070506] bg-[#D4AF37] hover:bg-[#B58E29] transition-all shadow-xs flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-[#070506] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Actions Options</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${cardDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {cardDropdownOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-[#E0E5F2] py-2 z-30 divide-y divide-[#E0E5F2]">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
                  Select Action
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      handleStatusUpdate('approved');
                      setCardDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'approved'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'text-[#2B3674] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span>Approve Application</span>
                    </span>
                    {vendor.status === 'approved' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('waitlisted');
                      setCardDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'waitlisted'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        : 'text-[#2B3674] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span>Move to Waitlist</span>
                    </span>
                    {vendor.status === 'waitlisted' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('rejected');
                      setCardDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'rejected'
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'text-[#EF4444] hover:bg-[#FFF5F5]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-[#EF4444]" />
                      <span>Decline Application</span>
                    </span>
                    {vendor.status === 'rejected' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>

                  <button
                    onClick={() => {
                      handleStatusUpdate('pending');
                      setCardDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${vendor.status === 'pending'
                        ? 'bg-[#707EAE]/15 text-[#707EAE]'
                        : 'text-[#707EAE] hover:bg-[#F4F7FE]'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#707EAE]" />
                      <span>Mark as Pending Review</span>
                    </span>
                    {vendor.status === 'pending' && <span className="text-[10px] font-bold uppercase">Current</span>}
                  </button>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      handleDownloadQr();
                      setCardDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-[#2B3674] hover:bg-[#F4F7FE] flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#B58E29]" />
                    <span>Download QR Pass</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCopyRef();
                      setCardDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-[#2B3674] hover:bg-[#F4F7FE] flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#707EAE]" />
                    <span>Copy Reference Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 4: Digital Channels & Media */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-[#2B3674]">All Channels</h4>
            <p className="text-xs text-[#A3AED0] mt-1 mb-5">
              Here you can find direct communication channels and media profiles.
            </p>

            <div className="space-y-4">
              {/* Channel 1: Website */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#B58E29] flex items-center justify-center shadow-xs border border-[#E0E5F2]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2B3674]">Official Website</p>
                    <p className="text-xs text-[#A3AED0] truncate max-w-[150px]">
                      {vendor.website || 'No data'}
                    </p>
                  </div>
                </div>
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#A3AED0] font-semibold">No data</span>
                )}
              </div>

              {/* Channel 2: Instagram */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#E1306C] flex items-center justify-center shadow-xs border border-[#E0E5F2]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2B3674]">Instagram</p>
                    <p className="text-xs text-[#A3AED0]">
                      {vendor.instagram || 'No data'}
                    </p>
                  </div>
                </div>
                {vendor.instagram ? (
                  <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#A3AED0] font-semibold">No data</span>
                )}
              </div>

              {/* Channel 3: Email */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#B58E29] flex items-center justify-center shadow-xs border border-[#E0E5F2]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2B3674]">Primary Email</p>
                    <p className="text-xs text-[#A3AED0] truncate max-w-[150px]">
                      {vendor.email || 'No data'}
                    </p>
                  </div>
                </div>
                {vendor.email ? (
                  <a href={`mailto:${vendor.email}`} className="p-2 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#A3AED0] font-semibold">No data</span>
                )}
              </div>

              {/* Channel 4: Phone */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#10B981] flex items-center justify-center shadow-xs border border-[#E0E5F2]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2B3674]">Direct Contact</p>
                    <p className="text-xs text-[#A3AED0]">
                      {vendor.phone || 'No data'}
                    </p>
                  </div>
                </div>
                {vendor.phone ? (
                  <a href={`tel:${vendor.phone}`} className="p-2 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#A3AED0] font-semibold">No data</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: General Information Grid */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6">
          <h4 className="text-xl font-bold text-[#2B3674]">General Information</h4>
          <p className="text-xs text-[#707EAE] mt-1 leading-relaxed mb-6">
            {vendor.notes || vendor.curatorNotes || 'No data'}
          </p>

          {/* 2x3 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F4F7FE]">
              <p className="text-xs font-medium text-[#A3AED0]">Primary Contact</p>
              <p className="text-sm font-bold text-[#2B3674] mt-1">
                {vendor.contactName || vendor.contactPerson || 'No data'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FE]">
              <p className="text-xs font-medium text-[#A3AED0]">Base Location</p>
                <p className="text-sm font-bold text-[#2B3674] mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B58E29] shrink-0" />
                  <span>{vendor.baseLocation || 'No data'}</span>
                </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FE]">
              <p className="text-xs font-medium text-[#A3AED0]">Wedding Volume</p>
              <p className="text-sm font-bold text-[#2B3674] mt-1">
                {vendor.weddingVolume && vendor.weddingVolume !== 'Not specified' ? vendor.weddingVolume : 'No data'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FE]">
              <p className="text-xs font-medium text-[#A3AED0]">Typical Spend</p>
              <p className="text-sm font-bold text-[#2B3674] mt-1">
                {vendor.typicalSpend && vendor.typicalSpend !== 'Not specified' ? vendor.typicalSpend : 'No data'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FE] col-span-2">
              <p className="text-xs font-medium text-[#A3AED0] mb-2">Cultural Markets Served</p>
              {vendor.marketsServed && vendor.marketsServed.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {vendor.marketsServed.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#8F6E1C] border border-[#F3DC82] shadow-xs">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A3AED0] font-semibold">No data</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FE] col-span-2">
              <p className="text-xs font-medium text-[#A3AED0] mb-2">Service Coverage Areas</p>
              {vendor.serviceAreas && vendor.serviceAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {vendor.serviceAreas.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#2B3674] border border-[#E0E5F2] shadow-xs">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A3AED0] font-semibold">No data</p>
              )}
            </div>

            {vendor.objectives && vendor.objectives.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#F4F7FE] col-span-2">
                <p className="text-xs font-medium text-[#A3AED0] mb-2">Exhibition Objectives</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.objectives.map(obj => (
                    <span key={obj} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#1B254B] border border-[#E0E5F2] shadow-xs">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vendor.discoveryChannels && vendor.discoveryChannels.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#F4F7FE] col-span-2">
                <p className="text-xs font-medium text-[#A3AED0] mb-2">Discovery Referral Channels</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.discoveryChannels.map(dc => (
                    <span key={dc} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-[#707EAE] border border-[#E0E5F2] shadow-xs">
                      {dc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 6: Generated QR Code for Vendor */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#2B3674]">Generated QR Code</h4>
                  <p className="text-xs text-[#A3AED0]">Exhibitor Onsite Credentials</p>
                </div>
              </div>
              <button className="text-[#A3AED0] hover:text-[#2B3674] p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#707EAE] leading-relaxed mb-4">
              Cryptographically verified digital pass for venue access, badge printing, and floorplan credential validation at ExCeL London.
            </p>

            {/* QR Code Container */}
            <div className="bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
              {qrDataUrl ? (
                <div className="bg-white p-3.5 rounded-2xl border border-[#E0E5F2] shadow-xs">
                  <img
                    src={qrDataUrl}
                    alt={`Access QR Code for ${vendor.businessName}`}
                    className="w-36 h-36 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-white rounded-2xl border border-[#E0E5F2] flex items-center justify-center text-[#A3AED0]">
                  <div className="w-6 h-6 border-2 border-[#E0E5F2] border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
              )}

              <div className="mt-3 font-mono text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] px-3.5 py-1 rounded-full border border-[#F3DC82]">
                {vendor.refCode}
              </div>
              <p className="text-[11px] font-medium text-[#707EAE] mt-1.5">
                Scan to verify {vendor.businessName}
              </p>
            </div>
          </div>

          {/* Action Button & Metadata */}
          <div className="mt-5 space-y-3">
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#070506] bg-[#D4AF37] hover:bg-[#B58E29] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital QR Pass</span>
            </button>

            <div className="pt-2 border-t border-[#E0E5F2] flex items-center justify-between text-xs text-[#A3AED0]">
              <span>Verification Status:</span>
              <span className="font-bold text-[#1B254B] capitalize flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{vendor.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
