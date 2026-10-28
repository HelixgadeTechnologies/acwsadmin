'use client';

import React, { useMemo } from 'react';
import { Attendee } from '@/types';
import { Users, CheckCircle2, Clock, PoundSterling, ArrowUpRight } from 'lucide-react';

export interface AttendeeStatCardsProps {
  attendees: Attendee[];
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

export function calculateAttendeePayment(attendee: Attendee): number {
  const anyA = attendee as any;
  
  // 1. Explicit pricePaid number or string
  if (attendee.pricePaid !== undefined && attendee.pricePaid !== null && (attendee.pricePaid as any) !== '') {
    const parsed = typeof attendee.pricePaid === 'number' ? attendee.pricePaid : parseFloat(String(attendee.pricePaid).replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. ticketPrice string (e.g. "£65", "65", "£85.00")
  if (attendee.ticketPrice && typeof attendee.ticketPrice === 'string') {
    const parsed = parseFloat(attendee.ticketPrice.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 3. Alternate payment fields
  const alt = anyA.amountPaid ?? anyA.amount ?? anyA.price;
  if (alt !== undefined && alt !== null && alt !== '') {
    const parsed = typeof alt === 'number' ? alt : parseFloat(String(alt).replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 4. Fallback based on ticket tier unless explicitly complimentary or pending
  const status = (attendee.paymentStatus || 'paid').toLowerCase();
  if (status !== 'complimentary' && status !== 'pending' && status !== 'free' && status !== 'unpaid') {
    const type = (attendee.ticketType || 'standard').toLowerCase();
    if (type.includes('catwalk')) return 85;
    if (type.includes('vip')) return 65;
    if (type.includes('standard')) return 25;
  }

  return 0;
}

export default function AttendeeStatCards({
  attendees,
  activeFilter = 'all',
  onFilterSelect
}: AttendeeStatCardsProps) {
  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const pendingCount = Math.max(0, totalAttendees - checkedInCount);

  const totalRevenue = useMemo(() => {
    return attendees.reduce((acc, a) => acc + calculateAttendeePayment(a), 0);
  }, [attendees]);

  const paidCount = useMemo(() => {
    return attendees.filter(a => calculateAttendeePayment(a) > 0).length;
  }, [attendees]);

  const cards = [
    {
      id: 'revenue',
      filterTarget: 'all',
      title: 'Attendee Payments',
      value: `£${totalRevenue.toLocaleString()}`,
      subtext: paidCount > 0 
        ? `${paidCount} paid ticket pass${paidCount === 1 ? '' : 'es'}` 
        : 'Ticket pass revenue collected',
      icon: PoundSterling,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30'
    },
    {
      id: 'all',
      filterTarget: 'all',
      title: 'Total Attendees',
      value: totalAttendees.toLocaleString(),
      subtext: 'Registered guest passes',
      icon: Users,
      color: 'text-[#B58E29]',
      bgColor: 'bg-[#FFF9E6]',
      borderColor: 'border-[#F3DC82]'
    },
    {
      id: 'checkedIn',
      filterTarget: 'checkedIn',
      title: 'Checked In',
      value: checkedInCount.toLocaleString(),
      subtext: `${totalAttendees ? Math.round((checkedInCount / totalAttendees) * 100) : 0}% venue arrival rate`,
      icon: CheckCircle2,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30'
    },
    {
      id: 'notCheckedIn',
      filterTarget: 'notCheckedIn',
      title: 'Pending Arrival',
      value: pendingCount.toLocaleString(),
      subtext: 'Awaiting venue entrance',
      icon: Clock,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
      borderColor: 'border-[#F59E0B]/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeFilter === c.id && c.id !== 'revenue';
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onFilterSelect?.(c.filterTarget)}
            className={`
              p-5 rounded-2xl bg-white border text-left transition-all duration-200 group shadow-xs cursor-pointer
              ${isSelected 
                ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md' 
                : `border-[#E0E5F2] hover:${c.borderColor} hover:shadow-md`}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl ${c.bgColor} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl lg:text-3xl font-extrabold text-[#1B254B] tracking-tight">
                {c.value}
              </span>
              <ArrowUpRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-[#B58E29]' : 'text-[#A3AED0] group-hover:text-[#B58E29]'}`} />
            </div>

            <p className="text-xs text-[#707EAE] font-medium mt-1">{c.subtext}</p>
          </button>
        );
      })}
    </div>
  );
}
