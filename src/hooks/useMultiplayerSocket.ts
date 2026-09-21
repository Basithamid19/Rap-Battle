/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, WSClientAction, WSServerMessage, BeatStyle } from '../types.js';

export function useMultiplayerSocket() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const pendingActionsRef = useRef<WSClientAction[]>([]);

  // Connect WebSocket to port 3000
  const connectSocket = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setErrorMessage('');

        // Flush any pending actions
        while (pendingActionsRef.current.length > 0) {
          const action = pendingActionsRef.current.shift();
          if (action) {
            ws.send(JSON.stringify(action));
          }
        }

        // Keep-alive ping
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          if (msg.type === 'ROOM_STATE') {
            setRoomState(msg.state);
            if (msg.yourPlayerId) {
              setMyPlayerId(msg.yourPlayerId);
            }
          } else if (msg.type === 'ERROR') {
            setErrorMessage(msg.message);
          }
        } catch (err) {
          console.error('WS Parse Error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Auto-reconnect after brief delay
        setTimeout(connectSocket, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
      };
    } catch (err) {
      console.error('WebSocket create error:', err);
    }
  }, []);

  useEffect(() => {
    connectSocket();

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectSocket]);

  const sendAction = useCallback((action: WSClientAction) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(action));
    } else {
      pendingActionsRef.current.push(action);
      connectSocket();
    }
  }, [connectSocket]);

  const createRoom = useCallback((playerName: string, avatar: string, countdownDuration = 5, beatStyle: BeatStyle = 'boho-boombap') => {
    setErrorMessage('');
    sendAction({ type: 'CREATE_ROOM', playerName, avatar, countdownDuration, beatStyle });
  }, [sendAction]);

  const joinRoom = useCallback((roomCode: string, playerName: string, avatar: string) => {
    setErrorMessage('');
    sendAction({ type: 'JOIN_ROOM', roomCode, playerName, avatar });
  }, [sendAction]);

  const startGame = useCallback((countdownDuration = 5, beatStyle?: BeatStyle) => {
    if (!roomState) return;
    sendAction({ type: 'START_GAME', roomCode: roomState.code, countdownDuration, beatStyle });
  }, [roomState, sendAction]);

  const submitBlanks = useCallback((answers: Record<string, string>) => {
    if (!roomState) return;
    sendAction({ type: 'SUBMIT_BLANKS', roomCode: roomState.code, answers });
  }, [roomState, sendAction]);

  const castVote = useCallback((targetPlayerId: string) => {
    if (!roomState) return;
    sendAction({ type: 'CAST_VOTE', roomCode: roomState.code, targetPlayerId });
  }, [roomState, sendAction]);

  const nextRound = useCallback(() => {
    if (!roomState) return;
    sendAction({ type: 'NEXT_ROUND', roomCode: roomState.code });
  }, [roomState, sendAction]);

  const resetRoom = useCallback(() => {
    if (!roomState) return;
    sendAction({ type: 'RESET_ROOM', roomCode: roomState.code });
  }, [roomState, sendAction]);

  const simulateBot = useCallback(() => {
    if (!roomState) return;
    sendAction({ type: 'SIMULATE_BOT', roomCode: roomState.code });
  }, [roomState, sendAction]);

  const kickBot = useCallback((botId: string) => {
    if (!roomState) return;
    sendAction({ type: 'KICK_BOT', roomCode: roomState.code, botId });
  }, [roomState, sendAction]);

  const changeBeat = useCallback((beatStyle: BeatStyle) => {
    if (!roomState) return;
    sendAction({ type: 'CHANGE_BEAT', roomCode: roomState.code, beatStyle });
  }, [roomState, sendAction]);

  const leaveRoom = useCallback(() => {
    setRoomState(null);
    setMyPlayerId('');
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  return {
    roomState,
    myPlayerId,
    isConnected,
    errorMessage,
    createRoom,
    joinRoom,
    startGame,
    submitBlanks,
    castVote,
    nextRound,
    resetRoom,
    simulateBot,
    kickBot,
    changeBeat,
    leaveRoom,
  };
}
