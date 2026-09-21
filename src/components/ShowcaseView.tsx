/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { PlayerSubmission, BeatStyle, Player } from '../types.js';
import { getAvatarIcon, getAvatarColor } from './AvatarPicker.js';
import { rapAudio } from '../audio/rapBeatEngine.js';
import { Volume2, VolumeX, Mic2, Disc3, RotateCcw, Sparkles, Music, Radio } from 'lucide-react';

interface ShowcaseViewProps {
  submissions: Record<string, PlayerSubmission>;
  currentShowcaseIndex: number;
  timeRemaining: number;
  selectedBeat: BeatStyle;
  players: Record<string, Player>;
  myPlayerId: string;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({
  submissions,
  currentShowcaseIndex,
  timeRemaining,
  selectedBeat,
  players,
  myPlayerId,
}) => {
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);
  const [isBeatMuted, setIsBeatMuted] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  const submissionList = Object.values(submissions);
  const currentSubmission = submissionList[currentShowcaseIndex] || submissionList[0];
  const nextSubmission = submissionList[currentShowcaseIndex + 1];

  const lastIndexRef = useRef<number>(-1);

  // When showcase index changes or component mounts, trigger beat & verse recitation
  useEffect(() => {
    // Ensure beat is running
    rapAudio.startBeat(selectedBeat);

    if (currentSubmission && lastIndexRef.current !== currentShowcaseIndex) {
      lastIndexRef.current = currentShowcaseIndex;
      setActiveLineIdx(0);

      if (speechEnabled) {
        // Small delay so the beat sets the groove first
        const timeout = setTimeout(() => {
          rapAudio.reciteVerse(currentSubmission.renderedLines, (idx) => {
            setActiveLineIdx(idx);
          });
        }, 600);

        return () => {
          clearTimeout(timeout);
          rapAudio.stopRecitation();
        };
      }
    }
  }, [currentShowcaseIndex, currentSubmission, selectedBeat, speechEnabled]);

  const handleReplayVerse = () => {
    if (currentSubmission) {
      rapAudio.stopRecitation();
      setActiveLineIdx(0);
      rapAudio.reciteVerse(currentSubmission.renderedLines, (idx) => {
        setActiveLineIdx(idx);
      });
    }
  };

  if (!currentSubmission) {
    return (
      <div className="text-center py-12 font-['Space_Grotesk'] font-bold text-black uppercase">
        PREPARING VERSES...
      </div>
    );
  }

  const Icon = getAvatarIcon(currentSubmission.playerAvatar);
  const colorClass = getAvatarColor(currentSubmission.playerAvatar);
  const isMyVerse = currentSubmission.playerId === myPlayerId;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Studio Header & Beat Controls */}
      <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-neo flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Disc3 className="w-7 h-7 text-black animate-spin [animation-duration:3s]" />
          </div>
          <div>
            <div className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>CYPHER STAGE • VERSE {currentShowcaseIndex + 1} OF {submissionList.length}</span>
            </div>
            <div className="text-[10px] font-['Space_Grotesk'] font-bold text-neutral-500 uppercase flex items-center gap-1">
              <Music className="w-3 h-3 text-[#FF5470]" />
              <span>{selectedBeat.replace('-', ' ')} BEAT</span>
            </div>
          </div>
        </div>

        {/* Audio Volume & Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = rapAudio.toggleMute();
              setIsBeatMuted(muted);
            }}
            className={`p-2 rounded-xl border-2 border-black shadow-[1px_1px_0px_#000] transition active:translate-y-0.5 active:shadow-none ${
              isBeatMuted
                ? 'bg-[#FF5470] text-white'
                : 'bg-[#FFFDF0] text-black hover:bg-[#FFE600]'
            }`}
            title={isBeatMuted ? 'Unmute Beat' : 'Mute Beat'}
          >
            {isBeatMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
          </button>

          <button
            onClick={() => {
              const nextVal = !speechEnabled;
              setSpeechEnabled(nextVal);
              if (!nextVal) rapAudio.stopRecitation();
              else handleReplayVerse();
            }}
            className={`px-3 py-2 rounded-xl border-2 border-black text-xs font-['Space_Grotesk'] font-black uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#000] transition active:translate-y-0.5 active:shadow-none ${
              speechEnabled
                ? 'bg-[#00E599] text-black'
                : 'bg-white text-black'
            }`}
            title="Toggle Computer Rap Recital"
          >
            <Mic2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{speechEnabled ? 'VOICE ON' : 'LIVE RAP'}</span>
          </button>

          <button
            onClick={handleReplayVerse}
            className="p-2 rounded-xl bg-[#FFFDF0] hover:bg-[#FFE600] border-2 border-black text-black shadow-[1px_1px_0px_#000] transition active:translate-y-0.5 active:shadow-none"
            title="Replay Current Verse"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Performer Stage Spotlight */}
      <div className="bg-[#FFE600] border-3 border-black rounded-2xl p-6 shadow-neo-lg text-center overflow-hidden">
        {/* Performer Avatar & Handle */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-2">
            <div className={`p-4 rounded-2xl ${colorClass} border-3 border-black shadow-neo-sm`}>
              <Icon className="w-10 h-10 stroke-[2.5]" />
            </div>
            {isMyVerse && (
              <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded bg-black text-[#FFE600] font-['Space_Grotesk'] font-black text-[10px] uppercase tracking-wider border-2 border-black shadow-[1px_1px_0px_#000]">
                YOU
              </span>
            )}
          </div>

          <h3 className="font-['Syne'] font-extrabold text-2xl text-black uppercase tracking-tight">
            {currentSubmission.playerName}
          </h3>
          <span className="text-[11px] font-['Space_Grotesk'] font-black uppercase text-black/75 tracking-wider">
            SPITTING BARS IN THE CYPHER
          </span>
        </div>

        {/* Rhythmic Teleprompter Lyric Display */}
        <div className="space-y-2.5 max-w-lg mx-auto mb-6">
          {currentSubmission.renderedLines.map((line, idx) => {
            const isSpoken = idx === activeLineIdx;
            const isPast = idx < activeLineIdx;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border-2 border-black transition-all duration-200 ${
                  isSpoken
                    ? 'bg-black text-[#FFE600] shadow-neo scale-[1.02]'
                    : isPast
                    ? 'bg-white/80 text-black/60 shadow-[1px_1px_0px_#000]'
                    : 'bg-white text-black shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isSpoken && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping shrink-0" />
                  )}
                  <p className="font-['Space_Grotesk'] font-bold text-base sm:text-lg leading-snug">
                    "{line}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Verse / Remaining Timer */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-black/20 text-xs font-['Space_Grotesk'] font-black uppercase text-black">
          <span className="bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
            NEXT VERSE IN {timeRemaining}S
          </span>
          {nextSubmission ? (
            <span className="bg-[#00F0FF] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              UP NEXT: <strong>{nextSubmission.playerName}</strong>
            </span>
          ) : (
            <span className="bg-[#00E599] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              FINAL VERSE • VOTING NEXT!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
