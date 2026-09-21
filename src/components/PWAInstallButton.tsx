/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as native standalone app, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop Install Flow
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFE600] text-black border-2 border-black hover:bg-[#FFDE59] transition text-xs font-['Space_Grotesk'] font-black uppercase shadow-neo-sm active:translate-y-0.5 active:shadow-none"
        title="Install Rap Battle on your phone"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios-guide"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black text-black hover:bg-neutral-100 transition text-xs font-['Space_Grotesk'] font-black uppercase shadow-neo-sm active:translate-y-0.5 active:shadow-none"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FF5470] stroke-[2.5]" />
          <span>ADD TO PHONE</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white border-4 border-black p-6 shadow-neo-xl text-black">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-['Syne'] font-extrabold text-lg uppercase tracking-tight">INSTALL ON IPHONE</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-xl border-2 border-black bg-[#FF5470] text-white hover:bg-[#E11D48]"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
              <p className="text-xs font-['Space_Grotesk'] font-bold text-neutral-600 uppercase mb-4">
                Play Rap Battle like a native mobile app from your home screen:
              </p>
              <div className="space-y-2 bg-[#FFFDF0] p-3.5 rounded-xl border-2 border-black text-xs font-['Space_Grotesk'] font-bold text-black shadow-inner">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#FFE600] text-black border border-black flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#FFE600] text-black border border-black flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#FFE600] text-black border border-black flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner!</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-3 rounded-xl bg-black text-[#FFE600] font-['Space_Grotesk'] font-black text-xs uppercase hover:bg-neutral-800 transition border-2 border-black shadow-neo-sm active:translate-y-0.5 active:shadow-none"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
