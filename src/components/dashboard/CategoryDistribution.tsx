'use client';

import React from 'react';
import { Vendor } from '@/types';
import { Layers } from 'lucide-react';

export default function CategoryDistribution({ vendors }: { vendors: Vendor[] }) {
  const categoryCounts = vendors.reduce((acc: Record<string, number>, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  const total = vendors.length || 1;
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] text-[#B58E29] flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-[#1B254B]">Sector & Category Mix</h3>
      </div>
      <p className="text-xs text-[#A3AED0] mb-6">Exhibitor balance across wedding disciplines</p>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-sm font-semibold text-[#A3AED0]">
            No data
          </div>
        ) : (
          categories.map(([category, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={category}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1B254B]">{category}</span>
                  <span className="text-[#707EAE] font-semibold">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#EFF4FB] overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
