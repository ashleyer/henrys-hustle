/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterOutfit, GameStats } from '../types/game';
import { Play, Trophy, Sparkles, Star, ShoppingBag, Award, BookOpen } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenTrophyRoom: () => void;
  onOpenTrickGuide: () => void;
  selectedOutfit: CharacterOutfit;
  stats: GameStats;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenShop,
  onOpenMissions,
  onOpenTrophyRoom,
  onOpenTrickGuide,
  selectedOutfit,
  stats,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-sm select-none">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-yellow-500/60 rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Year-Old Champion Edition</span>
        </div>

        {/* Title */}
        <h1 className="font-arcade text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 drop-shadow-lg leading-tight">
          HENRY’S HUSTLE
        </h1>
        <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xs font-medium">
          Dodge subway trains, vault over hurdles, and pull off Olympic gymnastics flips!
        </p>

        {/* High Score & Bank Banner */}
        <div className="grid grid-cols-2 gap-3 my-4 w-full">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">HIGH SCORE</span>
            <span className="font-arcade text-xl md:text-2xl text-yellow-400">{stats.highScore.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">STAR BANK</span>
            <span className="font-arcade text-xl md:text-2xl text-amber-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats.starsInBank}
            </span>
          </div>
        </div>

        {/* Current Equipped Gear Card */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-slate-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl border-2 border-white/20 flex items-center justify-center font-arcade text-xl text-white font-black shadow-inner"
              style={{ backgroundColor: selectedOutfit.suitColor }}
            >
              #7
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedOutfit.name}</span>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded font-black">
                  EQUIPPED
                </span>
              </div>
              <div className="text-xs text-slate-400">{selectedOutfit.title}</div>
            </div>
          </div>
          <button
            onClick={onOpenShop}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/30 transition"
          >
            Change Gear
          </button>
        </div>

        {/* Action Grid Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          <button
            onClick={onOpenShop}
            className="py-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold">GYM SHOP</span>
          </button>
          <button
            onClick={onOpenMissions}
            className="py-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold">MISSIONS</span>
          </button>
          <button
            onClick={onOpenTrickGuide}
            className="py-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-bold">HOW TO PLAY</span>
          </button>
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 hover:to-rose-400 text-slate-950 font-arcade text-xl tracking-wider shadow-[0_0_28px_rgba(250,204,21,0.55)] transition transform active:scale-95 flex items-center justify-center gap-2 mb-2"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>START HUSTLE!</span>
        </button>

        <button
          onClick={onOpenTrophyRoom}
          className="text-xs text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-1.5 py-1"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>View Henry's Trophy Room</span>
        </button>
      </div>
    </div>
  );
};
