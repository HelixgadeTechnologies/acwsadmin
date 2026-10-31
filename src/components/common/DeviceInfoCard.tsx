'use client';

import React, { useState } from 'react';
import { DeviceInfo } from '@/types';
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Wifi,
  MapPin,
  Maximize2,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Info
} from 'lucide-react';

interface DeviceInfoCardProps {
  deviceInfo?: DeviceInfo | any;
  registeredAt?: string;
  title?: string;
  subtitle?: string;
}

function parseUserAgentFallback(ua?: string) {
  if (!ua || typeof ua !== 'string') return { browser: null, os: null, deviceType: null };

  let os: string | null = null;
  let deviceType: string | null = null;
  let browser: string | null = null;

  // OS Detection
  if (/iPhone/i.test(ua)) {
    os = 'iOS (iPhone)';
    deviceType = 'Mobile';
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    deviceType = 'Tablet';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = /Mobile/i.test(ua) ? 'Mobile' : 'Tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    deviceType = 'Desktop';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
    deviceType = 'Desktop';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    deviceType = 'Desktop';
  }

  // Browser Detection
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Opera|OPR\//i.test(ua)) {
    browser = 'Opera';
  }

  return { browser, os, deviceType };
}

export default function DeviceInfoCard({
  deviceInfo,
  registeredAt,
  title = 'Registration Device & Telemetry',
  subtitle = 'Client hardware, browser environment, and network telemetry captured at registration'
}: DeviceInfoCardProps) {
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedUa, setCopiedUa] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Normalize or unpack deviceInfo if wrapped or stringified
  let raw: Record<string, any> = {};
  if (typeof deviceInfo === 'string') {
    try {
      raw = JSON.parse(deviceInfo);
    } catch {
      raw = { userAgent: deviceInfo };
    }
  } else if (deviceInfo && typeof deviceInfo === 'object') {
    raw = { ...deviceInfo };
  }

  const hasData = Boolean(
    raw &&
    Object.keys(raw).length > 0 &&
    (raw.userAgent || raw.ip || raw.ipAddress || raw.browser || raw.os || raw.device || raw.raw)
  );

  const rawUa = raw.userAgent || raw.ua || raw.user_agent || (typeof raw.raw === 'string' && raw.raw.includes('Mozilla/') ? raw.raw : null);
  const uaInferred = parseUserAgentFallback(rawUa);

  // Extracted telemetry metrics
  const ip = raw.ip || raw.ipAddress || raw.clientIp || raw.networkIp || null;
  const browserName = raw.browser || raw.browserName || raw.browser_name || uaInferred.browser || null;
  const browserVersion = raw.browserVersion || raw.browser_version || raw.version || null;
  const browserDisplay = browserName ? (browserVersion ? `${browserName} (${browserVersion})` : browserName) : null;

  const osName = raw.os || raw.operatingSystem || raw.os_name || uaInferred.os || null;
  const osVersion = raw.osVersion || raw.os_version || null;
  const osDisplay = osName ? (osVersion ? `${osName} ${osVersion}` : osName) : null;

  const deviceType = raw.deviceType || raw.device_type || raw.type || (raw.isMobile ? 'Mobile' : raw.isTablet ? 'Tablet' : raw.isDesktop ? 'Desktop' : uaInferred.deviceType) || 'Unknown Device';
  const deviceModel = raw.deviceModel || raw.device_model || raw.model || raw.device || raw.platform || null;

  const screenRes =
    raw.screenResolution ||
    raw.screen ||
    raw.resolution ||
    (raw.screenWidth && raw.screenHeight ? `${raw.screenWidth} × ${raw.screenHeight}` : null);

  const timezone = raw.timezone || raw.timeZone || raw.tz || null;
  const language = raw.language || raw.lang || raw.locale || null;

  const city = raw.city || null;
  const country = raw.country || null;
  const location = raw.location || (city && country ? `${city}, ${country}` : (city || country || null));

  const handleCopyIp = () => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleCopyUa = () => {
    if (!rawUa) return;
    navigator.clipboard.writeText(rawUa);
    setCopiedUa(true);
    setTimeout(() => setCopiedUa(false), 2000);
  };

  const getDeviceIcon = () => {
    const dt = String(deviceType).toLowerCase();
    if (dt.includes('mobile') || dt.includes('phone')) return <Smartphone className="w-5 h-5" />;
    if (dt.includes('tablet') || dt.includes('pad')) return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 text-[#2B3674] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E0E5F2]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center shadow-xs shrink-0">
            {getDeviceIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg lg:text-xl font-bold text-[#1B254B]">{title}</h4>
              {hasData ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Telemetry Captured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#707EAE]/15 text-[#707EAE] border border-[#707EAE]/30">
                  <Info className="w-3.5 h-3.5" />
                  <span>No Telemetry</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#707EAE] mt-0.5">{subtitle}</p>
          </div>
        </div>

        {hasData && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F4F7FE] text-[#1B254B] border border-[#E0E5F2] capitalize">
              {deviceType}
            </span>
            {osDisplay && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]">
                {osDisplay}
              </span>
            )}
          </div>
        )}
      </div>

      {!hasData ? (
        /* Empty / Fallback State */
        <div className="py-8 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F7FE] text-[#A3AED0] border border-[#E0E5F2] flex items-center justify-center mx-auto mb-3">
            <Laptop className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-bold text-[#1B254B]">No Device Telemetry Recorded</h5>
          <p className="text-xs text-[#707EAE] mt-1 max-w-md mx-auto leading-relaxed">
            Device and network telemetry was not captured during submission. This typically happens for legacy records, registrations added directly by an administrator, or when client privacy blockers/extensions prevent telemetry scripts.
          </p>
          {registeredAt && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#8F6E1C] bg-[#FFF9E6] px-3 py-1 rounded-lg border border-[#F3DC82]">
              <span>Registration Timestamp:</span>
              <span className="font-bold">
                {new Date(registeredAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Active Telemetry Metrics Grid */
        <div className="space-y-6 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Device & Platform */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>Device & Platform</span>
                {getDeviceIcon()}
              </div>
              <p className="text-sm font-bold text-[#1B254B] mt-2">
                {deviceModel || deviceType || 'Unknown Device'}
              </p>
              <p className="text-[11px] text-[#707EAE] mt-0.5 capitalize">
                Form factor: <strong className="text-[#1B254B]">{deviceType}</strong>
              </p>
            </div>

            {/* Operating System */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>Operating System</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B58E29]">System</span>
              </div>
              <p className="text-sm font-bold text-[#1B254B] mt-2">
                {osDisplay || 'Operating System Not Reported'}
              </p>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                Platform: <span className="font-mono text-[#1B254B]">{raw.platform || 'Web Standard'}</span>
              </p>
            </div>

            {/* Web Browser */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>Web Browser</span>
                <Globe className="w-4 h-4 text-[#707EAE]" />
              </div>
              <p className="text-sm font-bold text-[#1B254B] mt-2">
                {browserDisplay || 'Web Browser Not Reported'}
              </p>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                Language: <strong className="text-[#1B254B]">{language || 'System Default'}</strong>
              </p>
            </div>

            {/* IP Address */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>IP Address</span>
                <Wifi className="w-4 h-4 text-[#707EAE]" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-sm font-bold text-[#1B254B]">
                  {ip || 'Not Captured'}
                </span>
                {ip && (
                  <button
                    type="button"
                    onClick={handleCopyIp}
                    className="p-1.5 rounded-lg bg-white border border-[#E0E5F2] hover:bg-[#E0E5F2] text-[#707EAE] hover:text-[#1B254B] transition-colors cursor-pointer"
                    title="Copy IP Address"
                  >
                    {copiedIp ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                Network endpoint at time of submission
              </p>
            </div>

            {/* Screen Resolution */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>Display & Screen</span>
                <Maximize2 className="w-4 h-4 text-[#707EAE]" />
              </div>
              <p className="text-sm font-bold text-[#1B254B] mt-2">
                {screenRes ? `${screenRes} px` : 'Resolution Not Captured'}
              </p>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                Pixel ratio: <strong className="text-[#1B254B]">{raw.pixelRatio || raw.devicePixelRatio ? `${raw.pixelRatio || raw.devicePixelRatio}x` : 'Standard'}</strong>
              </p>
            </div>

            {/* Location & Timezone */}
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between text-xs font-medium text-[#A3AED0]">
                <span>Region & Timezone</span>
                <MapPin className="w-4 h-4 text-[#B58E29]" />
              </div>
              <p className="text-sm font-bold text-[#1B254B] mt-2 flex items-center gap-1.5 truncate">
                <span>{location || timezone || 'Local Time'}</span>
              </p>
              <p className="text-[11px] text-[#707EAE] mt-0.5">
                Timezone: <strong className="text-[#1B254B]">{timezone || 'UTC / Host Local'}</strong>
              </p>
            </div>
          </div>

          {/* User Agent String Viewer */}
          {rawUa && (
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                  Raw User-Agent Header
                </span>
                <button
                  type="button"
                  onClick={handleCopyUa}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E0E5F2] hover:bg-[#E0E5F2] text-xs font-semibold text-[#1B254B] transition-colors cursor-pointer"
                  title="Copy User-Agent string"
                >
                  {copiedUa ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#707EAE]" />
                      <span>Copy UA</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-[#2B3674] bg-white p-3 rounded-xl border border-[#E0E5F2] break-all leading-relaxed select-all">
                {rawUa}
              </div>
            </div>
          )}

          {/* Expandable Full JSON Telemetry Payload */}
          <div className="border-t border-[#E0E5F2] pt-4">
            <button
              type="button"
              onClick={() => setShowRaw(prev => !prev)}
              className="flex items-center justify-between w-full text-xs font-bold text-[#707EAE] hover:text-[#1B254B] transition-colors cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#B58E29]" />
                <span>Full Telemetry Payload (JSON)</span>
              </div>
              {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showRaw && (
              <div className="mt-3 bg-[#1B254B] text-[#E0E5F2] rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
                <pre>{JSON.stringify(raw, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

