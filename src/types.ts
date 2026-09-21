/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GamePhase =
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'WRITING'
  | 'SHOWCASE'
  | 'VOTING'
  | 'RESULTS';

export type BeatStyle =
  | 'boho-boombap'
  | 'desert-trap'
  | 'vinyl-golden'
  | 'chillhop';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
  hasSubmitted: boolean;
  isBot?: boolean;
}

export interface BlankSlot {
  id: string;
  label: string;
  placeholder: string;
  rhymeWith?: string;
  hint?: string;
}

export interface VerseTemplate {
  id: string;
  title: string;
  subgenre: string;
  bpm: number;
  lines: string[]; // e.g. ["Stepped in the cypher with my {blank1} up", ...]
  blanks: BlankSlot[];
}

export interface PlayerSubmission {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  answers: Record<string, string>;
  renderedLines: string[];
  submittedAt: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  phase: GamePhase;
  players: Record<string, Player>;
  currentRound: number;
  totalRounds: number;
  verseTemplate: VerseTemplate | null;
  timeRemaining: number;
  countdownDuration: number; // 5 or 10 seconds
  writingDuration: number; // 30 seconds
  submissions: Record<string, PlayerSubmission>;
  currentShowcaseIndex: number;
  votes: Record<string, string>; // voterId -> votedPlayerId
  selectedBeat: BeatStyle;
  winnerPlayerId?: string | null;
  showcaseFinished?: boolean;
}

export type WSClientAction =
  | { type: 'CREATE_ROOM'; playerName: string; avatar: string; countdownDuration?: number; beatStyle?: BeatStyle }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string; avatar: string }
  | { type: 'START_GAME'; roomCode: string; countdownDuration?: number; beatStyle?: BeatStyle }
  | { type: 'SUBMIT_BLANKS'; roomCode: string; answers: Record<string, string> }
  | { type: 'CAST_VOTE'; roomCode: string; targetPlayerId: string }
  | { type: 'NEXT_ROUND'; roomCode: string }
  | { type: 'RESET_ROOM'; roomCode: string }
  | { type: 'SIMULATE_BOT'; roomCode: string }
  | { type: 'KICK_BOT'; roomCode: string; botId: string }
  | { type: 'CHANGE_BEAT'; roomCode: string; beatStyle: BeatStyle }
  | { type: 'PING' };

export type WSServerMessage =
  | { type: 'ROOM_STATE'; state: RoomState; yourPlayerId: string }
  | { type: 'TICK'; timeRemaining: number; phase: GamePhase; currentShowcaseIndex?: number }
  | { type: 'SHOWCASE_ADVANCE'; index: number; submission: PlayerSubmission }
  | { type: 'ERROR'; message: string };
