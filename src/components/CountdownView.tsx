/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Radio, Zap } from 'lucide-react';
import { rapAudio } from '../audio/rapBeatEngine.js';
import { BeatStyle } from '../types.js';

interface CountdownViewProps {
  timeRemaining: number;
  beatStyle: BeatStyle;
}

export const CountdownView: React.FC<CountdownViewProps> = ({ timeRemaining, beatStyle }) => {
  useEffect(() => {
    // Start the beat subtly right in countdown so everyone gets in the groove
    rapAudio.startBeat(beatStyle);
  }, [beatStyle]);

  return (
    <div className="w-full max-w-md mx-auto text-center py-6 px-4 flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-95 duration-200">
      {/* Big Brutalist Countdown Block */}
      <div className="relative mb-6">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-[#FFE600] border-4 border-black shadow-neo-xl flex flex-col items-center justify-center relative rotate-[-1deg]">
          {/* Brutalist Corner Badge */}
          <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-[#FF5470] text-white border-2 border-black rounded font-['Space_Grotesk'] font-black text-[10px] uppercase shadow-neo-sm rotate-[4deg]">
            BEAT DROPPING
          </div>

          <span className="font-['Syne'] font-black text-7xl sm:text-8xl text-black leading-none transition-all duration-200">
            {timeRemaining}
          </span>
          <span className="font-['Space_Grotesk'] font-black text-xs text-black uppercase tracking-widest mt-1">
            SECONDS
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black text-[#FFE600] border-2 border-black font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider mb-2 shadow-neo-sm">
        <Radio className="w-4 h-4 text-[#00F0FF] animate-pulse" />
        <span>SYNCING PHONES & DROPPING BEAT</span>
      </div>

      <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-black uppercase tracking-tight">
        GET READY TO SPIT FIRE!
      </h2>
      <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wide text-neutral-600 max-w-xs mt-1">
        The verse template is dropping in a moment. You will have 30 seconds to fill in the rhyme blanks!
      </p>

      {/* Neo-Brutalist graphic rhythm bars */}
      <div className="flex items-center gap-2 mt-6 p-3 bg-white border-2 border-black rounded-xl shadow-neo-sm">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={`w-3 border-2 border-black rounded-sm transition-all duration-200 animate-pulse ${
              i % 4 === 0
                ? 'bg-[#FFE600]'
                : i % 4 === 1
                ? 'bg-[#FF5470]'
                : i % 4 === 2
                ? 'bg-[#00F0FF]'
                : 'bg-[#00E599]'
            }`}
            style={{
              height: `${16 + (i % 5) * 8}px`,
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
