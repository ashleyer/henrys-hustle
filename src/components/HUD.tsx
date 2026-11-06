/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Pause, Volume2, VolumeX, Sparkles, Zap, ShieldCheck, RotateCcw, Mic, MicOff, Flame, Music } from 'lucide-react';
import { voiceNarrator } from '../services/voiceNarrator';
import { GameStats, ActivePowerUp, TrickFeedback, NarrationSnippet, EducationalTrivia } from '../types/game';

interface HUDProps {
  stats: GameStats;
  powerUps: ActivePowerUp[];
  recentTrick: TrickFeedback | null;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicMuted?: boolean;
  onToggleMusic?: () => void;
  onPause: () => void;
  onDeployBoard: () => void;
  isInverted?: boolean;
  onToggleInvert?: () => void;
  unlockedTriviaToast?: EducationalTrivia | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  powerUps,
  recentTrick,
  isMuted,
  onToggleMute,
  isMusicMuted = false,
  onToggleMusic,
  onPause,
  onDeployBoard,
  isInverted = false,
  onToggleInvert,
  unlockedTriviaToast,
}) => {
  const letters: Array<'H' | 'E' | 'N' | 'R' | 'Y'> = ['H', 'E', 'N', 'R', 'Y'];
  const hasFever = powerUps.some(p => p.type === 'FEVER_MODE');
  const hasSkyRings = powerUps.some(p => p.type === 'SKY_RINGS');

  const [activeNarration, setActiveNarration] = React.useState<NarrationSnippet | null>(null);
  const [isVoiceOn, setIsVoiceOn] = React.useState<boolean>(() => voiceNarrator.getVoiceEnabled());

  React.useEffect(() => {
    voiceNarrator.setMuted(isMuted);
  }, [isMuted]);

  React.useEffect(() => {
    return voiceNarrator.subscribe((snippet) => {
      setActiveNarration(snippet);
    });
  }, []);

  const toggleVoice = () => {
    const next = !isVoiceOn;
    setIsVoiceOn(next);
    voiceNarrator.setVoiceEnabled(next);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pt-safe px-safe pb-safe select-none z-10">
      {/* Compact Top Perimeter Bar — Leaves 88% of Viewport Unobstructed */}
      <div className="w-full flex flex-col gap-1 pt-1 px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Left: Unified Score, Stars & Hearts Pill */}
          <div className="bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2.5 shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-arcade text-lg sm:text-2xl text-yellow-400 tabular-nums leading-none">
                {stats.score.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-400 tabular-nums hidden sm:inline">
                {stats.distance}m
              </span>
            </div>

            <span className="text-slate-700">·</span>

            {/* Stars */}
            <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs sm:text-sm tabular-nums">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
              <span>{stats.starsCollected}</span>
            </div>

            <span className="text-slate-700">·</span>

            {/* Hearts */}
            <div className="flex items-center gap-0.5" aria-label="Lives">
              {Array.from({ length: stats.maxHearts || 3 }).map((_, idx) => {
                const isAlive = idx < (stats.hearts || 0);
                return (
                  <span
                    key={idx}
                    className={`text-xs sm:text-sm transition-transform ${
                      isAlive ? 'scale-100' : 'opacity-25 grayscale'
                    }`}
                  >
                    {isAlive ? '❤️' : '🤍'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Center: Compact H-E-N-R-Y Letters (Hidden on tiny phones if crowded, visible sm+) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/75 border border-amber-500/30 px-2.5 py-1 rounded-2xl">
            {letters.map(letter => {
              const collected = stats.collectedLetters[letter];
              return (
                <div
                  key={letter}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-arcade text-xs transition-transform ${
                    collected
                      ? 'bg-amber-400 text-slate-950 font-black scale-105'
                      : 'bg-slate-800/90 text-slate-500'
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          {/* Right: Audio, Steering & Pause Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            {stats.activeBoardActive ? (
              <div className="bg-cyan-950/85 border border-cyan-400/70 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-cyan-200 text-xs font-bold tabular-nums">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{Math.ceil(stats.boardTimeRemaining)}s</span>
              </div>
            ) : stats.boardsAvailable > 0 ? (
              <button
                onClick={onDeployBoard}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1 transition active:scale-95 border border-cyan-300/80 cursor-pointer"
                title="Use Shield Hoverboard"
              >
                <span>🛹 {stats.boardsAvailable}</span>
              </button>
            ) : null}

            {onToggleInvert && (
              <button
                onClick={onToggleInvert}
                className={`min-h-[40px] px-2 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                  isInverted
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
                title="Flip Left/Right Steering"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{isInverted ? 'INVERTED' : 'NORMAL'}</span>
              </button>
            )}

            {onToggleMusic && (
              <button
                onClick={onToggleMusic}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer ${
                  !isMusicMuted
                    ? 'bg-slate-950/80 border-indigo-400/70 text-indigo-300'
                    : 'bg-slate-950/80 border-slate-700/80 text-slate-500'
                }`}
                title={isMusicMuted ? 'Turn Music ON' : 'Mute Music'}
                aria-label="Toggle Music"
              >
                <Music className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Non-Blocking Top Micro-Ticker for History & Combo (Zero Center-Screen Occlusion) */}
        <div className="flex flex-col items-center justify-center pointer-events-none gap-1 mt-0.5">
          {/* Combo Multiplier Pill */}
          {stats.comboCount >= 2 && stats.comboTimer > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 text-white px-3 py-0.5 rounded-full border border-yellow-200 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
              <span className="font-arcade text-xs sm:text-sm font-black text-yellow-200 tabular-nums">
                {stats.comboMultiplier}x COMBO!
              </span>
              <div className="w-14 h-1.5 bg-slate-950/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-300"
                  style={{ width: `${Math.max(0, Math.min(100, (stats.comboTimer / (stats.maxComboTimer || 3.2)) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Slim 1-Line Landmark / History Micro-Badge (Never blocks Henry or oncoming trains!) */}
          {activeNarration && (
            <div className="max-w-xs sm:max-w-md w-fit mx-auto bg-slate-950/75 border border-yellow-400/50 rounded-full px-3 py-1 shadow-md flex items-center gap-1.5 pointer-events-none">
              <span className="text-xs shrink-0">{activeNarration.badgeEmoji || '🚇'}</span>
              <span className="text-[11px] sm:text-xs text-slate-100 font-semibold truncate">
                {activeNarration.text}
              </span>
            </div>
          )}

          {!activeNarration && unlockedTriviaToast && (
            <div className="max-w-xs w-fit mx-auto bg-emerald-950/80 border border-emerald-400/60 rounded-full px-3 py-0.5 shadow-md flex items-center gap-1.5 pointer-events-none">
              <span className="text-xs">⭐</span>
              <span className="text-[11px] font-bold text-emerald-200 truncate">
                New Badge: {unlockedTriviaToast.title}
              </span>
            </div>
          )}

          {/* Trick Score Pop */}
          {recentTrick && Date.now() - recentTrick.timestamp < 1300 && (
            <div className="bg-amber-500/90 text-slate-950 font-arcade text-xs sm:text-sm px-3 py-0.5 rounded-full shadow border border-yellow-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{recentTrick.tag} +{recentTrick.bonus}</span>
            </div>
          )}

          {/* Active Power-Up Mini Row */}
          {(powerUps.length > 0 || hasSkyRings || hasFever) && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {powerUps.map(p => (
                <div
                  key={p.type}
                  className="bg-slate-950/80 border border-amber-400/50 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-yellow-300 tabular-nums"
                >
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>{p.type.replace('_', ' ')} {Math.ceil(p.remainingTime)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
};
