/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterOutfit, GameStats, UserProfile } from '../types/game';
import { Play, Trophy, Sparkles, Star, ShoppingBag, Award, BookOpen, Palette, User, Zap, Volume2 } from 'lucide-react';
import { AshleyFooter } from './AshleyFooter';
import { PWAInstallButton } from './PWAInstallButton';
import { soundManager } from '../audio/soundManager';

interface StartScreenProps {
  onStart: () => void;
  onStartWithCoach?: () => void;
  onOpenShop: () => void;
  onOpenStudio: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial: () => void;
  onOpenTrophyRoom: () => void;
  onOpenAuth: () => void;
  onSetPace?: (pace: 'JUNIOR' | 'PRO') => void;
  user: UserProfile;
  selectedOutfit: CharacterOutfit;
  stats: GameStats;
  isMusicMuted?: boolean;
  onToggleMusic?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onStartWithCoach,
  onOpenShop,
  onOpenStudio,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenTutorial,
  onOpenTrophyRoom,
  onOpenAuth,
  onSetPace,
  user,
  selectedOutfit,
  stats,
  isMusicMuted = false,
  onToggleMusic,
}) => {
  const currentPace = stats.speedPace || 'JUNIOR';

  const handlePaceChange = (pace: 'JUNIOR' | 'PRO') => {
    soundManager.playLaneSwitch();
    if (onSetPace) onSetPace(pace);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/70 select-none font-sans overflow-y-auto pt-safe pb-safe">
      <div className="max-w-md sm:max-w-lg w-full bg-slate-900/95 border-2 border-emerald-500/70 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden my-auto">
        {/* Top User Account, Install App & Audio Bar */}
        <div className="w-full flex items-center justify-between gap-1.5 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {onToggleMusic && (
              <button
                onClick={onToggleMusic}
                className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0 ${
                  !isMusicMuted
                    ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 hover:bg-indigo-900/60'
                    : 'bg-slate-800 border-slate-700 text-rose-300 hover:bg-slate-700'
                }`}
                title={isMusicMuted ? 'Turn Music ON' : 'Mute Music'}
              >
                <span>{isMusicMuted ? '🔇 Music Off' : '🎵 Music On'}</span>
              </button>
            )}

            <PWAInstallButton />
          </div>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {user.isLoggedIn ? (
              <>
                <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-4 h-4 rounded-full border border-emerald-400" />
                <span className="truncate max-w-[90px] text-emerald-300">{user.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-yellow-400" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h1 className="font-arcade text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-amber-400 drop-shadow leading-tight">
          HENRY’S HUB HUSTLE
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-0.5 max-w-sm font-medium">
          Run on Boston trains, jump over hurdles, and collect shiny gold stars!
        </p>

        {/* High Score & Star Bank */}
        <div className="grid grid-cols-2 gap-2.5 my-2.5 w-full">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">BEST SCORE</span>
            <span className="font-arcade text-lg sm:text-xl text-yellow-400 tabular-nums">{stats.highScore.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">MY STARS</span>
            <span className="font-arcade text-lg sm:text-xl text-amber-300 flex items-center gap-1 tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats.starsInBank}
            </span>
          </div>
        </div>

        {/* Character Preview & Customize Button */}
        <div className="w-full bg-slate-950/70 rounded-2xl p-2.5 border border-slate-800 mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl border-2 border-white/20 flex items-center justify-center font-arcade text-base text-white font-black shrink-0"
              style={{ backgroundColor: selectedOutfit.suitColor }}
            >
              #7
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs sm:text-sm font-bold text-white truncate">{selectedOutfit.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{selectedOutfit.title}</div>
            </div>
          </div>
          <button
            onClick={onOpenStudio}
            className="text-xs font-bold text-yellow-300 hover:text-yellow-200 bg-yellow-500/15 hover:bg-yellow-500/25 px-3 py-2 rounded-xl border border-yellow-400/40 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Dress Up</span>
          </button>
        </div>

        {/* Pace Selector */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2 mb-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1 pl-1 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> PACE:
          </span>
          <div className="flex gap-1.5 flex-1 justify-end">
            <button
              onClick={() => handlePaceChange('JUNIOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                currentPace === 'JUNIOR'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>🚶 Strolling Along</span>
            </button>
            <button
              onClick={() => handlePaceChange('PRO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                currentPace === 'PRO'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>💘 Late for a Date</span>
            </button>
          </div>
        </div>

        {/* Quick Menu Grid — Simple 1-Word Kid Labels */}
        <div className="grid grid-cols-4 gap-2 w-full mb-2.5">
          <button
            onClick={onOpenShop}
            className="min-h-[48px] py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold">SHOP</span>
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="min-h-[48px] py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-bold">WINNERS</span>
          </button>
          <button
            onClick={onOpenMissions}
            className="min-h-[48px] py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold">GOALS</span>
          </button>
          <button
            onClick={onOpenTutorial}
            className="min-h-[48px] py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold">GUIDE</span>
          </button>
        </div>

        {/* Big Play Button */}
        <button
          onClick={onStart}
          className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 hover:from-emerald-300 hover:to-amber-400 text-slate-950 font-arcade text-xl tracking-wider shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 mb-2 cursor-pointer font-black"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>PLAY NOW! 🚀</span>
        </button>

        {/* Bottom Links: Practice Walk-Through & Trophy Room */}
        <div className="w-full flex items-center justify-between px-2 mb-1.5 text-xs">
          {onStartWithCoach && (
            <button
              onClick={onStartWithCoach}
              className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 py-1 cursor-pointer"
            >
              <span>👋 Practice Walk-Through</span>
            </button>
          )}
          <button
            onClick={onOpenTrophyRoom}
            className="text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1 py-1 cursor-pointer ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Trophy Room</span>
          </button>
        </div>

        {/* Ashley's Footer */}
        <div className="w-full pt-2 border-t border-slate-800/80">
          <AshleyFooter />
        </div>
      </div>
    </div>
  );
};
