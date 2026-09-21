/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AvatarPicker } from './AvatarPicker.js';
import { Sparkles, QrCode, Play, Plus, Dice5, Radio, Disc3, Mic2, Zap } from 'lucide-react';

interface WelcomeViewProps {
  initialRoomCode?: string;
  onCreateRoom: (playerName: string, avatar: string) => void;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string) => void;
  onOpenScanner: () => void;
  errorMessage?: string;
}

const FUN_RAP_NAMES = [
  'MC BRUTAL',
  'SUB-BASS 808',
  'NEO SPITTER',
  'CYBER RHYME',
  'VINYL SLICER',
  'OCTANE MC',
  'STREET FLOW',
  'TURBO CYPHER',
  'KICK & SNARE',
  'MIC METEOR'
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  initialRoomCode = '',
  onCreateRoom,
  onJoinRoom,
  onOpenScanner,
  errorMessage,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');
  const [playerName, setPlayerName] = useState<string>(() => {
    return FUN_RAP_NAMES[Math.floor(Math.random() * FUN_RAP_NAMES.length)];
  });
  const [avatar, setAvatar] = useState<string>('mic');
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
      setMode('join');
    }
  }, [initialRoomCode]);

  const handleRandomizeName = () => {
    const nextName = FUN_RAP_NAMES[Math.floor(Math.random() * FUN_RAP_NAMES.length)];
    setPlayerName(nextName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim() || 'ANONYMOUS MC';
    if (mode === 'create') {
      onCreateRoom(cleanName, avatar);
    } else {
      if (!roomCode.trim()) return;
      onJoinRoom(roomCode.trim().toUpperCase(), cleanName, avatar);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Neo-Brutal Hero Card */}
      <div className="relative bg-[#FFE600] border-3 border-black p-6 shadow-neo-lg rounded-2xl text-black">
        {/* Floating Brutalist Sticker Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[#FFE600] border-2 border-black font-['Space_Grotesk'] font-black text-[11px] uppercase tracking-wider rounded-lg shadow-neo-sm rotate-[-1.5deg]">
            <Radio className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
            <span>MULTIPLAYER CYPHER</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FF5470] text-white border-2 border-black font-['Space_Grotesk'] font-black text-[10px] uppercase rounded-lg shadow-neo-sm rotate-[1deg]">
            <Zap className="w-3 h-3 fill-current text-[#FFE600]" />
            <span>STUDIO BEATS</span>
          </div>
        </div>

        {/* Title with heavy typography */}
        <div className="flex items-start gap-3 mt-1">
          <div className="w-14 h-14 rounded-xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
            <Mic2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-['Syne'] font-extrabold text-3xl leading-none tracking-tight uppercase">
              RAP BATTLE
            </h1>
            <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider mt-1 text-black/85">
              Fill blanks • Spit fire • Crown the MC
            </p>
          </div>
        </div>

        {/* Micro feature pills */}
        <div className="mt-4 pt-3 border-t-2 border-black/20 flex flex-wrap gap-1.5 text-[10px] font-['Space_Grotesk'] font-black uppercase">
          <span className="px-2 py-0.5 bg-white border border-black rounded shadow-[1px_1px_0px_#000]">
            ⚡ 30s SPEED WRITING
          </span>
          <span className="px-2 py-0.5 bg-[#00F0FF] border border-black rounded shadow-[1px_1px_0px_#000]">
            🔊 808 & BOOM-BAP
          </span>
          <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded shadow-[1px_1px_0px_#000]">
            📱 PHONE QR JOIN
          </span>
        </div>
      </div>

      {/* Mode Switcher Tabs (Create Cypher vs Join) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="tab-create-room"
          type="button"
          onClick={() => setMode('create')}
          className={`py-3 px-3 rounded-xl border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mode === 'create'
              ? 'bg-[#00F0FF] text-black shadow-neo -translate-y-0.5'
              : 'bg-white text-black hover:bg-neutral-100 shadow-neo-sm active:translate-y-0.5 active:shadow-none'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREATE ROOM</span>
        </button>

        <button
          id="tab-join-room"
          type="button"
          onClick={() => setMode('join')}
          className={`py-3 px-3 rounded-xl border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mode === 'join'
              ? 'bg-[#FF5470] text-white shadow-neo -translate-y-0.5'
              : 'bg-white text-black hover:bg-neutral-100 shadow-neo-sm active:translate-y-0.5 active:shadow-none'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>JOIN ROOM</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FF5470] text-white border-2 border-black shadow-neo-sm font-['Space_Grotesk'] font-bold text-xs text-center uppercase tracking-wide">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border-3 border-black rounded-2xl p-5 space-y-4 shadow-neo">
        {/* Join Code Input (if mode is join) */}
        {mode === 'join' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-['Space_Grotesk'] font-black text-black uppercase tracking-wider">
                ENTER ROOM CODE:
              </label>
              <button
                type="button"
                onClick={onOpenScanner}
                className="text-[11px] font-['Space_Grotesk'] font-black text-[#FF5470] hover:underline flex items-center gap-1 uppercase"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>SCAN QR CAMERA</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="input-room-code"
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="E.G. BOHO-89"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDF0] border-2 border-black font-['Space_Grotesk'] font-black text-lg text-black uppercase tracking-widest placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFE600]/20 shadow-neo-sm transition"
              />
            </div>
          </div>
        )}

        {/* MC Rap Name Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-['Space_Grotesk'] font-black text-black uppercase tracking-wider">
              YOUR MC HANDLE:
            </label>
            <button
              type="button"
              onClick={handleRandomizeName}
              className="px-2 py-0.5 rounded bg-[#FFF9D2] border border-black text-[10px] font-['Space_Grotesk'] font-bold text-black hover:bg-[#FFE600] flex items-center gap-1 transition shadow-[1px_1px_0px_#000]"
            >
              <Dice5 className="w-3 h-3 stroke-[2.5]" />
              <span>RANDOM</span>
            </button>
          </div>

          <input
            id="input-player-name"
            type="text"
            required
            maxLength={22}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ENTER MC NAME"
            className="w-full px-4 py-3 rounded-xl bg-[#FFFDF0] border-2 border-black font-['Space_Grotesk'] font-bold text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFE600]/20 shadow-neo-sm transition"
          />
        </div>

        {/* Neo-Brutalist Avatar Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-['Space_Grotesk'] font-black text-black uppercase tracking-wider">
            CHOOSE YOUR CYPHER BADGE:
          </label>
          <AvatarPicker selected={avatar} onSelect={setAvatar} />
        </div>

        {/* Big Action Submit Button */}
        <button
          id="btn-submit-welcome"
          type="submit"
          className="w-full py-4 rounded-xl bg-[#FFE600] text-black border-3 border-black font-['Syne'] font-extrabold text-sm uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {mode === 'create' ? (
            <>
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>CREATE CYPHER ROOM</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>ENTER CYPHER ROOM</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
