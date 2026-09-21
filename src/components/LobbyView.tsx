/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoomState, Player, BeatStyle } from '../types.js';
import { getAvatarIcon, getAvatarColor } from './AvatarPicker.js';
import { QrCode, Play, Users, Bot, Sparkles, Volume2, Clock, Crown, Music2, Trash2, Zap } from 'lucide-react';
import { rapAudio } from '../audio/rapBeatEngine.js';

interface LobbyViewProps {
  room: RoomState;
  myPlayerId: string;
  onStartGame: (countdownDuration: number, beatStyle: BeatStyle) => void;
  onSimulateBot: () => void;
  onKickBot: (botId: string) => void;
  onChangeBeat: (beatStyle: BeatStyle) => void;
  onOpenQR: () => void;
}

const BEAT_OPTIONS: { id: BeatStyle; name: string; desc: string; bpm: number; padColor: string }[] = [
  { id: 'boho-boombap', name: 'BOOM-BAP', desc: 'Raw MPC vinyl & crunchy soul drums', bpm: 90, padColor: 'bg-[#FFE600]' },
  { id: 'desert-trap', name: '808 TRAP', desc: 'Sliding sub-bass & rolling hi-hats', bpm: 136, padColor: 'bg-[#FF5470]' },
  { id: 'vinyl-golden', name: 'GOLDEN ERA 90s', desc: 'Heavy kick, snare snap & horn stabs', bpm: 92, padColor: 'bg-[#00F0FF]' },
  { id: 'chillhop', name: 'LO-FI CYPHER', desc: 'Warm Rhodes keys & dusty tape loop', bpm: 84, padColor: 'bg-[#00E599]' },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  myPlayerId,
  onStartGame,
  onSimulateBot,
  onKickBot,
  onChangeBeat,
  onOpenQR,
}) => {
  const [countdownDuration, setCountdownDuration] = useState<number>(room.countdownDuration || 5);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const me = room.players[myPlayerId];
  const isHost = me?.isHost || room.hostId === myPlayerId;
  const playerList = Object.values(room.players);

  const toggleBeatPreview = () => {
    if (isPlayingPreview) {
      rapAudio.stopBeat();
      setIsPlayingPreview(false);
    } else {
      rapAudio.startBeat(room.selectedBeat);
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Neo-Brutalist Cypher Room Header Card */}
      <div className="relative bg-[#FFE600] border-3 border-black p-5 shadow-neo-lg rounded-2xl text-black">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[#FFE600] border-2 border-black font-['Space_Grotesk'] font-black text-[11px] uppercase tracking-wider rounded-lg shadow-neo-sm rotate-[-1deg]">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>ROUND {room.currentRound} OF {room.totalRounds}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-black border-2 border-black font-['Space_Grotesk'] font-black text-[10px] uppercase rounded-lg shadow-neo-sm">
            <Users className="w-3 h-3" />
            <span>{playerList.length} CONNECTED</span>
          </div>
        </div>

        <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-black uppercase tracking-tight">
          CYPHER ROOM LOBBY
        </h2>
        <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wide text-black/80 mt-0.5">
          Scan QR code or enter code on mobile phones to join the battle!
        </p>

        {/* Room Code & Barcode / QR Button */}
        <div className="mt-4 flex items-center gap-2.5">
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-black shadow-neo-sm flex items-center justify-between">
            <span className="text-[10px] font-['Space_Grotesk'] font-black uppercase text-neutral-500">
              ROOM CODE
            </span>
            <span className="font-['Space_Grotesk'] font-black text-2xl text-black tracking-widest">
              {room.code}
            </span>
          </div>

          <button
            id="btn-lobby-qr"
            onClick={onOpenQR}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-[#FFE600] hover:bg-neutral-900 border-2 border-black shadow-neo-sm font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider transition-all active:translate-y-0.5 active:shadow-none"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>SHOW QR</span>
          </button>
        </div>
      </div>

      {/* MPC Beat Sound Pad Selector */}
      <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-neo">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF5470] text-white border-2 border-black shadow-[1px_1px_0px_#000]">
              <Music2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
              MPC DRUM PADS & STUDIO BEATS
            </h3>
          </div>

          <button
            id="btn-preview-beat"
            onClick={toggleBeatPreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-black uppercase tracking-wider border-2 border-black transition-all ${
              isPlayingPreview
                ? 'bg-[#00E599] text-black shadow-neo-sm animate-pulse'
                : 'bg-[#FFF9D2] text-black shadow-neo-sm hover:bg-[#FFE600] active:translate-y-0.5 active:shadow-none'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isPlayingPreview ? 'STOP BEAT' : 'PREVIEW BEAT'}</span>
          </button>
        </div>

        {/* 4 MPC Style Sound Pads */}
        <div className="grid grid-cols-2 gap-2.5">
          {BEAT_OPTIONS.map((beat) => {
            const isSelected = room.selectedBeat === beat.id;
            return (
              <button
                key={beat.id}
                id={`btn-beat-${beat.id}`}
                disabled={!isHost}
                onClick={() => {
                  onChangeBeat(beat.id);
                  if (isPlayingPreview) {
                    rapAudio.stopBeat();
                    rapAudio.startBeat(beat.id);
                  }
                }}
                className={`p-3 rounded-xl text-left border-2 border-black transition-all relative ${
                  isSelected
                    ? `${beat.padColor} text-black shadow-neo -translate-y-0.5 ring-2 ring-black`
                    : 'bg-[#FFFDF0] hover:bg-neutral-50 text-black shadow-neo-sm active:translate-y-0.5 active:shadow-none'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-['Space_Grotesk'] font-black text-xs tracking-wider">
                    {beat.name}
                  </div>
                  <span className="text-[10px] font-['Space_Mono'] font-bold px-1.5 py-0.5 rounded bg-black text-white border border-black">
                    {beat.bpm} BPM
                  </span>
                </div>
                <div className="text-[11px] font-['Space_Grotesk'] font-medium text-black/75 line-clamp-1">
                  {beat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connected Rappers Card */}
      <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-neo">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00F0FF] text-black border-2 border-black shadow-[1px_1px_0px_#000]">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
              CONNECTED MCs ({playerList.length})
            </h3>
          </div>

          {/* Quick Bot Simulator for Solo Testing */}
          {isHost && (
            <button
              id="btn-add-bot"
              onClick={onSimulateBot}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00E599] text-black border-2 border-black font-['Space_Grotesk'] font-black text-[11px] uppercase tracking-wider shadow-neo-sm hover:bg-[#34D399] transition active:translate-y-0.5 active:shadow-none"
              title="Add a simulated player for instant testing"
            >
              <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ ADD BOT MC</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {playerList.map((player) => {
            const Icon = getAvatarIcon(player.avatar);
            const colorClass = getAvatarColor(player.avatar);
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                className={`relative flex items-center gap-2 p-2 rounded-xl border-2 border-black transition ${
                  isMe
                    ? 'bg-[#FFE600]/30 shadow-neo-sm'
                    : 'bg-[#FFFDF0] shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className={`p-1.5 rounded-lg border-2 border-black ${colorClass} shrink-0 shadow-[1px_1px_0px_#000]`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-['Space_Grotesk'] font-black text-xs text-black truncate">
                      {player.name}
                    </span>
                    {player.isHost && <Crown className="w-3.5 h-3.5 text-[#F59E0B] fill-current shrink-0" />}
                  </div>
                  <div className="text-[10px] font-['Space_Grotesk'] font-bold text-neutral-500 uppercase flex items-center gap-1">
                    {player.isBot ? (
                      <span className="text-[#059669]">BOT MC</span>
                    ) : isMe ? (
                      <span className="text-[#FF5470]">YOU</span>
                    ) : (
                      'READY'
                    )}
                  </div>
                </div>

                {/* Host kick bot button */}
                {isHost && player.isBot && (
                  <button
                    onClick={() => onKickBot(player.id)}
                    className="p-1 text-black hover:text-[#FF5470] transition"
                    title="Remove Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Match Settings & Big Drop Beat Button */}
      {isHost ? (
        <div className="bg-[#FFFDF0] border-3 border-black rounded-2xl p-5 space-y-4 shadow-neo">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 stroke-[2.5] text-black" />
              <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
                VERSE DROP COUNTDOWN:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-duration-5"
                onClick={() => setCountdownDuration(5)}
                className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-black uppercase tracking-wider border-2 border-black transition-all ${
                  countdownDuration === 5
                    ? 'bg-[#FFE600] text-black shadow-neo-sm -translate-y-0.5'
                    : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                }`}
              >
                5 SECONDS
              </button>

              <button
                id="btn-duration-10"
                onClick={() => setCountdownDuration(10)}
                className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-black uppercase tracking-wider border-2 border-black transition-all ${
                  countdownDuration === 10
                    ? 'bg-[#FFE600] text-black shadow-neo-sm -translate-y-0.5'
                    : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                }`}
              >
                10 SECONDS
              </button>
            </div>
          </div>

          <button
            id="btn-start-game"
            onClick={() => {
              if (isPlayingPreview) {
                rapAudio.stopBeat();
                setIsPlayingPreview(false);
              }
              onStartGame(countdownDuration, room.selectedBeat);
            }}
            className="w-full py-4 rounded-xl bg-[#FF5470] text-white border-3 border-black font-['Syne'] font-extrabold text-base uppercase tracking-wider shadow-neo-lg hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>DROP THE BEAT & START CYPHER</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border-3 border-black rounded-2xl p-5 text-center shadow-neo">
          <div className="w-9 h-9 rounded-xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-neo-sm animate-bounce">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="font-['Syne'] font-extrabold text-sm text-black uppercase">
            WAITING FOR HOST TO DROP THE BEAT...
          </div>
          <p className="font-['Space_Grotesk'] font-bold text-xs text-neutral-600 mt-1 uppercase">
            Stay on this screen! Verses will drop instantly across all phones.
          </p>
        </div>
      )}
    </div>
  );
};
