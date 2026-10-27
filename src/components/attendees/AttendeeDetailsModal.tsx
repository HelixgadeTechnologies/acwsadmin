'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
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
  Globe, 
  Download, 
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Attendee } from '@/types';

export default function AttendeeDetailsModal({
  attendee,
  isOpen,
  onClose,
  onToggleCheckin
}: {
  attendee: Attendee | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCheckin: (id: string) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!attendee) return;

    const payload = JSON.stringify({
      ref: attendee.refCode,
      name: attendee.fullName,
      ticket: attendee.ticketType,
      checkedIn: attendee.checkedIn
    });

    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#1B254B',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(console.error);
  }, [attendee]);

  if (!isOpen || !attendee) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(attendee.refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `ACWS_Ticket_${attendee.refCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckinClick = async () => {
    setIsUpdating(true);
    try {
      await onToggleCheckin(attendee._id);
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = attendee.fullName
    ? attendee.fullName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'AT';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white border border-[#E0E5F2] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="p-6 border-b border-[#E0E5F2] bg-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#070506] font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-[#1B254B] tracking-tight">
                  {attendee.fullName}
                </h3>
                {attendee.checkedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Checked In</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Arrival</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-1 text-xs text-[#707EAE]">
                <span className="font-mono font-bold text-[#8F6E1C] bg-[#FFF9E6] px-2 py-0.5 rounded border border-[#F3DC82]">
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
                <span>•</span>
                <span className="capitalize font-semibold text-[#1B254B]">
                  {attendee.ticketType.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#707EAE] hover:text-[#1B254B] bg-[#F4F7FE] border border-[#E0E5F2] hover:bg-[#EAEFFD] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#1B254B]">
          {/* Quick Action Banner */}
          <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#1B254B]">Venue Entrance Check-In</p>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                {attendee.checkedIn 
                  ? `Guest checked in on ${attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString('en-GB') : 'site'}.`
                  : 'Verify guest tickets upon arrival at ExCeL London entrance gates.'}
              </p>
            </div>

            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCheckinClick}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50 ${
                attendee.checkedIn
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

          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Contact & Ticket Telemetry */}
            <div className="p-5 rounded-2xl bg-white border border-[#E0E5F2] shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Contact & Ticket Telemetry</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-medium">Primary Email</span>
                  <a 
                    href={`mailto:${attendee.email}`} 
                    className="font-bold text-[#1B254B] hover:text-[#B58E29] transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#707EAE]" />
                    <span>{attendee.email || 'No data'}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-medium">Phone Number</span>
                  {attendee.phone ? (
                    <a 
                      href={`tel:${attendee.phone}`} 
                      className="font-bold text-[#1B254B] hover:text-[#B58E29] transition-colors flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#707EAE]" />
                      <span>{attendee.phone}</span>
                    </a>
                  ) : (
                    <span className="font-semibold text-[#A3AED0] mt-0.5 block">No data</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-medium">Partner / Spouse</span>
                  <div className="font-bold text-[#1B254B] flex items-center gap-1.5 mt-0.5">
                    <Heart className="w-3.5 h-3.5 text-[#E1306C]" />
                    <span>{attendee.partnerName || 'No data'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E0E5F2] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-[#A3AED0] block font-medium">Price / Tier</span>
                    <span className="font-bold text-[#1B254B] block mt-0.5">
                      {attendee.ticketPrice || (attendee.pricePaid ? `£${attendee.pricePaid}` : 'Complimentary')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A3AED0] block font-medium">Payment Status</span>
                    <span className="font-bold text-[#10B981] capitalize block mt-0.5">
                      {attendee.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#A3AED0] block font-medium">Registration Timestamp</span>
                  <span className="font-semibold text-[#707EAE] text-[11px] block mt-0.5">
                    {new Date(attendee.registeredAt || attendee.createdAt || Date.now()).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Wedding & Planning Profile */}
            <div className="p-5 rounded-2xl bg-white border border-[#E0E5F2] shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Wedding & Planning Profile</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Role</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block">
                    {attendee.attendeeType || 'Guest'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Timeframe</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block">
                    {attendee.weddingTimeframe || 'No data'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Location</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B58E29]" />
                    <span className="truncate">{attendee.weddingLocation || 'No data'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Budget</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block">
                    {attendee.weddingBudget || 'No data'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Guest Count</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#707EAE]" />
                    <span>{attendee.guestCount || 'No data'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
                  <span className="text-[10px] font-bold text-[#A3AED0] uppercase block">Referral Channel</span>
                  <span className="font-bold text-[#1B254B] mt-0.5 block truncate">
                    {attendee.discoveryChannel || 'No data'}
                  </span>
                </div>
              </div>

              {/* Cultural Influences */}
              {attendee.culturalInfluences && attendee.culturalInfluences.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#A3AED0] block mb-1.5 uppercase">
                    Cultural Influences
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {attendee.culturalInfluences.map(c => (
                      <span key={c} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services Requested */}
          {attendee.servicesNeeded && attendee.servicesNeeded.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#E0E5F2] shadow-xs">
              <h4 className="text-xs font-bold text-[#B58E29] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Tag className="w-3.5 h-3.5" />
                <span>Wedding Services Requested ({attendee.servicesNeeded.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {attendee.servicesNeeded.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] text-xs font-semibold text-[#1B254B] shadow-2xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Pass Section */}
          <div className="p-5 rounded-2xl bg-white border border-[#E0E5F2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {qrDataUrl ? (
                <div className="p-2.5 bg-white border border-[#E0E5F2] rounded-2xl shadow-xs shrink-0">
                  <img src={qrDataUrl} alt={`QR Code for ${attendee.refCode}`} className="w-24 h-24 object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl flex items-center justify-center text-[#A3AED0]">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-[#1B254B]">Official Digital Pass QR</h4>
                <p className="text-xs text-[#707EAE] mt-0.5">Encodes guest reference code for fast-scan venue validation.</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FE] hover:bg-[#EAEFFD] text-[#1B254B] border border-[#E0E5F2] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ref</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-[#A3AED0] shrink-0 self-end sm:self-center">
              <span className="font-mono text-xs font-bold text-[#8F6E1C] bg-[#FFF9E6] px-3 py-1 rounded-full border border-[#F3DC82]">
                {attendee.refCode}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E0E5F2] bg-[#F4F7FE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#707EAE]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Attendee Record Verified in ExCeL London Registry</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#E0E5F2] hover:bg-[#EAEFFD] text-[#1B254B] font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
