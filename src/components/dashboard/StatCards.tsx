'use client';

import React from 'react';
import { KpiStats } from '@/types';
import { Store, CheckCircle2, PoundSterling, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function StatCards({ stats }: { stats: KpiStats }) {
  const cards = [
    {
      title: 'Total Applications',
      value: stats.totalVendors,
      subtext: 'Vendor registrations',
      icon: Store,
      color: 'text-[#B58E29]',
      bgColor: 'bg-[#FFF9E6]',
      borderColor: 'border-[#F3DC82]',
      link: '/vendors'
    },
    {
      title: 'Approved Exhibitors',
      value: stats.approvedCount,
      subtext: `${stats.totalVendors ? Math.round((stats.approvedCount / stats.totalVendors) * 100) : 0}% acceptance rate`,
      icon: CheckCircle2,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30',
      link: '/vendors?status=approved'
    },
    {
      title: 'Total Amount Paid',
      value: `£${(stats.totalRevenue || 0).toLocaleString()}`,
      subtext: (stats.vendorRevenue !== undefined && stats.attendeeRevenue !== undefined)
        ? `Vendors: £${stats.vendorRevenue.toLocaleString()} • Guests: £${stats.attendeeRevenue.toLocaleString()}`
        : 'Combined vendors & attendees',
      icon: PoundSterling,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30',
      link: '/vendors'
    },
    {
      title: 'Total Attendees',
      value: stats.totalAttendees.toLocaleString(),
      subtext: `${stats.attendeesCheckedIn} checked in at venue`,
      icon: Users,
      color: 'text-[#B58E29]',
      bgColor: 'bg-[#FFF9E6]',
      borderColor: 'border-[#F3DC82]',
      link: '/attendees'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.title}
            href={c.link}
            className={`
              p-5 rounded-2xl bg-white border border-[#E0E5F2] hover:${c.borderColor} hover:shadow-md transition-all duration-200 group shadow-xs
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
              <ArrowUpRight className="w-4 h-4 text-[#A3AED0] group-hover:text-[#B58E29] transition-colors" />
            </div>

            <p className="text-xs text-[#707EAE] font-medium mt-1">{c.subtext}</p>
          </Link>
        );
      })}
    </div>
  );
}
