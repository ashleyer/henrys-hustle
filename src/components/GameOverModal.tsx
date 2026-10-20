/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameStats } from '../types/game';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Star, Sparkles, Award, ShoppingBag } from 'lucide-react';
import { AshleyFooter } from './AshleyFooter';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onGoToShop: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onGoToShop,
  onGoToMenu,
}) => {
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  useEffect(() => {
    if (isNewHighScore || stats.score > 400) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#facc15', '#3b82f6', '#ef4444', '#10b981', '#a855f7'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isNewHighScore, stats.score]);

  // Olympic Gymnastics score breakdown
  const difficulty = (8.0 + Math.min(2.0, stats.tricksPerformed * 0.2 + stats.vaultsPerformed * 0.15)).toFixed(1);
  const execution = (9.2 + Math.min(0.8, stats.perfectTens * 0.1)).toFixed(1);
  const totalGymScore = (parseFloat(difficulty) + parseFloat(execution)).toFixed(2);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="max-w-sm w-full bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-black uppercase mb-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>SPECTACULAR RUN, HENRY!</span>
        </div>

        <h2 className="font-arcade text-2xl md:text-3xl text-white">RUN COMPLETE</h2>

        {/* Score display */}
        <div className="my-3.5 w-full bg-slate-950/70 rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">FINAL SCORE</div>
          <div className="font-arcade text-3xl md:text-4xl text-yellow-400 drop-shadow mt-1">
            {stats.score.toLocaleString()}
          </div>
          {isNewHighScore && (
            <div className="text-xs font-black text-rose-400 flex items-center justify-center gap-1 mt-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> NEW HIGH SCORE!
            </div>
          )}

          {/* Gymnastics Judge Card */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-around text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">DIFFICULTY</span>
              <span className="font-bold text-amber-300 text-sm">{difficulty}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EXECUTION</span>
              <span className="font-bold text-emerald-300 text-sm">{execution}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">OLYMPIC TOTAL</span>
              <span className="font-bold text-yellow-400 text-sm">{totalGymScore}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5">
          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">DISTANCE</span>
            <span className="font-bold text-white text-sm">{stats.distance}m</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">STARS WON</span>
            <span className="font-bold text-amber-300 text-sm flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              +{stats.starsCollected}
            </span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">TRICKS</span>
            <span className="font-bold text-cyan-300 text-sm">{stats.tricksPerformed}</span>
          </div>
        </div>

        {/* Station Reached */}
        <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl py-1.5 px-3 mb-4 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
          <span>🚇 Station Reached:</span>
          <span className="text-white">{stats.currentStation}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-arcade text-lg shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 fill-slate-950" />
            <span>PLAY AGAIN!</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={onGoToShop}
              className="flex-1 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>GYM SHOP</span>
            </button>
            <button
              onClick={onGoToMenu}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              MAIN MENU
            </button>
          </div>
        </div>

        <div className="w-full pt-3 mt-3 border-t border-slate-800/80">
          <AshleyFooter />
        </div>
      </div>
    </div>
  );
};
