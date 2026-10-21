/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterOutfit, GameStats, UserProfile } from '../types/game';
import { Play, Trophy, Sparkles, Star, ShoppingBag, Award, BookOpen, Palette, User, Zap, Settings } from 'lucide-react';
import { AshleyFooter } from './AshleyFooter';
import { soundManager } from '../audio/soundManager';

interface StartScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  onOpenStudio: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial: () => void;
  onOpenTrophyRoom: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onSetPace?: (pace: 'JUNIOR' | 'PRO') => void;
  user: UserProfile;
  selectedOutfit: CharacterOutfit;
  stats: GameStats;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenShop,
  onOpenStudio,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenTutorial,
  onOpenTrophyRoom,
  onOpenAuth,
  onOpenSettings,
  onSetPace,
  user,
  selectedOutfit,
  stats,
}) => {
  const currentPace = stats.speedPace || 'JUNIOR';

  const handlePaceChange = (pace: 'JUNIOR' | 'PRO') => {
    soundManager.playLaneSwitch();
    if (onSetPace) onSetPace(pace);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-sm select-none font-sans overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden my-auto">
        {/* Top User Account Bar */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <span>🚇 BOSTON MBTA "THE T"</span>
          </div>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            {user.isLoggedIn ? (
              <>
                <img src={user.picture} alt="" className="w-4 h-4 rounded-full border border-emerald-400" />
                <span className="truncate max-w-[100px] text-emerald-400">{user.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-yellow-400" />
                <span>Google Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h1 className="font-arcade text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-amber-400 drop-shadow-lg leading-tight">
          HENRY’S HUB HUSTLE
        </h1>
        <p className="text-slate-300 text-xs md:text-sm mt-0.5 max-w-xs font-medium">
          Dodge Boston T trains, vault over hurdles, and pull off Olympic gymnastics flips across America's first subway!
        </p>

        {/* High Score & Bank Banner */}
        <div className="grid grid-cols-2 gap-3 my-3 w-full">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">HIGH SCORE</span>
            <span className="font-arcade text-xl text-yellow-400">{stats.highScore.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">STAR BANK</span>
            <span className="font-arcade text-xl text-amber-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats.starsInBank}
            </span>
          </div>
        </div>

        {/* Character Preview & Studio Button */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-slate-800 mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl border-2 border-white/20 flex items-center justify-center font-arcade text-lg text-white font-black shadow-inner"
              style={{ backgroundColor: selectedOutfit.suitColor }}
            >
              #7
            </div>
            <div className="text-left">
              <div className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedOutfit.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">{selectedOutfit.title}</div>
            </div>
          </div>
          <button
            onClick={onOpenStudio}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-xl border border-yellow-400/30 flex items-center gap-1 transition cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Game Speed Mode Selector */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pl-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> SPEED:
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handlePaceChange('JUNIOR')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                currentPace === 'JUNIOR'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🌟 Junior Explorer</span>
            </button>
            <button
              onClick={() => handlePaceChange('PRO')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                currentPace === 'PRO'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡ Pro Hustle</span>
            </button>
          </div>
        </div>

        {/* Quick Menu Grid */}
        <div className="grid grid-cols-5 gap-2 w-full mb-3">
          <button
            onClick={onOpenShop}
            className="py-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] font-bold">SHOP</span>
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="py-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-[9px] font-bold">LEADERBOARD</span>
          </button>
          <button
            onClick={onOpenMissions}
            className="py-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-bold">MISSIONS</span>
          </button>
          <button
            onClick={onOpenTutorial}
            className="py-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-bold">TUTORIAL</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="py-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="text-[9px] font-bold">SETTINGS</span>
          </button>
        </div>

        {/* Big Start Hustle Button */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 hover:from-emerald-300 hover:to-amber-400 text-slate-950 font-arcade text-xl tracking-wider shadow-[0_0_28px_rgba(16,185,129,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2 mb-2 cursor-pointer font-black"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>START HUB HUSTLE! 🚀</span>
        </button>

        <button
          onClick={onOpenTrophyRoom}
          className="text-xs text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-1.5 py-0.5 mb-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Henry's Gymnastics Trophy Room</span>
        </button>

        {/* Ashley's Footer (Preserved exact memory spec) */}
        <div className="w-full pt-2 border-t border-slate-800/80">
          <AshleyFooter />
        </div>
      </div>
    </div>
  );
};
