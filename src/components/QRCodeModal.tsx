/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode, X, Share2, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ roomCode, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate complete join URL
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${encodeURIComponent(roomCode)}`
    : `/?room=${encodeURIComponent(roomCode)}`;

  useEffect(() => {
    if (roomCode) {
      QRCode.toDataURL(joinUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url: string) => setQrDataUrl(url))
        .catch((err: unknown) => console.error('QR Error:', err));
    }
  }, [roomCode, joinUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Rap Cypher!',
          text: `Enter room code ${roomCode} to battle rap with me!`,
          url: joinUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white border-4 border-black p-6 shadow-neo-xl text-center text-black">
        {/* Close Button */}
        <button
          id="btn-close-qr-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl border-2 border-black bg-[#FF5470] text-white hover:bg-[#E11D48] transition shadow-[1px_1px_0px_#000] active:translate-y-0.5 active:shadow-none"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Neo-Brutalist Header */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <QrCode className="w-5 h-5 stroke-[2.5]" />
          <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
            SCAN TO CONNECT
          </span>
        </div>

        <h3 className="font-['Syne'] font-extrabold text-2xl text-black uppercase tracking-tight mb-1">
          JOIN CYPHER
        </h3>
        <p className="font-['Space_Grotesk'] font-bold text-xs text-neutral-600 uppercase mb-4">
          Scan this barcode on any phone camera to jump straight in.
        </p>

        {/* High-Contrast QR Code Container */}
        <div className="mx-auto w-[220px] h-[220px] bg-[#FFE600] rounded-xl p-3 border-3 border-black shadow-neo flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`Room ${roomCode} QR Code`} className="w-full h-full rounded border-2 border-black object-contain bg-white" />
          ) : (
            <div className="text-xs font-['Space_Grotesk'] font-bold text-black uppercase">
              Generating code...
            </div>
          )}
        </div>

        {/* Room Code Badge */}
        <div className="mt-4 p-3 rounded-xl bg-[#FFFDF0] border-2 border-black flex items-center justify-between shadow-neo-sm">
          <div className="text-left">
            <div className="text-[10px] font-['Space_Grotesk'] font-black uppercase text-neutral-500">
              ROOM CODE
            </div>
            <div className="font-['Space_Grotesk'] font-black text-xl text-black tracking-widest">
              {roomCode}
            </div>
          </div>
          <button
            id="btn-copy-link"
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-[#FFE600] border-2 border-black text-xs font-['Space_Grotesk'] font-black uppercase hover:bg-neutral-800 transition active:translate-y-0.5 active:shadow-none shadow-[1px_1px_0px_#000]"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[3] text-[#00E599]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{copied ? 'COPIED!' : 'COPY'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            id="btn-share-link"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00F0FF] text-black border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SHARE LINK</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-black text-white border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase hover:bg-neutral-800 transition shadow-neo-sm active:translate-y-0.5 active:shadow-none"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
