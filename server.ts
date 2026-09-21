/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { RoomState, Player, PlayerSubmission, VerseTemplate, WSClientAction, WSServerMessage, BeatStyle } from './src/types.js';
import { RAP_VERSES, BOT_NAMES, BOT_FILLS } from './src/data/verses.js';

interface ClientConnection {
  ws: WebSocket;
  playerId: string;
  roomCode: string;
}

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// In-memory rooms
const rooms = new Map<string, RoomState>();
const roomTimers = new Map<string, NodeJS.Timeout>();
const clients = new Map<WebSocket, ClientConnection>();

// Generate a random 4-character clean room code (e.g. BOHO, FLOW, BEAT, CYPH, DROP, VIBE)
function generateRoomCode(): string {
  const words = ['BOHO', 'FLOW', 'BEAT', 'CYPH', 'DROP', 'VIBE', 'RHYM', 'SOUL', 'BARS', 'GOLD'];
  const num = Math.floor(10 + Math.random() * 90);
  const word = words[Math.floor(Math.random() * words.length)];
  const code = `${word}-${num}`;
  return rooms.has(code) ? generateRoomCode() : code;
}

// Broadcast room state to all clients in that room
function broadcastRoom(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  for (const [ws, client] of clients.entries()) {
    if (client.roomCode === roomCode && ws.readyState === WebSocket.OPEN) {
      const msg: WSServerMessage = {
        type: 'ROOM_STATE',
        state: room,
        yourPlayerId: client.playerId
      };
      ws.send(JSON.stringify(msg));
    }
  }
}

// Render lines by replacing {blankX} with player answers
function renderLines(template: VerseTemplate, answers: Record<string, string>): string[] {
  return template.lines.map(line => {
    let replaced = line;
    for (const [k, v] of Object.entries(answers)) {
      const val = (v || '').trim() || `[blank]`;
      replaced = replaced.replace(new RegExp(`\\{${k}\\}`, 'g'), val.toUpperCase());
    }
    // Clean any remaining unfilled blanks
    return replaced.replace(/\{blank\d+\}/g, '[BLANK]');
  });
}

// Clear active room timer
function clearRoomTimer(roomCode: string) {
  const timer = roomTimers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    roomTimers.delete(roomCode);
  }
}

// Start game flow for a room
function startGame(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  clearRoomTimer(roomCode);
  room.phase = 'COUNTDOWN';
  room.timeRemaining = room.countdownDuration || 5;
  room.submissions = {};
  room.votes = {};
  room.winnerPlayerId = null;
  room.showcaseFinished = false;

  // Reset player submission flags
  for (const p of Object.values(room.players)) {
    p.hasSubmitted = false;
  }

  broadcastRoom(roomCode);

  // Pre-round countdown timer
  const timer = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      startWritingPhase(roomCode);
    } else {
      broadcastRoom(roomCode);
    }
  }, 1000);

  roomTimers.set(roomCode, timer);
}

// Start writing phase (30 seconds)
function startWritingPhase(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Pick a fresh verse template
  const verseIndex = Math.floor(Math.random() * RAP_VERSES.length);
  room.verseTemplate = RAP_VERSES[verseIndex];
  room.phase = 'WRITING';
  room.timeRemaining = room.writingDuration || 30;

  broadcastRoom(roomCode);

  const timer = setInterval(() => {
    room.timeRemaining -= 1;

    // Check if all human players submitted
    const humanPlayers = Object.values(room.players).filter(p => !p.isBot);
    const allHumansSubmitted = humanPlayers.length > 0 && humanPlayers.every(p => p.hasSubmitted);

    if (room.timeRemaining <= 0 || allHumansSubmitted) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      finishWritingPhase(roomCode);
    } else {
      broadcastRoom(roomCode);
    }
  }, 1000);

  roomTimers.set(roomCode, timer);
}

// Finish writing phase and generate submissions for bots / non-submitted
function finishWritingPhase(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room || !room.verseTemplate) return;

  const template = room.verseTemplate;

  // Check all players; if bot or not submitted, fill in answers
  for (const player of Object.values(room.players)) {
    if (!room.submissions[player.id]) {
      const autoAnswers: Record<string, string> = {};
      for (const blank of template.blanks) {
        const pool = BOT_FILLS[blank.id] || ['golden fire', 'desert rhythm', 'heavy bass'];
        autoAnswers[blank.id] = pool[Math.floor(Math.random() * pool.length)];
      }

      room.submissions[player.id] = {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        answers: autoAnswers,
        renderedLines: renderLines(template, autoAnswers),
        submittedAt: Date.now()
      };
      player.hasSubmitted = true;
    }
  }

  // Move to Showcase
  startShowcasePhase(roomCode);
}

// Start showcase phase - play all verses one by one
function startShowcasePhase(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const submissionList = Object.values(room.submissions);
  if (submissionList.length === 0) {
    // If no submissions, return to lobby
    room.phase = 'LOBBY';
    broadcastRoom(roomCode);
    return;
  }

  room.phase = 'SHOWCASE';
  room.currentShowcaseIndex = 0;
  // Verse showcase time: ~12 seconds per verse to allow high quality rap playback + reading
  const VERSE_TIME = 13;
  room.timeRemaining = VERSE_TIME;

  broadcastRoom(roomCode);

  const timer = setInterval(() => {
    room.timeRemaining -= 1;

    if (room.timeRemaining <= 0) {
      const subList = Object.values(room.submissions);
      if (room.currentShowcaseIndex < subList.length - 1) {
        // Advance to next verse!
        room.currentShowcaseIndex += 1;
        room.timeRemaining = VERSE_TIME;
        broadcastRoom(roomCode);
      } else {
        // All verses finished! Move to voting
        clearInterval(timer);
        roomTimers.delete(roomCode);
        startVotingPhase(roomCode);
      }
    } else {
      broadcastRoom(roomCode);
    }
  }, 1000);

  roomTimers.set(roomCode, timer);
}

// Start voting phase
function startVotingPhase(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.phase = 'VOTING';
  room.timeRemaining = 25; // 25 seconds to vote
  room.votes = {};

  // For any bot players, pre-populate their votes towards other players randomly
  const candidateIds = Object.keys(room.submissions);
  for (const player of Object.values(room.players)) {
    if (player.isBot && candidateIds.length > 1) {
      const otherCandidates = candidateIds.filter(id => id !== player.id);
      if (otherCandidates.length > 0) {
        room.votes[player.id] = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
      }
    }
  }

  broadcastRoom(roomCode);

  const timer = setInterval(() => {
    room.timeRemaining -= 1;

    // Check if all human players have voted
    const humanPlayers = Object.values(room.players).filter(p => !p.isBot);
    const allHumansVoted = humanPlayers.length > 0 && humanPlayers.every(p => room.votes[p.id]);

    if (room.timeRemaining <= 0 || allHumansVoted) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      finishVotingAndShowResults(roomCode);
    } else {
      broadcastRoom(roomCode);
    }
  }, 1000);

  roomTimers.set(roomCode, timer);
}

// Calculate winner and show results
function finishVotingAndShowResults(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Count votes
  const voteTallies: Record<string, number> = {};
  for (const candidateId of Object.keys(room.submissions)) {
    voteTallies[candidateId] = 0;
  }

  for (const votedId of Object.values(room.votes)) {
    if (voteTallies[votedId] !== undefined) {
      voteTallies[votedId] += 1;
    }
  }

  // Find max votes
  let maxVotes = -1;
  let winnerId: string | null = null;
  for (const [candidateId, count] of Object.entries(voteTallies)) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = candidateId;
    }
  }

  room.winnerPlayerId = winnerId;
  room.phase = 'RESULTS';

  // Award scores
  for (const [pId, player] of Object.entries(room.players)) {
    if (pId === winnerId) {
      player.score += 150; // Big bonus for champion verse
    }
    const votesReceived = voteTallies[pId] || 0;
    player.score += votesReceived * 30; // 30 pts per vote
  }

  broadcastRoom(roomCode);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  let boundPlayerId = `p_${Math.random().toString(36).substring(2, 9)}`;
  let boundRoomCode = '';

  ws.on('message', (data) => {
    try {
      const msg: WSClientAction = JSON.parse(data.toString());

      switch (msg.type) {
        case 'CREATE_ROOM': {
          const roomCode = generateRoomCode();
          boundRoomCode = roomCode;
          boundPlayerId = `p_${Math.random().toString(36).substring(2, 9)}`;

          const hostPlayer: Player = {
            id: boundPlayerId,
            name: msg.playerName || 'Cypher MC',
            avatar: msg.avatar || 'sun',
            isHost: true,
            score: 0,
            hasSubmitted: false
          };

          const newRoom: RoomState = {
            code: roomCode,
            hostId: boundPlayerId,
            phase: 'LOBBY',
            players: { [boundPlayerId]: hostPlayer },
            currentRound: 1,
            totalRounds: 3,
            verseTemplate: null,
            timeRemaining: 0,
            countdownDuration: msg.countdownDuration || 5,
            writingDuration: 30,
            submissions: {},
            currentShowcaseIndex: 0,
            votes: {},
            selectedBeat: msg.beatStyle || 'boho-boombap'
          };

          rooms.set(roomCode, newRoom);
          clients.set(ws, { ws, playerId: boundPlayerId, roomCode });
          broadcastRoom(roomCode);
          break;
        }

        case 'JOIN_ROOM': {
          const targetCode = (msg.roomCode || '').toUpperCase().trim();
          const room = rooms.get(targetCode);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room "${targetCode}" not found. Please check the code.` }));
            return;
          }

          boundRoomCode = targetCode;
          boundPlayerId = `p_${Math.random().toString(36).substring(2, 9)}`;

          const player: Player = {
            id: boundPlayerId,
            name: msg.playerName || 'Guest Rapper',
            avatar: msg.avatar || 'moon',
            isHost: false,
            score: 0,
            hasSubmitted: false
          };

          room.players[boundPlayerId] = player;
          clients.set(ws, { ws, playerId: boundPlayerId, roomCode: targetCode });
          broadcastRoom(targetCode);
          break;
        }

        case 'START_GAME': {
          const room = rooms.get(msg.roomCode);
          if (room) {
            if (msg.countdownDuration) room.countdownDuration = msg.countdownDuration;
            if (msg.beatStyle) room.selectedBeat = msg.beatStyle;
            startGame(msg.roomCode);
          }
          break;
        }

        case 'SUBMIT_BLANKS': {
          const room = rooms.get(msg.roomCode);
          if (room && room.phase === 'WRITING' && room.verseTemplate) {
            const player = room.players[boundPlayerId];
            if (player) {
              player.hasSubmitted = true;
              room.submissions[boundPlayerId] = {
                playerId: boundPlayerId,
                playerName: player.name,
                playerAvatar: player.avatar,
                answers: msg.answers,
                renderedLines: renderLines(room.verseTemplate, msg.answers),
                submittedAt: Date.now()
              };
              broadcastRoom(msg.roomCode);
            }
          }
          break;
        }

        case 'CAST_VOTE': {
          const room = rooms.get(msg.roomCode);
          if (room && room.phase === 'VOTING') {
            // Cannot vote for self
            if (msg.targetPlayerId !== boundPlayerId) {
              room.votes[boundPlayerId] = msg.targetPlayerId;
              broadcastRoom(msg.roomCode);
            }
          }
          break;
        }

        case 'SIMULATE_BOT': {
          const room = rooms.get(msg.roomCode);
          if (room && room.phase === 'LOBBY') {
            const existingNames = new Set(Object.values(room.players).map(p => p.name));
            const availableNames = BOT_NAMES.filter(n => !existingNames.has(n));
            const botName = availableNames[0] || `Bot MC ${Math.floor(Math.random() * 99)}`;
            const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;
            const avatars = ['sun', 'moon', 'lotus', 'feather', 'desert', 'boombox', 'mic'];
            const botAvatar = avatars[Math.floor(Math.random() * avatars.length)];

            room.players[botId] = {
              id: botId,
              name: botName,
              avatar: botAvatar,
              isHost: false,
              score: 0,
              hasSubmitted: false,
              isBot: true
            };
            broadcastRoom(msg.roomCode);
          }
          break;
        }

        case 'KICK_BOT': {
          const room = rooms.get(msg.roomCode);
          if (room && room.phase === 'LOBBY') {
            if (room.players[msg.botId]?.isBot) {
              delete room.players[msg.botId];
              broadcastRoom(msg.roomCode);
            }
          }
          break;
        }

        case 'CHANGE_BEAT': {
          const room = rooms.get(msg.roomCode);
          if (room) {
            room.selectedBeat = msg.beatStyle;
            broadcastRoom(msg.roomCode);
          }
          break;
        }

        case 'NEXT_ROUND': {
          const room = rooms.get(msg.roomCode);
          if (room) {
            room.currentRound += 1;
            room.phase = 'LOBBY';
            room.submissions = {};
            room.votes = {};
            room.winnerPlayerId = null;
            room.verseTemplate = null;
            for (const p of Object.values(room.players)) {
              p.hasSubmitted = false;
            }
            broadcastRoom(msg.roomCode);
          }
          break;
        }

        case 'RESET_ROOM': {
          const room = rooms.get(msg.roomCode);
          if (room) {
            clearRoomTimer(msg.roomCode);
            room.currentRound = 1;
            room.phase = 'LOBBY';
            room.submissions = {};
            room.votes = {};
            room.winnerPlayerId = null;
            room.verseTemplate = null;
            for (const p of Object.values(room.players)) {
              p.score = 0;
              p.hasSubmitted = false;
            }
            broadcastRoom(msg.roomCode);
          }
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
        }
      }
    } catch (err) {
      console.error('WS Error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    if (boundRoomCode) {
      const room = rooms.get(boundRoomCode);
      if (room) {
        delete room.players[boundPlayerId];
        delete room.submissions[boundPlayerId];
        delete room.votes[boundPlayerId];

        // If host left, assign new host if other players exist
        if (room.hostId === boundPlayerId) {
          const remainingPlayers = Object.values(room.players).filter(p => !p.isBot);
          if (remainingPlayers.length > 0) {
            room.hostId = remainingPlayers[0].id;
            remainingPlayers[0].isHost = true;
          }
        }

        // If room is empty of human players, clean up
        const remainingHumans = Object.values(room.players).filter(p => !p.isBot);
        if (remainingHumans.length === 0) {
          clearRoomTimer(boundRoomCode);
          rooms.delete(boundRoomCode);
        } else {
          broadcastRoom(boundRoomCode);
        }
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

// Get room details by code (for quick verification/preview)
app.get('/api/room/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ code: room.code, phase: room.phase, playerCount: Object.keys(room.players).length });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Boho Rap Battle server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
