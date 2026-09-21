/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerSubmission, Player } from '../types.js';
import { getAvatarIcon, getAvatarColor } from './AvatarPicker.js';
import { Award, Check, Clock, ThumbsUp, Flame, Zap } from 'lucide-react';

interface VotingViewProps {
  submissions: Record<string, PlayerSubmission>;
  votes: Record<string, string>;
  timeRemaining: number;
  myPlayerId: string;
  players: Record<string, Player>;
  onCastVote: (targetPlayerId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  submissions,
  votes,
  timeRemaining,
  myPlayerId,
  players,
  onCastVote,
}) => {
  const submissionList = Object.values(submissions);
  const myVote = votes[myPlayerId];
  const humanPlayers = Object.values(players).filter(p => !p.isBot);
  const votedCount = humanPlayers.filter(p => votes[p.id]).length;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Voting Header Banner */}
      <div className="bg-[#00F0FF] border-3 border-black rounded-2xl p-5 shadow-neo-lg text-center text-black">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black text-[#FFE600] border-2 border-black font-['Space_Grotesk'] font-black text-[11px] uppercase tracking-wider mb-2 shadow-neo-sm rotate-[-1deg]">
          <Award className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>CYPHER JUDGEMENT ROUND</span>
        </div>

        <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-black uppercase tracking-tight">
          CROWN THE BEST VERSE!
        </h2>
        <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wide text-black/80 max-w-md mx-auto mb-3">
          Vote for the coldest rhyme or funniest punchline. You cannot vote for yourself!
        </p>

        <div className="flex items-center justify-center gap-3 text-xs font-['Space_Grotesk'] font-black uppercase">
          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF5470] text-white border-2 border-black shadow-neo-sm">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{timeRemaining}S LEFT</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-black border-2 border-black shadow-neo-sm">
            <Zap className="w-3.5 h-3.5 fill-current text-[#FFE600]" />
            <span>{votedCount} OF {humanPlayers.length} VOTED</span>
          </div>
        </div>
      </div>

      {/* Verses Grid for Voting */}
      <div className="space-y-3.5">
        {submissionList.map((sub) => {
          const isMe = sub.playerId === myPlayerId;
          const isVotedByMe = myVote === sub.playerId;
          const Icon = getAvatarIcon(sub.playerAvatar);
          const colorClass = getAvatarColor(sub.playerAvatar);

          return (
            <div
              key={sub.playerId}
              className={`rounded-2xl p-5 border-3 border-black transition-all ${
                isVotedByMe
                  ? 'bg-[#FFE600] shadow-neo -translate-y-0.5 ring-2 ring-black'
                  : 'bg-white shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'
              }`}
            >
              {/* Header with Player info & Action */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border-2 border-black ${colorClass} shadow-[1px_1px_0px_#000]`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] font-black text-sm uppercase text-black">
                      {sub.playerName}
                    </h4>
                    {isMe && (
                      <span className="text-[10px] font-['Space_Grotesk'] font-black text-[#FF5470] uppercase">
                        (YOUR SUBMISSION)
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Button */}
                {isMe ? (
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-neutral-400 uppercase">
                    YOUR VERSE
                  </span>
                ) : (
                  <button
                    id={`btn-vote-${sub.playerId}`}
                    onClick={() => onCastVote(sub.playerId)}
                    className={`px-4 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-black uppercase tracking-wider border-2 border-black transition-all flex items-center gap-1.5 ${
                      isVotedByMe
                        ? 'bg-black text-[#FFE600] shadow-neo-sm'
                        : 'bg-[#FF5470] text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none'
                    }`}
                  >
                    {isVotedByMe ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>VOTED!</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 stroke-[2.5] fill-current" />
                        <span>VOTE THIS</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Rendered Verse Bars */}
              <div className="space-y-1.5 bg-[#FFFDF0] p-3.5 rounded-xl border-2 border-black text-xs sm:text-sm font-['Space_Grotesk'] font-bold text-black shadow-inner">
                {sub.renderedLines.map((line, lIdx) => (
                  <p key={lIdx} className="leading-snug">
                    "{line}"
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
