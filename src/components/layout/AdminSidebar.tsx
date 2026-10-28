'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function AdminSidebar({
  vendorCount = 0,
  attendeeCount = 0,
  isOpen = false,
  onClose
}: {
  vendorCount?: number;
  attendeeCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard' || pathname === '/'
    },
    {
      name: 'Vendors Directory',
      href: '/vendors',
      icon: Store,
      badge: vendorCount > 0 ? vendorCount : undefined,
      active: pathname.startsWith('/vendors')
    },
    {
      name: 'Attendees & Guests',
      href: '/attendees',
      icon: Users,
      badge: attendeeCount > 0 ? attendeeCount : undefined,
      active: pathname.startsWith('/attendees')
    },
    {
      name: 'Settings & Ops',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#E0E5F2] z-50 flex flex-col transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
              {/* Brand Header with ACWS Logo */}
              <div className="px-5 py-4 border-b border-[#E0E5F2] flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-[#B58E29] font-extrabold">ACWS 2027</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]">
                    LIVE DESK
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="w-full flex flex-col items-center group py-1"
                >
                  <div className="relative w-full flex items-center justify-center p-2 rounded-2xl transition-all duration-200 group-hover:bg-[#FFF9E6]/50">
                    <Image
                      src="/images/acws-logo.png"
                      alt="African & Caribbean Wedding Show Logo"
                      width={170}
                      height={110}
                      priority
                      className="w-auto h-20 max-w-[170px] object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-[#1B254B] tracking-tight mt-1 uppercase text-center">
                    Curator & Admin Portal
                  </p>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#A3AED0]">
                  Main Operations
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                  flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${item.active
                          ? 'bg-[#FFF9E6] text-[#8F6E1C] border border-[#D4AF37]/60 shadow-xs'
                          : 'text-[#707EAE] hover:text-[#1B254B] hover:bg-[#F4F7FE]'}
                `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${item.active ? 'bg-[#D4AF37] text-[#070506]' : 'bg-[#F4F7FE] text-[#707EAE] group-hover:text-[#1B254B]'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.active
                            ? 'bg-[#D4AF37] text-[#070506]'
                            : 'bg-[#F4F7FE] text-[#707EAE]'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Identity & Logout */}
              <div className="p-4 border-t border-[#E0E5F2] bg-white">
                {(() => {
                  const userName = user?.name || (user as any)?.user?.name || '';
                  const userEmail = user?.email || (user as any)?.user?.email || '';
                  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'AC';
                  return (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#070506] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-[#1B254B] truncate">{userName || 'ACWS Curator'}</p>
                          <p className="text-xs text-[#A3AED0] truncate">{userEmail || 'admin@acws.co.uk'}</p>
                        </div>
                      </div>
                      <div title="Curator Verified" className="shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-[#070506] bg-[#D4AF37] hover:bg-[#B58E29] transition-all shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </>
          );
}
