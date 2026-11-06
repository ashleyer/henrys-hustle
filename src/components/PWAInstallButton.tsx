/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
      return;
    }
    setShowIOSGuide(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-2.5 py-1 rounded-xl border border-cyan-400/50 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
        title="Install App to Home Screen"
      >
        {isIOS ? <Smartphone className="w-3.5 h-3.5 text-cyan-300" /> : <Download className="w-3.5 h-3.5 text-cyan-300" />}
        <span>{isIOS ? 'iPhone App' : 'Install App'}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 select-none">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-cyan-400 p-5 shadow-2xl text-left relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center font-arcade text-lg text-slate-950 font-black">
                T
              </div>
              <div>
                <h3 className="font-arcade text-base text-white">SAVE TO HOME SCREEN</h3>
                <p className="text-xs text-cyan-300 font-semibold">Play Full-Screen Like an iOS App!</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Tap the <strong>Share</strong> button <Share className="w-4 h-4 text-cyan-400 inline" /> in Safari or Chrome.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Tap <strong>Add to Home Screen</strong> <PlusSquare className="w-4 h-4 text-emerald-400 inline" />.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Open <strong>Hub Hustle</strong> from your Home Screen anytime!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-sm font-black transition active:scale-95 cursor-pointer"
            >
              GOT IT! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
};
