/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThreeCanvas } from './game/ThreeCanvas';
import { GameEngine, OUTFITS, CHALK_BOARDS } from './game/gameEngine';
import {
  GameStatus,
  GameStats,
  ActivePowerUp,
  TrickFeedback,
  CharacterOutfit,
  ChalkBoardItem,
  Mission
} from './types/game';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { ShopModal } from './components/ShopModal';
import { MissionsModal } from './components/MissionsModal';
import { TrickGuideModal } from './components/TrickGuideModal';
import { AshleyFooter } from './components/AshleyFooter';
import { soundManager } from './audio/soundManager';
import { Play } from 'lucide-react';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    starsCollected: 0,
    starsInBank: 0,
    tricksPerformed: 0,
    perfectTens: 0,
    vaultsPerformed: 0,
    springboardLaunches: 0,
    highScore: 0,
    highestDistance: 0,
    totalRuns: 0,
    boardsAvailable: 3,
    activeBoardActive: false,
    boardTimeRemaining: 0,
    collectedLetters: { H: false, E: false, N: false, R: false, Y: false },
  });

  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [recentTrick, setRecentTrick] = useState<TrickFeedback | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedOutfit, setSelectedOutfit] = useState<CharacterOutfit>(OUTFITS[0]);
  const [selectedBoard, setSelectedBoard] = useState<ChalkBoardItem>(CHALK_BOARDS[0]);
  const [missions, setMissions] = useState<Mission[]>([]);

  // Modals state
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState<boolean>(false);
  const [isTrickGuideOpen, setIsTrickGuideOpen] = useState<boolean>(false);

  // Bind engine
  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;

    engine.onStatusChange = (status) => setGameStatus(status);
    engine.onStatsChange = (newStats) => setStats({ ...newStats });
    engine.onPowerUpsChange = (active) => setPowerUps([...active]);
    engine.onTrick = (trick) => setRecentTrick(trick);
    engine.onMissionUpdate = (mList) => setMissions([...mList]);

    setStats({ ...engine.stats });
    setMissions([...engine.missions]);
    setSelectedOutfit(engine.currentOutfit);
    setSelectedBoard(engine.currentBoard);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        engine.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        engine.moveRight();
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') {
        e.preventDefault();
        engine.jump();
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        engine.slide();
      } else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'e') {
        engine.doTrickButton();
      } else if (e.key === 'Shift') {
        engine.deployChalkBoard();
      } else if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        if (engine.status === 'PLAYING') engine.pauseGame();
        else if (engine.status === 'PAUSED') engine.resumeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartGame = () => {
    setIsShopOpen(false);
    setIsMissionsOpen(false);
    setIsTrophyRoomOpen(false);
    setIsTrickGuideOpen(false);
    engineRef.current?.startGame();
  };

  const handlePause = () => {
    engineRef.current?.pauseGame();
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
  };

  const handleRestart = () => {
    setIsShopOpen(false);
    setIsMissionsOpen(false);
    setIsTrophyRoomOpen(false);
    setIsTrickGuideOpen(false);
    engineRef.current?.startGame();
  };

  const handleGoToMenu = () => {
    if (engineRef.current) {
      engineRef.current.status = 'MENU';
      setGameStatus('MENU');
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const handleSelectOutfit = (outfit: CharacterOutfit) => {
    setSelectedOutfit(outfit);
    engineRef.current?.setOutfit(outfit);
  };

  const handleSelectBoard = (board: ChalkBoardItem) => {
    setSelectedBoard(board);
    engineRef.current?.setBoard(board);
  };

  const handleBuyBoardPacks = () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.stats.starsInBank >= 30) {
      engine.stats.starsInBank -= 30;
      engine.stats.boardsAvailable += 3;
      engine.saveProgress();
      setStats({ ...engine.stats });
      soundManager.playLetter();
    }
  };

  const handleDeployBoard = () => {
    engineRef.current?.deployChalkBoard();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas */}
      <ThreeCanvas onEngineReady={handleEngineReady} />

      {/* In-Game HUD */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
        <HUD
          stats={stats}
          powerUps={powerUps}
          recentTrick={recentTrick}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onDeployBoard={handleDeployBoard}
        />
      )}

      {/* In-Game Touch Controls */}
      {gameStatus === 'PLAYING' && (
        <TouchControls
          onLeft={() => engineRef.current?.moveLeft()}
          onRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
          onTrick={() => engineRef.current?.doTrickButton()}
          onDeployBoard={handleDeployBoard}
          boardsAvailable={stats.boardsAvailable}
          isBoardActive={stats.activeBoardActive}
        />
      )}

      {/* Pause Screen Overlay */}
      {gameStatus === 'PAUSED' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm select-none">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
            <h2 className="font-arcade text-2xl text-yellow-400 mb-2">GAME PAUSED</h2>
            <p className="text-xs text-slate-300 mb-5">Take a quick breather, Henry!</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 font-arcade text-slate-950 text-base shadow flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" /> RESUME
              </button>
              <button
                onClick={handleGoToMenu}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                QUIT TO MENU
              </button>
            </div>
            <div className="w-full pt-3 mt-3 border-t border-slate-800/80">
              <AshleyFooter />
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameStatus === 'MENU' && (
        <StartScreen
          onStart={handleStartGame}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenTrophyRoom={() => setIsTrophyRoomOpen(true)}
          onOpenTrickGuide={() => setIsTrickGuideOpen(true)}
          selectedOutfit={selectedOutfit}
          stats={stats}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onGoToShop={() => {
            handleGoToMenu();
            setIsShopOpen(true);
          }}
          onGoToMenu={handleGoToMenu}
        />
      )}

      {/* Shop Modal */}
      {isShopOpen && (
        <ShopModal
          stats={stats}
          selectedOutfit={selectedOutfit}
          selectedBoard={selectedBoard}
          onSelectOutfit={handleSelectOutfit}
          onSelectBoard={handleSelectBoard}
          onBuyBoardPacks={handleBuyBoardPacks}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {/* Missions Modal */}
      {isMissionsOpen && (
        <MissionsModal
          missions={missions}
          stats={stats}
          onClose={() => setIsMissionsOpen(false)}
        />
      )}

      {/* Trophy Room Modal */}
      {isTrophyRoomOpen && (
        <TrophyRoomModal
          stats={stats}
          onClose={() => setIsTrophyRoomOpen(false)}
        />
      )}

      {/* Trick Guide Modal */}
      {isTrickGuideOpen && (
        <TrickGuideModal
          onClose={() => setIsTrickGuideOpen(false)}
        />
      )}
    </div>
  );
}
