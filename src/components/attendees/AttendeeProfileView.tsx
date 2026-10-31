'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Attendee } from '@/types';
import DeviceInfoCard from '@/components/common/DeviceInfoCard';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  Heart,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Download,
  ShieldCheck,
  QrCode,
  X,
  Share2
} from 'lucide-react';

export default function AttendeeProfileView({
  attendee: initialAttendee,
  onToggleCheckin
}: {
  attendee: Attendee;
  onToggleCheckin: (id: string) => Promise<Attendee>;
}) {
  const [attendee, setAttendee] = useState<Attendee>(initialAttendee);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setAttendee(initialAttendee);
  }, [initialAttendee]);

  useEffect(() => {
    if (!attendee) return;

    const payload = JSON.stringify({
      ref: attendee.refCode,
      name: attendee.fullName,
      ticket: attendee.ticketType,
      checkedIn: attendee.checkedIn
    });

    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#1B254B',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(console.error);
  }, [attendee.refCode, attendee.fullName, attendee.ticketType, attendee.checkedIn]);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(attendee.refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `ACWS_Pass_${attendee.refCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckinToggle = async () => {
    setIsUpdating(true);
    try {
      const updated = await onToggleCheckin(attendee._id);
      setAttendee(updated);
    } catch {
      // Toggle locally in case response isn't formatted
      setAttendee(prev => ({
        ...prev,
        checkedIn: !prev.checkedIn,
        checkedInAt: !prev.checkedIn ? new Date().toISOString() : null
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = attendee.fullName
    ? attendee.fullName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'AT';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E0E5F2] rounded-2xl p-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/attendees"
            className="p-2.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] hover:bg-[#EAEFFD] transition-colors cursor-pointer"
            title="Return to Attendees Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                Attendee Dossier
              </span>
              <span className="font-mono text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] px-2.5 py-0.5 rounded-md border border-[#F3DC82]">
                {attendee.refCode}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1 text-[#A3AED0] hover:text-[#1B254B] cursor-pointer transition-colors"
                title="Copy Reference Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-[#707EAE] mt-0.5">
              Registered on {new Date(attendee.registeredAt || attendee.createdAt || Date.now()).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Arrival Status & Gate Action */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {attendee.checkedIn ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Checked In</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">
              <Clock className="w-4 h-4" />
              <span>Pending Arrival</span>
            </span>
          )}

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleCheckinToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 ${attendee.checkedIn
                ? 'bg-[#FFF5F5] text-[#EF4444] border border-[#FCA5A5]/40 hover:bg-[#FEE2E2]'
                : 'bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506]'
              }`}
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : attendee.checkedIn ? (
              <>
                <X className="w-4 h-4" />
                <span>Revoke Check-In</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Check-In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="bg-white border border-[#E0E5F2] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E0E5F2]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#D4AF37] text-[#070506] font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm border-4 border-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B254B] tracking-tight">
                  {attendee.fullName}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${attendee.ticketType === 'vip'
                    ? 'bg-[#FFF9E6] text-[#8F6E1C] border-[#F3DC82]'
                    : (attendee.ticketType === 'catwalk-exclusive'
                      ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                      : 'bg-[#F4F7FE] text-[#2B3674] border-[#E0E5F2]')
                  }`}>
                  {attendee.ticketType.replace('-', ' ')}
                </span>
              </div>

              {attendee.partnerName && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#707EAE] mt-1.5">
                  <Heart className="w-4 h-4 text-[#E1306C]" />
                  <span>Partner / Spouse: <strong className="text-[#1B254B]">{attendee.partnerName}</strong></span>
                </div>
              )}

                {/* Quick Location & Phone Badges */}
                <div className="flex items-center flex-wrap gap-2 mt-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#F3DC82] font-semibold text-[#8F6E1C]">
                    <MapPin className="w-3.5 h-3.5 text-[#B58E29]" />
                    <span>{attendee.weddingLocation || 'Location not specified'}</span>
                  </span>

                  {attendee.phone ? (
                    <a
                      href={`tel:${attendee.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 font-semibold text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                      title="Call Attendee"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{attendee.phone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F7FE] border border-[#E0E5F2] font-semibold text-[#A3AED0]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>No phone</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A3AED0] mt-1.5">
                  Role: <strong className="text-[#1B254B]">{attendee.attendeeType || 'Guest'}</strong>
                  {attendee.weddingTimeframe && (
                    <> • Target: <strong className="text-[#1B254B]">{attendee.weddingTimeframe}</strong></>
                  )}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4F7FE] hover:bg-[#EAEFFD] text-[#1B254B] border border-[#E0E5F2] font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#B58E29]" />
              <span>Download Pass</span>
            </button>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Card: Contact Details & Financial Telemetry */}
          <div className="p-6 rounded-2xl bg-[#FAFCFE] border border-[#E0E5F2] space-y-5">
            <h3 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Contact & Ticket Telemetry</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Email Address</span>
                <a
                  href={`mailto:${attendee.email}`}
                  className="font-bold text-[#1B254B] hover:text-[#B58E29] transition-colors flex items-center gap-2 mt-1 text-sm"
                >
                  <Mail className="w-4 h-4 text-[#707EAE]" />
                  <span>{attendee.email || 'No data'}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Phone Number</span>
                {attendee.phone ? (
                  <a
                    href={`tel:${attendee.phone}`}
                    className="font-bold text-[#10B981] hover:text-[#059669] transition-colors flex items-center gap-2 mt-1 text-sm"
                    title="Call Attendee"
                  >
                    <Phone className="w-4 h-4 text-[#10B981]" />
                    <span>{attendee.phone}</span>
                  </a>
                ) : (
                  <span className="font-semibold text-[#A3AED0] mt-1 block">No data</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Partner / Spouse</span>
                <div className="font-bold text-[#1B254B] flex items-center gap-2 mt-1 text-sm">
                  <Heart className="w-4 h-4 text-[#E1306C]" />
                  <span>{attendee.partnerName || 'No data'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0E5F2] grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#E0E5F2]">
                  <span className="text-[10px] text-[#A3AED0] block font-bold uppercase">Price / Tier</span>
                  <span className="font-extrabold text-[#1B254B] text-sm block mt-0.5">
                    {attendee.ticketPrice || (attendee.pricePaid ? `£${attendee.pricePaid}` : 'Complimentary')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E0E5F2]">
                  <span className="text-[10px] text-[#A3AED0] block font-bold uppercase">Payment Status</span>
                  <span className="font-extrabold text-[#10B981] text-sm capitalize block mt-0.5">
                    {attendee.paymentStatus || 'Paid'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Registration Timestamp</span>
                <span className="font-semibold text-[#707EAE] text-xs block mt-1">
                  {new Date(attendee.registeredAt || attendee.createdAt || Date.now()).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {attendee.checkedInAt && (
                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Venue Entrance Scan Time</span>
                  <span className="font-semibold text-[#10B981] text-xs block mt-1">
                    {new Date(attendee.checkedInAt).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {attendee.deviceInfo && (
                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-semibold uppercase">Registration Device</span>
                  <span className="font-semibold text-[#1B254B] text-xs block mt-1">
                    {attendee.deviceInfo.deviceType || attendee.deviceInfo.os || attendee.deviceInfo.browser || 'Captured'}
                    {attendee.deviceInfo.ip && ` • IP: ${attendee.deviceInfo.ip}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Wedding Planning Dossier */}
          <div className="p-6 rounded-2xl bg-[#FAFCFE] border border-[#E0E5F2] space-y-5">
            <h3 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Wedding & Planning Profile</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Role</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm">
                  {attendee.attendeeType || 'Guest'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Timeframe</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm">
                  {attendee.weddingTimeframe || 'No data'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Target Location</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B58E29] shrink-0" />
                  <span className="truncate">{attendee.weddingLocation || 'No data'}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Estimated Budget</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm">
                  {attendee.weddingBudget || 'No data'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Guest Count</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#707EAE] shrink-0" />
                  <span>{attendee.guestCount || 'No data'}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E0E5F2]">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Referral Channel</span>
                <span className="font-bold text-[#1B254B] mt-1 block text-sm truncate">
                  {attendee.discoveryChannel || 'No data'}
                </span>
              </div>
            </div>

            {/* Cultural Influences */}
            {attendee.culturalInfluences && attendee.culturalInfluences.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#A3AED0] block mb-2 uppercase">
                  Cultural Influences
                </span>
                <div className="flex flex-wrap gap-2">
                  {attendee.culturalInfluences.map(c => (
                    <span key={c} className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wedding Services Requested */}
        {attendee.servicesNeeded && attendee.servicesNeeded.length > 0 && (
          <div className="mt-6 p-6 rounded-2xl bg-[#FAFCFE] border border-[#E0E5F2]">
            <h3 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4" />
              <span>Wedding Services Requested ({attendee.servicesNeeded.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {attendee.servicesNeeded.map(service => (
                <span key={service} className="px-3.5 py-2 rounded-xl bg-white border border-[#E0E5F2] text-xs font-bold text-[#1B254B] shadow-2xs">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Digital Venue Pass & QR Verification */}
        <div className="mt-6 p-6 rounded-2xl bg-white border border-[#E0E5F2] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-5">
            {qrDataUrl ? (
              <div className="p-3 bg-white border border-[#E0E5F2] rounded-2xl shadow-xs shrink-0">
                <img src={qrDataUrl} alt={`Entry QR Pass for ${attendee.refCode}`} className="w-28 h-28 object-contain" />
              </div>
            ) : (
              <div className="w-28 h-28 bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl flex items-center justify-center text-[#A3AED0]">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <h4 className="text-base font-extrabold text-[#1B254B]">Official ExCeL London Pass QR</h4>
              </div>
              <p className="text-xs text-[#707EAE] mt-1 max-w-md">
                This high-resolution QR pass directly encodes the guest's reference code and ticket tier for rapid scanning at turnstiles.
              </p>
              <div className="flex items-center gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F4F7FE] hover:bg-[#EAEFFD] text-[#1B254B] border border-[#E0E5F2] font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Reference</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-[#A3AED0] shrink-0 self-end md:self-center">
            <span className="font-mono text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] px-4 py-1.5 rounded-full border border-[#F3DC82]">
              {attendee.refCode}
            </span>
          </div>
        </div>
      </div>

      {/* Device & Client Telemetry */}
      <DeviceInfoCard
        deviceInfo={attendee.deviceInfo}
        registeredAt={attendee.registeredAt || attendee.createdAt}
        title="Attendee Registration Device & Telemetry"
        subtitle="Client hardware, operating system, and network data captured during ticket registration"
      />
    </div>
  );
}
