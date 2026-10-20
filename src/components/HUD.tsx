/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStats, ActivePowerUp, TrickFeedback } from '../types/game';
import { Star, Pause, Volume2, VolumeX, Sparkles, Zap, ShieldCheck, MapPin } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  powerUps: ActivePowerUp[];
  recentTrick: TrickFeedback | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onDeployBoard: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  powerUps,
  recentTrick,
  isMuted,
  onToggleMute,
  onPause,
  onDeployBoard,
}) => {
  const letters: Array<'H' | 'E' | 'N' | 'R' | 'Y'> = ['H', 'E', 'N', 'R', 'Y'];
  const hasFever = powerUps.some(p => p.type === 'FEVER_MODE');
  const hasSkyRings = powerUps.some(p => p.type === 'SKY_RINGS');

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 select-none z-10">
      {/* Top Header */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Score & Distance */}
        <div className="flex flex-col gap-1">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3">
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-slate-400 font-bold">SCORE</span>
            <span className="font-arcade text-2xl md:text-3xl text-yellow-400 drop-shadow">
              {stats.score.toLocaleString()}
            </span>
            {hasFever && (
              <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-[10px] md:text-xs px-2.5 py-0.5 rounded-full animate-bounce shadow-md">
                x2 FEVER!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-300 px-2">
            <span>{stats.distance}m</span>
            <span>•</span>
            <span className="text-yellow-400 flex items-center gap-1 font-bold">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 inline" />
              {stats.starsCollected}
            </span>
          </div>

          {/* Current Boston T Station Pill */}
          <div className="bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-md w-fit mt-0.5">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[150px] md:max-w-[220px]">{stats.currentStation}</span>
          </div>
        </div>

        {/* Center: "H-E-N-R-Y" Word Hunt */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 mr-1 hidden sm:inline">WORD HUNT</span>
            {letters.map(letter => {
              const collected = stats.collectedLetters[letter];
              return (
                <div
                  key={letter}
                  className={`w-7 h-8 md:w-8 md:h-9 rounded-lg flex items-center justify-center font-arcade text-base md:text-lg transition-all transform ${
                    collected
                      ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-105'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-amber-300/80 font-semibold mt-1 drop-shadow">
            {hasFever ? '🔥 SUPER HUB FEVER RUSH!' : 'Spell HENRY for Fever Rush!'}
          </span>
        </div>

        {/* Right: Audio, Board & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {stats.activeBoardActive ? (
            <div className="bg-cyan-950/80 border border-cyan-400/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-cyan-300 text-xs font-bold shadow-lg">
              <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>BOARD {Math.ceil(stats.boardTimeRemaining)}s</span>
            </div>
          ) : stats.boardsAvailable > 0 ? (
            <button
              onClick={onDeployBoard}
              className="px-3 py-1.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 border border-cyan-300"
              title="Summon Chalk Board (Double-Tap or Press Shift)"
            >
              <span>🛹 {stats.boardsAvailable}</span>
            </button>
          ) : null}

          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
          </button>
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg"
            title="Pause"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Trick Feedback Banner */}
      <div className="flex flex-col items-center justify-center -mt-16 pointer-events-none">
        {recentTrick && Date.now() - recentTrick.timestamp < 1600 && (
          <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 text-white font-arcade text-lg md:text-2xl px-5 py-2 rounded-full shadow-2xl border-2 border-yellow-300 flex items-center gap-2 transform -rotate-1">
              <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" />
              <span>{recentTrick.tag}</span>
              <span className="text-yellow-200 ml-1">+{recentTrick.bonus}</span>
            </div>
            <span className="text-xs md:text-sm font-bold text-yellow-300 drop-shadow mt-1 tracking-wide bg-slate-900/80 px-3 py-0.5 rounded-full">
              {recentTrick.name}
            </span>
          </div>
        )}

        {powerUps.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {powerUps.map(p => {
              const label =
                p.type === 'SPRING_SHOES'
                  ? 'SPRING SHOES'
                  : p.type === 'SKY_RINGS'
                  ? 'BOSTON SKY FLIGHT'
                  : p.type === 'CHALK_BOOST'
                  ? 'SUPER CHALK'
                  : p.type.replace('_', ' ');

              return (
                <div
                  key={p.type}
                  className="bg-slate-900/90 border border-amber-400/50 px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold text-yellow-300 shadow-lg"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{label}</span>
                  <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    {Math.ceil(p.remainingTime)}s
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {hasSkyRings && (
          <div className="mt-2 text-cyan-300 text-xs font-black bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-400/50 animate-pulse">
            ☁️ BOSTON SKY RINGS FLIGHT! ☁️
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
};
