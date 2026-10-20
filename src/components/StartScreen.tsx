/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterOutfit, GameStats } from '../types/game';
import { OUTFITS } from '../game/gameEngine';
import { Play, Trophy, Sparkles, Check, Lock, Star } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenTrophyRoom: () => void;
  selectedOutfit: CharacterOutfit;
  onSelectOutfit: (outfit: CharacterOutfit) => void;
  stats: GameStats;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenTrophyRoom,
  selectedOutfit,
  onSelectOutfit,
  stats,
}) => {
  const [showOutfits, setShowOutfits] = useState(false);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-yellow-500/50 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Gold Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Year-Old Champion Edition</span>
        </div>

        {/* Title */}
        <h1 className="font-arcade text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 drop-shadow-lg leading-tight">
          HENRY’S HUSTLE
        </h1>
        <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xs font-medium">
          Dodge subway trains, vault over hurdles, and pull off epic gymnastics flips!
        </p>

        {/* High Score & Stars Banner */}
        <div className="flex gap-4 my-5 w-full justify-center">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">HIGH SCORE</span>
            <span className="font-arcade text-xl text-yellow-400">{stats.highScore.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">TOTAL STARS</span>
            <span className="font-arcade text-xl text-amber-300 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats.starsCollected}
            </span>
          </div>
        </div>

        {/* Outfit Selection Drawer */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-slate-800 mb-5">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-slate-300">HENRY'S GYM GEAR</span>
            <button
              onClick={() => setShowOutfits(!showOutfits)}
              className="text-xs text-amber-400 font-semibold hover:underline"
            >
              {showOutfits ? 'Close' : 'Change Leotard'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border-2 border-white/20 flex items-center justify-center font-arcade text-lg text-white font-black shadow-inner"
              style={{ backgroundColor: selectedOutfit.suitColor }}
            >
              #7
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-bold text-white">{selectedOutfit.name}</div>
              <div className="text-[11px] text-slate-400">{selectedOutfit.description}</div>
            </div>
          </div>

          {showOutfits && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
              {OUTFITS.map(outfit => {
                const isSelected = outfit.id === selectedOutfit.id;
                const isUnlocked = outfit.unlocked || stats.starsCollected >= outfit.cost;
                return (
                  <button
                    key={outfit.id}
                    onClick={() => {
                      if (isUnlocked) onSelectOutfit(outfit);
                    }}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-500/10'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                        : 'border-slate-800 bg-slate-900/40 opacity-60'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: outfit.suitColor }}
                    >
                      #7
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-white truncate">{outfit.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {isUnlocked ? (
                          isSelected ? (
                            <span className="text-yellow-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3 inline" /> Active
                            </span>
                          ) : (
                            'Ready'
                          )
                        ) : (
                          <span className="flex items-center gap-0.5 text-amber-300">
                            <Lock className="w-2.5 h-2.5 inline" /> {outfit.cost} ★
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* How to Play Quick Pills */}
        <div className="flex flex-wrap gap-2 justify-center text-[11px] text-slate-400 mb-6 font-medium">
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            ⬅️ ➡️ Lane Change
          </span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            ⬆️ Jump / Vault
          </span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            ⬇️ Forward Roll
          </span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            ⚡ Backflips & Twists
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 hover:to-rose-400 text-slate-950 font-arcade text-xl tracking-wider shadow-[0_0_25px_rgba(250,204,21,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>START HUSTLE!</span>
          </button>

          <button
            onClick={onOpenTrophyRoom}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>HENRY'S GYMNASTICS TROPHIES</span>
          </button>
        </div>
      </div>
    </div>
  );
};
