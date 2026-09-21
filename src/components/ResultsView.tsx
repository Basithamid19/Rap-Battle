/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoomState } from '../types.js';
import { getAvatarIcon, getAvatarColor } from './AvatarPicker.js';
import { Crown, Trophy, Sparkles, Volume2, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { rapAudio } from '../audio/rapBeatEngine.js';

interface ResultsViewProps {
  room: RoomState;
  myPlayerId: string;
  onNextRound: () => void;
  onResetRoom: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  room,
  myPlayerId,
  onNextRound,
  onResetRoom,
}) => {
  const [isPlayingWinnerTrack, setIsPlayingWinnerTrack] = useState(false);

  const me = room.players[myPlayerId];
  const isHost = me?.isHost || room.hostId === myPlayerId;

  // Rank players by score
  const rankedPlayers = Object.values(room.players).sort((a, b) => b.score - a.score);
  const winnerPlayer = room.winnerPlayerId ? room.players[room.winnerPlayerId] : rankedPlayers[0];
  const winnerSubmission = room.winnerPlayerId ? room.submissions[room.winnerPlayerId] : null;

  const playWinningTrack = () => {
    if (!winnerSubmission) return;

    if (isPlayingWinnerTrack) {
      rapAudio.stopBeat();
      rapAudio.stopRecitation();
      setIsPlayingWinnerTrack(false);
    } else {
      setIsPlayingWinnerTrack(true);
      rapAudio.startBeat(room.selectedBeat);
      setTimeout(() => {
        rapAudio.reciteVerse(winnerSubmission.renderedLines);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in zoom-in-95 duration-200">
      {/* Neo-Brutalist Champion Banner */}
      <div className="bg-[#FFE600] border-4 border-black rounded-2xl p-6 shadow-neo-xl text-center text-black relative">
        <div className="flex flex-col items-center mb-3">
          {/* Crown & Avatar */}
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#FF5470] text-white border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-neo-sm rotate-[-2deg]">
              <Crown className="w-7 h-7 stroke-[2.5]" />
            </div>
            {winnerPlayer && (
              <div className={`p-4 rounded-2xl ${getAvatarColor(winnerPlayer.avatar)} border-3 border-black shadow-neo-sm mt-1`}>
                {React.createElement(getAvatarIcon(winnerPlayer.avatar), { className: 'w-10 h-10 stroke-[2.5]' })}
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black text-[#FFE600] border-2 border-black font-['Space_Grotesk'] font-black text-[11px] uppercase tracking-wider mb-2 shadow-neo-sm rotate-[1deg]">
            <Trophy className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>CYPHER CHAMPION</span>
          </div>

          <h2 className="font-['Syne'] font-extrabold text-3xl sm:text-4xl text-black uppercase tracking-tight">
            {winnerPlayer ? winnerPlayer.name : 'UNKNOWN MC'} WINS!
          </h2>
          <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wide text-black/85 mt-0.5">
            Crowned with the coldest punchlines and best rhythmic flow!
          </p>
        </div>

        {/* Winning Verse Showcase */}
        {winnerSubmission && (
          <div className="mt-4 p-4 rounded-xl bg-white border-3 border-black text-left space-y-2 shadow-neo-sm">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
                WINNING BAR PERFORMANCE
              </span>
              <button
                id="btn-play-winner-track"
                onClick={playWinningTrack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5470] text-white border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all shadow-[1px_1px_0px_#000]"
              >
                <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isPlayingWinnerTrack ? 'STOP REPLAY' : 'PLAY TRACK'}</span>
              </button>
            </div>

            <div className="space-y-1 font-['Space_Grotesk'] font-bold text-xs sm:text-sm text-black pt-1 bg-[#FFFDF0] p-3 rounded-lg border border-black">
              {winnerSubmission.renderedLines.map((line, idx) => (
                <p key={idx} className="leading-snug">"{line}"</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-neo">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 stroke-[2.5] text-black" />
            <h3 className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
              CYPHER LEADERBOARD
            </h3>
          </div>
          <span className="text-xs font-['Space_Grotesk'] font-bold text-neutral-500 uppercase">
            ROUND {room.currentRound} FINISHED
          </span>
        </div>

        <div className="space-y-2">
          {rankedPlayers.map((player, index) => {
            const Icon = getAvatarIcon(player.avatar);
            const isWinner = index === 0;
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl border-2 border-black transition ${
                  isWinner
                    ? 'bg-[#FFE600] shadow-neo-sm ring-1 ring-black'
                    : isMe
                    ? 'bg-[#00F0FF]/25 shadow-[2px_2px_0px_#000]'
                    : 'bg-[#FFFDF0] shadow-[1px_1px_0px_#000]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`font-['Space_Mono'] font-bold text-sm w-7 h-7 rounded border border-black flex items-center justify-center ${
                    isWinner ? 'bg-black text-[#FFE600]' : 'bg-white text-black'
                  }`}>
                    #{index + 1}
                  </span>
                  <div className={`p-1.5 rounded-lg border border-black ${getAvatarColor(player.avatar)} shadow-[1px_1px_0px_#000]`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="font-['Space_Grotesk'] font-black text-xs text-black uppercase flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {isMe && <span className="text-[10px] text-[#FF5470] font-black">(YOU)</span>}
                    </div>
                    <div className="text-[10px] font-['Space_Grotesk'] font-bold text-neutral-500 uppercase">
                      {player.isBot ? 'BOT MC' : 'LIVE PLAYER'}
                    </div>
                  </div>
                </div>

                <div className="font-['Space_Mono'] font-bold text-sm text-black bg-white px-2 py-1 rounded border border-black shadow-[1px_1px_0px_#000]">
                  {player.score} PTS
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Action Buttons */}
      {isHost ? (
        <div className="flex gap-2.5">
          <button
            id="btn-next-round"
            onClick={() => {
              if (isPlayingWinnerTrack) {
                rapAudio.stopBeat();
                rapAudio.stopRecitation();
              }
              onNextRound();
            }}
            className="flex-1 py-4 rounded-xl bg-[#00E599] text-black border-3 border-black font-['Syne'] font-extrabold text-sm uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>NEXT ROUND</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            id="btn-reset-cypher"
            onClick={onResetRoom}
            className="px-5 py-4 rounded-xl bg-white border-3 border-black text-black font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all shadow-neo active:translate-y-0.5 active:shadow-none flex items-center gap-1.5"
            title="Reset scores and start from Round 1"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>RESET</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border-3 border-black rounded-xl p-4 text-center text-xs font-['Space_Grotesk'] font-bold text-neutral-600 uppercase shadow-neo-sm">
          Waiting for room host to trigger the next round...
        </div>
      )}
    </div>
  );
};
