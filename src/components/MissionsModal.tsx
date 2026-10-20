/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mission, GameStats } from '../types/game';
import { CheckCircle2, Award, Star, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MissionsModalProps {
  missions: Mission[];
  stats: GameStats;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ missions, stats, onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-6 shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg text-white">HENRY'S RUN MISSIONS</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Complete gymnastics goals during your runs to earn bonus stars!
        </p>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1">
          {missions.map(m => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition ${
                  m.completed
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.title}</span>
                    {m.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-1 font-arcade text-xs text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>+{m.rewardStars}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 mb-2">{m.description}</div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      m.completed
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                        : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>PROGRESS</span>
                  <span>{m.current} / {m.target} ({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
        >
          BACK TO GAME
        </button>
      </div>
    </div>
  );
};
