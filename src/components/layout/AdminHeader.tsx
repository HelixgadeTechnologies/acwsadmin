'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminHeader({
  title = 'Dashboard & Analytics',
  breadcrumbs = ['Pages', 'Dashboard'],
  onToggleSidebar,
  onRefresh
}: {
  title?: string;
  breadcrumbs?: string[];
  onToggleSidebar?: () => void;
  onRefresh?: () => void;
}) {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E0E5F2] px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Breadcrumbs / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-[#707EAE] hover:text-[#1B254B] bg-[#F4F7FE] border border-[#E0E5F2] lg:hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#707EAE] font-medium">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span>/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-[#B58E29] font-bold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <h2 className="text-xl font-bold text-[#1B254B] tracking-tight">{title}</h2>
          </div>
        </div>

        {/* Right: Search + Live Clock + Notifications + Profile Chip */}
        <div className="flex items-center gap-3">
          {/* Universal Search Input */}
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
            <input
              type="text"
              placeholder="Search ref, vendor, name..."
              className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl pl-9 pr-3 py-2 text-xs text-[#1B254B] placeholder-[#A3AED0] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF9E6] border border-[#F3DC82] text-xs font-mono font-bold text-[#8F6E1C]">
            <Clock className="w-3.5 h-3.5" />
            <span>{time || '--:--:--'}</span>
          </div>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              title="Refresh Data"
              className="p-2 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Notification Bell */}
          <button 
            title="Curator Notifications"
            className="p-2 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E0E5F2]">
            {(() => {
              const userName = user?.name || (user as any)?.user?.name || '';
              const initials = userName ? userName.slice(0, 2).toUpperCase() : 'AC';
              return (
                <div 
                  title={userName || 'ACWS Curator'} 
                  className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#070506] font-bold text-xs flex items-center justify-center shadow-xs"
                >
                  {initials}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </header>
  );
}
