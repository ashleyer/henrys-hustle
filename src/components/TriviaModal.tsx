/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EducationalTrivia } from '../types/game';
import { Sparkles, X, BookOpen, Award, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TriviaModalProps {
  trivia: EducationalTrivia;
  onClose: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({ trivia, onClose }) => {
  const isBoston = trivia.category === 'BOSTON_HISTORY';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans animate-in fade-in zoom-in-95">
      <div
        className={`max-w-md w-full rounded-3xl p-6 shadow-2xl relative flex flex-col text-center border-2 ${
          isBoston ? 'bg-slate-900 border-emerald-500/60' : 'bg-slate-900 border-amber-500/60'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mx-auto mb-2 bg-slate-800 border border-slate-700">
          <span className="text-base">{trivia.icon}</span>
          <span className={isBoston ? 'text-emerald-400' : 'text-amber-400'}>
            {isBoston ? 'BOSTON "HUB" HISTORY' : 'GYMNASTICS ACADEMY'}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-arcade text-xl md:text-2xl text-white leading-tight mt-1">
          {trivia.title}
        </h2>
        <div className="text-xs font-bold text-amber-300 mt-0.5 mb-3">{trivia.subtitle}</div>

        {/* Fun Fact Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left mb-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span>DID YOU KNOW?</span>
          </div>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
            {trivia.funFact}
          </p>
        </div>

        {/* Extra Tidbit */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-left text-xs text-emerald-200 mb-4">
          <span className="font-bold">🌟 Champion Fact: </span>
          <span>{trivia.didYouKnow}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundManager.playVault();
            onClose();
          }}
          className={`w-full py-3.5 rounded-2xl font-arcade text-slate-950 text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${
            isBoston
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300'
              : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>AWESOME, KEEP HUSTLING!</span>
        </button>
      </div>
    </div>
  );
};
