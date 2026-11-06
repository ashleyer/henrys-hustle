/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStats } from '../types/game';
import { Trophy, Award, Star, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface TrophyRoomModalProps {
  stats: GameStats;
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  iconName: string;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ stats, onClose }) => {
  const achievements: Achievement[] = [
    {
      id: 'first_flip',
      title: 'First Backflip',
      description: 'Perform an acrobatic gymnastics flip mid-air',
      unlocked: stats.tricksPerformed >= 1,
      iconName: 'flip',
    },
    {
      id: 'spell_henry',
      title: 'Name in Lights',
      description: 'Spell H-E-N-R-Y and trigger Super Fever Mode',
      unlocked: stats.score >= 300,
      iconName: 'star',
    },
    {
      id: 'perfect_ten',
      title: 'The Perfect 10.0',
      description: 'Stick an Olympic-grade perfect gymnastics landing',
      unlocked: stats.perfectTens >= 1,
      iconName: 'medal',
    },
    {
      id: 'trick_master',
      title: 'Acrobatic Wizard',
      description: 'Perform 10 gymnastics tricks in total',
      unlocked: stats.tricksPerformed >= 10,
      iconName: 'trophy',
    },
    {
      id: 'distance_runner',
      title: 'Metro Marathon',
      description: 'Run over 400 meters in a single hustle',
      unlocked: stats.distance >= 400 || stats.highScore >= 1000,
      iconName: 'distance',
    },
    {
      id: 'star_collector',
      title: 'Star Stash',
      description: 'Gather 50 gold gymnastics stars',
      unlocked: stats.starsCollected >= 50,
      iconName: 'star',
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-6 shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg text-white">HENRY'S TROPHY ROOM</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 mt-2">
          Medals and achievements unlocked by Henry on his city runs!
        </p>

        {/* Achievement list */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border transition flex items-center gap-3 ${
                ach.unlocked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ach.unlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {ach.unlocked ? <Award className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {ach.title}
                  {ach.unlocked && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />}
                </div>
                <div className="text-xs text-slate-400">{ach.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
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
