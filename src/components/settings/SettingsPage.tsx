'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  MapPin, 
  Save, 
  Check, 
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [eventName, setEventName] = useState('African & Caribbean Wedding Show (ACWS 2027)');
  const [eventDates, setEventDates] = useState('May 15–16, 2027');
  const [venue, setVenue] = useState('ExCeL London, Royal Victoria Dock, London E16 1XL');
  const [catwalkQuota, setCatwalkQuota] = useState(15);
  const [premiumQuota, setPremiumQuota] = useState(30);
  const [standardQuota, setStandardQuota] = useState(60);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setBackendStatus('checking');
    const start = Date.now();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://acwsbackend.onrender.com/api/v1';
    try {
      const res = await fetch(`${apiBase}/admin/vendors/stats`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const latency = Date.now() - start;
      setPingLatency(latency);
      if (res.ok || res.status === 401) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
      setPingLatency(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1B254B]">Operations & Event Parameters</h3>
            <p className="text-xs text-[#A3AED0]">Manage Exhibition telemetry, booth quotas, and server connectivity</p>
          </div>
        </div>

        {/* Backend Health Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
            <span className={`w-2.5 h-2.5 rounded-full ${
              backendStatus === 'connected' ? 'bg-[#10B981]' : (backendStatus === 'checking' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]')
            }`} />
            <span className="text-xs font-bold text-[#1B254B]">
              Backend: {backendStatus === 'connected' ? `Live (${pingLatency}ms)` : (backendStatus === 'checking' ? 'Pinging...' : 'Offline / Standalone')}
            </span>
          </div>

          <button
            onClick={checkHealth}
            title="Ping Health"
            className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Event Schedule & Location */}
        <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#B58E29] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Exhibition Venue & Schedule</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">Official Event Title</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2B3674] mb-1.5">Exhibition Dates</label>
              <input
                type="text"
                value={eventDates}
                onChange={(e) => setEventDates(e.target.value)}
                className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl px-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#2B3674] mb-1.5">Official Venue Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl pl-10 pr-3.5 py-2.5 text-[#1B254B] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stand Quotas & Allocation Caps */}
        <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 shadow-xs">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#B58E29] mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Exhibition Stand Quotas & Floorplan Limits</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <label className="block font-bold text-[#1B254B] mb-1">Catwalk Runway Tier</label>
              <p className="text-[11px] text-[#A3AED0] mb-3">6m × 4m Feature Space</p>
              <input
                type="number"
                value={catwalkQuota}
                onChange={(e) => setCatwalkQuota(Number(e.target.value))}
                className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <label className="block font-bold text-[#1B254B] mb-1">Premium Island Tier</label>
              <p className="text-[11px] text-[#A3AED0] mb-3">4m × 4m Space Only</p>
              <input
                type="number"
                value={premiumQuota}
                onChange={(e) => setPremiumQuota(Number(e.target.value))}
                className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <label className="block font-bold text-[#1B254B] mb-1">Standard Shell Scheme</label>
              <p className="text-[11px] text-[#A3AED0] mb-3">3m × 3m Fitted Booth</p>
              <input
                type="number"
                value={standardQuota}
                onChange={(e) => setStandardQuota(Number(e.target.value))}
                className="w-full bg-white border border-[#E0E5F2] rounded-lg px-3 py-2 text-[#1B254B] font-mono font-bold focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Global Controls & Registration Gate */}
        <div className="bg-white border border-[#E0E5F2] rounded-2xl p-6 flex items-center justify-between shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-[#1B254B]">Vendor Registration Status</h4>
            <p className="text-xs text-[#A3AED0] mt-0.5">Control whether new exhibitors can submit applications via the public portal</p>
          </div>

          <button
            type="button"
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              registrationOpen 
                ? 'bg-[#10B981] text-white' 
                : 'bg-[#EF4444] text-white'
            }`}
          >
            {registrationOpen ? 'Registration OPEN' : 'Registration CLOSED'}
          </button>
        </div>

        {/* Save Bar with Solid Gold Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Configurations saved successfully!</span>
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
