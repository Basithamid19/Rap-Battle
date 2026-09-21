/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMultiplayerSocket } from './hooks/useMultiplayerSocket.js';
import { WelcomeView } from './components/WelcomeView.js';
import { LobbyView } from './components/LobbyView.js';
import { CountdownView } from './components/CountdownView.js';
import { WritingView } from './components/WritingView.js';
import { ShowcaseView } from './components/ShowcaseView.js';
import { VotingView } from './components/VotingView.js';
import { ResultsView } from './components/ResultsView.js';
import { QRCodeModal } from './components/QRCodeModal.js';
import { QRScannerModal } from './components/QRScannerModal.js';
import { PWAInstallButton } from './components/PWAInstallButton.js';
import { QrCode, Volume2, VolumeX, LogOut, Radio, Mic2, Users, Sparkles, Disc3, Zap } from 'lucide-react';
import { rapAudio } from './audio/rapBeatEngine.js';

export function App() {
  const {
    roomState: room,
    myPlayerId: playerId,
    errorMessage: error,
    createRoom,
    joinRoom,
    startGame,
    submitBlanks: submitVerse,
    castVote,
    nextRound,
    resetRoom,
    simulateBot,
    kickBot,
    changeBeat,
    leaveRoom,
  } = useMultiplayerSocket();

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [globalMuted, setGlobalMuted] = useState(false);

  // Check URL query parameters for ?room=CODE
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setUrlRoomCode(roomParam.trim().toUpperCase());
      }
    }
  }, []);

  const handleToggleGlobalAudio = () => {
    const isMuted = rapAudio.toggleMute();
    setGlobalMuted(isMuted);
  };

  const handleScanResult = (code: string) => {
    setUrlRoomCode(code);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-black flex flex-col font-['Space_Grotesk'] antialiased selection:bg-[#FFE600] selection:text-black">
      {/* Neo-Brutalist Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-4 py-2.5 sm:py-3 shadow-neo-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
              <Mic2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Syne'] font-black text-lg tracking-tight uppercase leading-none">
                  RAP BATTLE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#FFE600] text-black border border-black font-['Space_Grotesk'] font-black text-[9px] uppercase tracking-wider shadow-[1px_1px_0px_#000] rotate-[-1deg]">
                  NEO CYPHER
                </span>
              </div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                MULTIPLAYER HIP-HOP GAME
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            <PWAInstallButton />

            {/* Room QR Code Button if inside a room */}
            {room && (
              <button
                id="btn-nav-qr"
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black text-black hover:bg-[#FFE600] transition text-xs font-['Space_Grotesk'] font-black uppercase shadow-neo-sm active:translate-y-0.5 active:shadow-none"
                title="Show Room Barcode / QR Code"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">ROOM QR</span>
              </button>
            )}

            {/* Global Audio Mute */}
            <button
              id="btn-nav-mute"
              onClick={handleToggleGlobalAudio}
              className={`p-2 rounded-xl border-2 border-black transition shadow-neo-sm active:translate-y-0.5 active:shadow-none ${
                globalMuted
                  ? 'bg-[#FF5470] text-white'
                  : 'bg-white text-black hover:bg-[#FFE600]'
              }`}
              title={globalMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {globalMuted ? <VolumeX className="w-4 h-4 stroke-[2.5]" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* Leave Room Button if joined */}
            {room && (
              <button
                id="btn-nav-leave"
                onClick={leaveRoom}
                className="p-2 rounded-xl bg-white hover:bg-[#FF5470] hover:text-white text-black border-2 border-black transition shadow-neo-sm active:translate-y-0.5 active:shadow-none"
                title="Leave Room"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Stage Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 sm:py-6 flex flex-col justify-center">
        {!room ? (
          <WelcomeView
            initialRoomCode={urlRoomCode}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onOpenScanner={() => setIsScannerOpen(true)}
            errorMessage={error}
          />
        ) : room.phase === 'LOBBY' ? (
          <LobbyView
            room={room}
            myPlayerId={playerId}
            onStartGame={startGame}
            onSimulateBot={simulateBot}
            onKickBot={kickBot}
            onChangeBeat={changeBeat}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        ) : room.phase === 'COUNTDOWN' ? (
          <CountdownView
            timeRemaining={room.timeRemaining}
            beatStyle={room.selectedBeat}
          />
        ) : room.phase === 'WRITING' && room.verseTemplate ? (
          <WritingView
            verseTemplate={room.verseTemplate}
            timeRemaining={room.timeRemaining}
            totalTime={30}
            hasSubmitted={room.players[playerId]?.hasSubmitted || false}
            players={room.players}
            onSubmit={submitVerse}
          />
        ) : room.phase === 'SHOWCASE' ? (
          <ShowcaseView
            submissions={room.submissions}
            currentShowcaseIndex={room.currentShowcaseIndex}
            timeRemaining={room.timeRemaining}
            selectedBeat={room.selectedBeat}
            players={room.players}
            myPlayerId={playerId}
          />
        ) : room.phase === 'VOTING' ? (
          <VotingView
            submissions={room.submissions}
            votes={room.votes}
            timeRemaining={room.timeRemaining}
            myPlayerId={playerId}
            players={room.players}
            onCastVote={castVote}
          />
        ) : room.phase === 'RESULTS' ? (
          <ResultsView
            room={room}
            myPlayerId={playerId}
            onNextRound={nextRound}
            onResetRoom={resetRoom}
          />
        ) : null}
      </main>

      {/* Modals */}
      {room && (
        <QRCodeModal
          roomCode={room.code}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
      />
    </div>
  );
}

export default App;
