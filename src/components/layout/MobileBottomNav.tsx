'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, Settings } from 'lucide-react';

export default function MobileBottomNav({
  vendorCount = 0,
  attendeeCount = 0
}: {
  vendorCount?: number;
  attendeeCount?: number;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard' || pathname === '/'
    },
    {
      name: 'Vendors',
      href: '/vendors',
      icon: Store,
      badge: vendorCount > 0 ? vendorCount : undefined,
      active: pathname.startsWith('/vendors')
    },
    {
      name: 'Attendees',
      href: '/attendees',
      icon: Users,
      badge: attendeeCount > 0 ? attendeeCount : undefined,
      active: pathname.startsWith('/attendees')
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0E5F2] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center relative py-1 transition-colors select-none ${
                isActive ? 'text-[#B58E29]' : 'text-[#707EAE] hover:text-[#1B254B]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#D4AF37] text-[#070506] font-mono text-[9px] font-extrabold px-1 rounded-full min-w-4 text-center leading-tight">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 font-semibold ${isActive ? 'font-extrabold text-[#1B254B]' : ''}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[#D4AF37]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
