/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VerseTemplate, Player } from '../types.js';
import { Clock, Send, Sparkles, CheckCircle2, Volume2, VolumeX, Lightbulb, Zap } from 'lucide-react';
import { rapAudio } from '../audio/rapBeatEngine.js';

interface WritingViewProps {
  verseTemplate: VerseTemplate;
  timeRemaining: number;
  totalTime?: number;
  hasSubmitted: boolean;
  players: Record<string, Player>;
  onSubmit: (answers: Record<string, string>) => void;
}

export const WritingView: React.FC<WritingViewProps> = ({
  verseTemplate,
  timeRemaining,
  totalTime = 30,
  hasSubmitted,
  players,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const b of verseTemplate.blanks) {
      initial[b.id] = '';
    }
    return initial;
  });

  const [isMuted, setIsMuted] = useState(false);

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (timeRemaining <= 0 && !hasSubmitted) {
      onSubmit(answers);
    }
  }, [timeRemaining, hasSubmitted, answers, onSubmit]);

  const handleInputChange = (blankId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: val }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasSubmitted) {
      onSubmit(answers);
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isUrgent = timeRemaining <= 7;

  // Submissions count
  const playerList = Object.values(players);
  const submittedCount = playerList.filter(p => p.hasSubmitted).length;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Top 30-Second Countdown & Progress Banner */}
      <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-neo">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border-2 border-black ${isUrgent ? 'bg-[#FF5470] text-white animate-bounce' : 'bg-[#FFE600] text-black'} shadow-[1px_1px_0px_#000]`}>
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
              WRITING COUNTDOWN
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Beat Mute/Unmute */}
            <button
              onClick={() => {
                const muted = rapAudio.toggleMute();
                setIsMuted(muted);
              }}
              className="p-1.5 rounded-lg bg-[#FFFDF0] hover:bg-[#FFE600] text-black border-2 border-black shadow-[1px_1px_0px_#000] transition active:translate-y-0.5 active:shadow-none"
              title={isMuted ? 'Unmute Beat' : 'Mute Beat'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 stroke-[2.5] text-[#FF5470]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* Time Badge */}
            <div className={`px-3 py-1 rounded-lg border-2 border-black font-['Space_Grotesk'] font-black text-sm uppercase shadow-neo-sm transition-all ${
              isUrgent ? 'bg-[#FF5470] text-white animate-pulse' : 'bg-[#FFE600] text-black'
            }`}>
              {timeRemaining}S LEFT
            </div>
          </div>
        </div>

        {/* High-Contrast Chunky Progress Bar */}
        <div className="w-full h-3 bg-[#FFFDF0] border-2 border-black rounded-lg overflow-hidden p-0.5 shadow-inner">
          <div
            className={`h-full rounded-sm border-r-2 border-black transition-all duration-1000 ${
              isUrgent ? 'bg-[#FF5470]' : 'bg-[#FFE600]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] font-['Space_Grotesk'] font-black uppercase text-neutral-600">
          <span>RHYME ON BEAT • SPEED CYPHER</span>
          <span className="text-black bg-[#00E599] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
            {submittedCount} / {playerList.length} LOCKED IN
          </span>
        </div>
      </div>

      {/* Main Verse Lyric Sheet Card */}
      <div className="bg-[#FFFDF0] border-3 border-black rounded-2xl p-5 shadow-neo-lg space-y-4">
        {/* Style Tag Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00F0FF] text-black border-2 border-black font-['Space_Grotesk'] font-black text-[10px] tracking-wider uppercase shadow-neo-sm">
            <Zap className="w-3 h-3 fill-current" />
            <span>{verseTemplate.subgenre} • {verseTemplate.bpm} BPM</span>
          </div>

          <span className="font-['Space_Grotesk'] font-black text-xs uppercase text-neutral-600">
            {verseTemplate.title}
          </span>
        </div>

        {/* Live Formatted Verse Preview with Highlighters */}
        <div className="space-y-2.5 font-['Space_Grotesk'] font-bold text-base sm:text-lg text-black leading-relaxed p-4 rounded-xl bg-white border-2 border-black shadow-neo-sm">
          {verseTemplate.lines.map((line, idx) => {
            const parts = line.split(/(\{blank\d+\})/g);
            return (
              <div key={idx} className="flex flex-wrap items-baseline gap-1.5 py-0.5">
                <span className="font-['Space_Mono'] text-xs text-[#FF5470] font-bold mr-1 select-none">
                  0{idx + 1}.
                </span>
                {parts.map((part, pIdx) => {
                  const match = part.match(/\{blank(\d+)\}/);
                  if (match) {
                    const blankId = `blank${match[1]}`;
                    const currentVal = answers[blankId];
                    return (
                      <span
                        key={pIdx}
                        className={`inline-block px-2 py-0.5 rounded border-2 border-black font-['Space_Grotesk'] font-black uppercase text-xs sm:text-sm tracking-wide transition ${
                          currentVal?.trim()
                            ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_#000]'
                            : 'bg-[#FFE600] text-black border-dashed shadow-[1px_1px_0px_#000]'
                        }`}
                      >
                        {currentVal?.trim() ? currentVal : `[BLANK ${match[1]}]`}
                      </span>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </div>
            );
          })}
        </div>

        {/* Interactive Blank Fields */}
        {!hasSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider text-black">
              FILL YOUR PUNCHLINES BELOW:
            </div>

            {verseTemplate.blanks.map((blank, index) => (
              <div key={blank.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-['Space_Grotesk'] font-black text-black uppercase flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-black text-[#FFE600] border border-black text-[10px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{blank.label}</span>
                  </label>
                  {blank.rhymeWith && (
                    <span className="text-[10px] font-['Space_Mono'] text-black bg-[#FFE600] px-2 py-0.5 rounded border border-black font-bold">
                      {blank.rhymeWith}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={30}
                    value={answers[blank.id] || ''}
                    onChange={(e) => handleInputChange(blank.id, e.target.value)}
                    placeholder={blank.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-black text-sm font-['Space_Grotesk'] font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFE600]/20 shadow-neo-sm transition"
                  />
                  {blank.hint && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-['Space_Grotesk'] font-bold text-neutral-600 uppercase">
                      <Lightbulb className="w-3 h-3 text-[#FF5470] stroke-[2.5]" />
                      <span>{blank.hint}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Lock In Button */}
            <button
              id="btn-lock-in-verse"
              type="submit"
              className="mt-4 w-full py-4 rounded-xl bg-[#00E599] text-black border-3 border-black font-['Syne'] font-extrabold text-sm uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>LOCK IN MY BARS</span>
            </button>
          </form>
        ) : (
          <div className="p-5 rounded-xl bg-[#00E599] border-3 border-black text-center space-y-2 shadow-neo animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-black mx-auto stroke-[2.5]" />
            <h4 className="font-['Syne'] font-extrabold text-base text-black uppercase">
              YOUR VERSE IS LOCKED IN!
            </h4>
            <p className="font-['Space_Grotesk'] font-bold text-xs text-black/85 max-w-sm mx-auto uppercase">
              Waiting for the timer to drop. Verses will showcase one by one over the beat!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
