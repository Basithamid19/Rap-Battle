/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Mic2, Disc3, Radio, Zap, Crown, Sparkles, Skull } from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'mic', label: 'MC MIC', icon: Mic2, bg: 'bg-[#FFE600]', text: 'text-black' },
  { id: 'flame', label: 'FIRE BAR', icon: Flame, bg: 'bg-[#FF5470]', text: 'text-white' },
  { id: 'vinyl', label: 'VINYL', icon: Disc3, bg: 'bg-[#00F0FF]', text: 'text-black' },
  { id: 'boombox', label: 'BOOMBOX', icon: Radio, bg: 'bg-[#00E599]', text: 'text-black' },
  { id: 'zap', label: 'VOLTAGE', icon: Zap, bg: 'bg-[#FFDE59]', text: 'text-black' },
  { id: 'crown', label: 'KINGPIN', icon: Crown, bg: 'bg-[#FF9F1C]', text: 'text-black' },
  { id: 'skull', label: 'CYPHER', icon: Skull, bg: 'bg-[#E2E8F0]', text: 'text-black' },
  { id: 'spark', label: 'MYSTIC', icon: Sparkles, bg: 'bg-[#C084FC]', text: 'text-black' },
];

export const getAvatarIcon = (avatarId: string) => {
  const match = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return match ? match.icon : Mic2;
};

export const getAvatarColor = (avatarId: string) => {
  const match = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return match ? `${match.bg} ${match.text}` : 'bg-[#FFE600] text-black';
};

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {AVATAR_OPTIONS.map((item) => {
        const IconComponent = item.icon;
        const isChosen = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 border-black transition-all ${
              isChosen
                ? 'bg-[#FFE600] shadow-[3px_3px_0px_#000] -translate-y-0.5'
                : 'bg-white hover:bg-[#FFF9D2] shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none'
            }`}
          >
            <div className={`p-2 rounded-lg border-2 border-black ${item.bg} ${item.text} shadow-[1px_1px_0px_#000]`}>
              <IconComponent className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="mt-1 text-[10px] font-black font-['Space_Grotesk'] uppercase tracking-wider text-black">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
