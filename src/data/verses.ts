/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerseTemplate } from '../types.js';

export const RAP_VERSES: VerseTemplate[] = [
  {
    id: 'verse-golden-cypher',
    title: 'Crown in the Cypher',
    subgenre: 'Golden Era 90s Boom-Bap',
    bpm: 90,
    lines: [
      'Mic check one-two, stepped out in my fresh {blank1}',
      'Spitting lyrical gold like a champion in the {blank2}',
      'They doubted the hustle but I turned up the {blank3}',
      'Now everybody nodding heads till the break of dawn!'
    ],
    blanks: [
      { id: 'blank1', label: 'Item / Attire', placeholder: 'velvet hoodie / leather jacket / clean Air Force', hint: 'Something you wear or hold' },
      { id: 'blank2', label: 'Place / Zone', placeholder: 'golden cypher / subway tunnel / canyon night', rhymeWith: 'rhymes with dawn / zone / light', hint: 'Where you shine' },
      { id: 'blank3', label: 'Power / Vibe', placeholder: 'bass line / drum heat / secret heat', hint: 'What you turned up' }
    ]
  },
  {
    id: 'verse-boho-spirit',
    title: 'Desert Wind Flow',
    subgenre: 'Bohemian Conscious Rap',
    bpm: 88,
    lines: [
      'Got desert dust on my kicks and {blank1} in my soul',
      'Every bar that I write puts the speakers in full {blank2}',
      'Rolling through the canyon with a pocket full of {blank3}',
      'Leave the copycats behind, real rhythm never gets old!'
    ],
    blanks: [
      { id: 'blank1', label: 'Sacred Element', placeholder: 'raw fire / ancient gold / desert sun', hint: 'Something inside you' },
      { id: 'blank2', label: 'State of Mind', placeholder: 'control / rock-and-roll / mystic glow', hint: 'Rhymes with soul / old' },
      { id: 'blank3', label: 'Valuable Thing', placeholder: 'turquoise stones / heavy dreams / diamond bars', hint: 'What you carry' }
    ]
  },
  {
    id: 'verse-heavy-trap',
    title: 'Thirty Second Trap',
    subgenre: 'Modern 808 Trap',
    bpm: 136,
    lines: [
      'Thirty seconds on the clock watch me drop that {blank1}',
      'Bass kicking through the floor got the whole squad {blank2}',
      'Cooked the beat in the laboratory pure {blank3}',
      'Now the trophy coming home and we taking off tonight!'
    ],
    blanks: [
      { id: 'blank1', label: 'Punchline / Substance', placeholder: 'heavy thunder / spicy verse / platinum cadence', hint: 'What you drop' },
      { id: 'blank2', label: 'Action / Reaction', placeholder: 'jumping crazy / wilding out / locked in rhythm', hint: 'What the squad is doing' },
      { id: 'blank3', label: 'Quality / Material', placeholder: 'golden fire / electric light / outer space energy', hint: 'How pure it is' }
    ]
  },
  {
    id: 'verse-west-coast',
    title: 'Cali Sunset Bounce',
    subgenre: 'West Coast Funk Rap',
    bpm: 94,
    lines: [
      'Top down on the boulevard smelling like {blank1}',
      'Hydraulics hitting high while the rhythm keeps {blank2}',
      'Pulled up to the cypher rocking shiny {blank3}',
      'West side Bohemian king, everybody salute!'
    ],
    blanks: [
      { id: 'blank1', label: 'Scent / Flavor', placeholder: 'cinnamon sage / burnt cocoa / victory juice', hint: 'What it smells like' },
      { id: 'blank2', label: 'Movement', placeholder: 'grooving smooth / rocking slow / bouncing clean', hint: 'How it moves' },
      { id: 'blank3', label: 'Flashy Item', placeholder: 'brass rings / tinted shades / vintage medallions', hint: 'What you are rocking' }
    ]
  },
  {
    id: 'verse-late-night-lofi',
    title: 'Midnight Rhodes Freestyle',
    subgenre: 'Lo-Fi Chillhop Cypher',
    bpm: 84,
    lines: [
      'Midnight on the porch with a cup of warm {blank1}',
      'Thinking bout the days when the struggle felt so {blank2}',
      'Turned my deepest thoughts into rhythmic {blank3}',
      'Now the melody is floating like feathers in the sky.'
    ],
    blanks: [
      { id: 'blank1', label: 'Drink / Potion', placeholder: 'jasmine tea / black brew / sweet nectar', hint: 'What you are sipping' },
      { id: 'blank2', label: 'Feeling / Adjective', placeholder: 'heavy / endless / stormy', hint: 'How it felt' },
      { id: 'blank3', label: 'Creation', placeholder: 'poetry / pure magic / soul anthems', hint: 'What you created' }
    ]
  },
  {
    id: 'verse-battle-punch',
    title: 'Heavyweight Punchlines',
    subgenre: 'Hardcore Underground Hip-Hop',
    bpm: 92,
    lines: [
      'Step into the arena with the power of a {blank1}',
      'Deliver these punchlines straight to your {blank2}',
      'Claimed the undisputed title with a dose of {blank3}',
      'Leave the microphone smoking when the round is done!'
    ],
    blanks: [
      { id: 'blank1', label: 'Beast / Force', placeholder: 'mountain lion / sonic boom / desert tornado', hint: 'What creature or force' },
      { id: 'blank2', label: 'Target', placeholder: 'speakers / heart / front row', hint: 'Where it hits' },
      { id: 'blank3', label: 'Signature Move', placeholder: 'boho magic / raw venom / heavy thunder', hint: 'Your secret weapon' }
    ]
  }
];

export const BOT_NAMES = [
  'MC Terracotta',
  'Ochre Flow',
  'Sage Lyricist',
  'Desert Nomad',
  'Boho Beatsmith',
  'Velvet Cypher',
  'Saffron Rapper',
  'Indigo Verse'
];

export const BOT_FILLS: Record<string, string[]> = {
  blank1: ['golden sandals', 'magic dust', 'steamy espresso', 'tiger eye ring', 'silk bandana', 'solar power', 'midnight ink'],
  blank2: ['hypnotic trance', 'perfect flight', 'earthy groove', 'wild eruption', 'deep vibration', 'high velocity'],
  blank3: ['sacred lightning', 'polished brass', 'subwoofer kick', 'cosmic rhymes', 'pure devotion', 'thunderous bars']
};
