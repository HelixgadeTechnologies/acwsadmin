'use client';

import React, { useMemo } from 'react';
import { Vendor } from '@/types';
import { Store, CheckCircle2, Clock, PoundSterling, ArrowUpRight } from 'lucide-react';

export interface VendorStatCardsProps {
  vendors: Vendor[];
  activeFilter?: string;
  onFilterSelect?: (status: string) => void;
}

export function calculateVendorPayment(vendor: Vendor): number {
  const anyV = vendor as any;
  const explicit = anyV.pricePaid ?? anyV.amountPaid ?? anyV.amount ?? anyV.fee ?? anyV.standPrice ?? anyV.standFee;
  if (explicit !== undefined && explicit !== null && explicit !== '') {
    const parsed = typeof explicit === 'number' ? explicit : parseFloat(String(explicit).replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Base stand fees for approved exhibitors:
  // Standard: £1,250 | Premium: £1,850 | Catwalk: £2,500 | Executive: £3,500
  if (vendor.status === 'approved' || anyV.paymentStatus === 'paid') {
    const tier = (vendor.paymentTier || 'standard').toLowerCase();
    const tierPricing: Record<string, number> = {
      standard: 1250,
      premium: 1850,
      catwalk: 2500,
      executive: 3500
    };
    return tierPricing[tier] || 1250;
  }

  return 0;
}

export default function VendorStatCards({
  vendors,
  activeFilter = 'all',
  onFilterSelect
}: VendorStatCardsProps) {
  const totalVendors = vendors.length;
  const approvedCount = vendors.filter(v => v.status === 'approved').length;
  const pendingCount = vendors.filter(v => v.status === 'pending').length;

  const totalRevenue = useMemo(() => {
    return vendors.reduce((acc, v) => acc + calculateVendorPayment(v), 0);
  }, [vendors]);

  const paidCount = useMemo(() => {
    return vendors.filter(v => calculateVendorPayment(v) > 0).length;
  }, [vendors]);

  const cards = [
    {
      id: 'revenue',
      filterTarget: 'approved',
      title: 'Vendor Payments',
      value: `£${totalRevenue.toLocaleString()}`,
      subtext: paidCount > 0 
        ? `${paidCount} paid stand fee${paidCount === 1 ? '' : 's'}` 
        : 'Stand fees collected',
      icon: PoundSterling,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30'
    },
    {
      id: 'all',
      filterTarget: 'all',
      title: 'Total Applications',
      value: totalVendors.toLocaleString(),
      subtext: 'Registered exhibitor submissions',
      icon: Store,
      color: 'text-[#B58E29]',
      bgColor: 'bg-[#FFF9E6]',
      borderColor: 'border-[#F3DC82]'
    },
    {
      id: 'approved',
      filterTarget: 'approved',
      title: 'Approved Exhibitors',
      value: approvedCount.toLocaleString(),
      subtext: `${totalVendors ? Math.round((approvedCount / totalVendors) * 100) : 0}% acceptance rate`,
      icon: CheckCircle2,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30'
    },
    {
      id: 'pending',
      filterTarget: 'pending',
      title: 'Pending Review',
      value: pendingCount.toLocaleString(),
      subtext: 'Action required by curator',
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

