/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setErrorMessage('Camera access is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);

      // Check if native BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
        const intervalId = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              extractAndSubmitCode(raw);
              clearInterval(intervalId);
            }
          } catch {
            // Frame parse error
          }
        }, 500);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      setErrorMessage('Camera permission was denied or unavailable. You can enter the room code directly below.');
    }
  };

  const extractAndSubmitCode = (raw: string) => {
    let code = raw;
    try {
      const url = new URL(raw);
      const roomParam = url.searchParams.get('room');
      if (roomParam) code = roomParam;
    } catch {
      // Not a full URL, use raw string
    }
    code = code.trim().toUpperCase();
    onScanResult(code);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-white border-4 border-black p-6 shadow-neo-xl text-center text-black">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl border-2 border-black bg-[#FF5470] text-white hover:bg-[#E11D48] transition shadow-[1px_1px_0px_#000] active:translate-y-0.5 active:shadow-none"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-1">
          <Camera className="w-5 h-5 stroke-[2.5]" />
          <h3 className="font-['Syne'] font-extrabold text-xl uppercase tracking-tight">SCAN ROOM CODE</h3>
        </div>
        <p className="font-['Space_Grotesk'] font-bold text-xs text-neutral-600 uppercase mb-4">
          Point camera at the host's QR code or barcode.
        </p>

        {/* Video Viewport */}
        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 border-3 border-black shadow-neo-sm flex items-center justify-center">
          {hasCamera ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Neo-Brutalist Target Reticle */}
              <div className="absolute inset-8 border-3 border-dashed border-[#FFE600] rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                <div className="w-full h-1 bg-[#FF5470] shadow-[0_0_8px_#FF5470]" />
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-white">
              <AlertCircle className="w-8 h-8 text-[#FFE600] mx-auto mb-2 stroke-[2.5]" />
              <p className="text-xs font-['Space_Grotesk'] font-bold uppercase">{errorMessage || 'Initializing camera...'}</p>
            </div>
          )}
        </div>

        {/* Manual Fallback Code Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-['Space_Grotesk'] font-black uppercase tracking-wider text-black block">
            OR ENTER ROOM CODE MANUALLY:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="E.G. BOHO-89"
              className="flex-1 px-3 py-2.5 rounded-xl bg-[#FFFDF0] border-2 border-black text-sm font-['Space_Grotesk'] font-black uppercase tracking-wider text-black focus:outline-none focus:bg-[#FFE600]/20 shadow-neo-sm"
            />
            <button
              onClick={() => {
                if (manualCode.trim()) {
                  extractAndSubmitCode(manualCode);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#00E599] text-black border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase hover:bg-[#34D399] transition shadow-neo-sm active:translate-y-0.5 active:shadow-none"
            >
              JOIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
