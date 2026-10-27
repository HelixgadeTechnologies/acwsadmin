'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share, Smartphone, WifiOff, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Online / Offline status listeners
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Check if already installed
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS Safari specific property
      (typeof window.navigator !== 'undefined' && window.navigator.standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 4. Check if dismissed previously within 24 hours
    const lastDismissed = localStorage.getItem('acws_pwa_dismissed');
    if (lastDismissed) {
      const hoursAgo = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        setDismissed(true);
      }
    }

    // 5. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    if (isIosDevice && isSafari && !isStandalone) {
      setIsIOS(true);
    }

    // 6. Listen for Android / Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 7. Listen for successful app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('[PWA] Application successfully installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Installation failed:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSPrompt(false);
    localStorage.setItem('acws_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#EF4444] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md animate-in slide-in-from-top">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Offline Mode Active — Browsing cached data. Reconnecting to ExCeL live telemetry...</span>
          </div>
        </div>
      )}

      {/* Back Online Toast */}
      {showOnlineToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#10B981] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Connected: Live ACWS telemetry restored</span>
        </div>
      )}

      {/* Mobile Android / Chrome Install Prompt Banner */}
      {isInstallable && !isInstalled && !dismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white border-2 border-[#D4AF37] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1B254B] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-xs">
              <Smartphone className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FFF9E6] text-[#8F6E1C] border border-[#F3DC82]">
                  Mobile App
                </span>
                <span className="text-xs font-bold text-[#1B254B] truncate">ACWS 2027 Admin</span>
              </div>
              <p className="text-[11px] text-[#707EAE] mt-1 leading-snug">
                Install as a progressive app on your phone for full-screen management & quick access.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 text-xs font-semibold text-[#A3AED0] hover:text-[#1B254B] transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="text-[#A3AED0] hover:text-[#1B254B] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Home Screen Guide */}
      {isIOS && !isInstalled && !dismissed && (
        <>
          {!showIOSPrompt ? (
            <button
              type="button"
              onClick={() => setShowIOSPrompt(true)}
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto z-40 bg-white border border-[#D4AF37] rounded-xl px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 text-xs font-bold text-[#1B254B] cursor-pointer hover:bg-[#FFFDF5] transition-all"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Add to iPhone Home Screen</span>
              </div>
              <span className="text-[10px] text-[#B58E29] bg-[#FFF9E6] px-2 py-0.5 rounded border border-[#F3DC82]">
                Setup
              </span>
            </button>
          ) : (
            <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white border-2 border-[#D4AF37] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B254B] flex items-center justify-center text-[#D4AF37]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B254B]">Install on iPhone / iPad</h4>
                    <p className="text-[11px] text-[#707EAE]">Run ACWS Admin in full-screen standalone mode</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[#A3AED0] hover:text-[#1B254B] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mt-3 pt-3 border-t border-[#E0E5F2] text-xs text-[#1B254B]">
                <div className="flex items-center gap-2.5 bg-[#F4F7FE] p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#070506] font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap Safari&apos;s Share button <Share className="w-3.5 h-3.5 inline mx-1 text-[#3B82F6]" /> in the browser bar.</span>
                </div>
                <div className="flex items-center gap-2.5 bg-[#F4F7FE] p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#070506] font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong> ⊕.</span>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-bold text-[#B58E29] hover:underline cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
