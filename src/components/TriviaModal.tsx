/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EducationalTrivia } from '../types/game';
import { Sparkles, X, BookOpen, Volume2, Check, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TriviaModalProps {
  trivia: EducationalTrivia;
  onClose: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({ trivia, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isBoston = trivia.category === 'BOSTON_HISTORY';

  // Read aloud automatically or on click
  const handleSpeak = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const textToRead = `${trivia.title}! ${trivia.subtitle}. ${trivia.funFact} Fun Fact: ${trivia.didYouKnow}`;
    soundManager.speakText(textToRead, () => setIsSpeaking(false));
  };

  useEffect(() => {
    return () => {
      soundManager.stopSpeaking();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none font-sans animate-in fade-in zoom-in-95">
      <div
        className={`max-w-md w-full rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative flex flex-col text-center border-3 ${
          isBoston ? 'bg-slate-900 border-emerald-400' : 'bg-slate-900 border-amber-400'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Read to Me Button */}
        <button
          onClick={handleSpeak}
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
            isSpeaking
              ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
              : 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50 hover:bg-yellow-400/30'
          }`}
          title="Listen to this fun fact"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isSpeaking ? 'Stop Voice' : '🔊 Read Aloud!'}</span>
        </button>

        {/* Top Category Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mx-auto mt-6 mb-2 bg-slate-800 border border-slate-700 shadow-md">
          <span className="text-xl">{trivia.icon}</span>
          <span className={isBoston ? 'text-emerald-400' : 'text-amber-400'}>
            {isBoston ? 'BOSTON DISCOVERY CARD' : 'GYMNASTICS CHAMPION SECRET'}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-arcade text-xl sm:text-2xl text-white leading-tight mt-1">
          {trivia.title}
        </h2>
        <div className="text-xs sm:text-sm font-black text-amber-300 mt-1 mb-3">
          {trivia.subtitle}
        </div>

        {/* Fun Fact Card */}
        <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-4 text-left mb-3 shadow-inner">
          <div className="text-xs font-black uppercase tracking-wider text-yellow-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>DID YOU KNOW?</span>
          </div>
          <p className="text-sm text-slate-100 leading-relaxed font-medium">
            {trivia.funFact}
          </p>
        </div>

        {/* Extra Tidbit */}
        <div className="bg-emerald-500/10 border border-emerald-400/40 rounded-2xl p-3 text-left text-xs sm:text-sm text-emerald-200 mb-4 flex items-start gap-2">
          <span className="text-lg">⭐</span>
          <div>
            <span className="font-black text-emerald-300">Champion Fact: </span>
            <span className="font-medium">{trivia.didYouKnow}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundManager.stopSpeaking();
            soundManager.playVault();
            onClose();
          }}
          className={`w-full py-3.5 rounded-2xl font-arcade text-slate-950 text-base shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-black ${
            isBoston
              ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300'
              : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300'
          }`}
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>AWESOME! KEEP HUSTLING! 🚀</span>
        </button>
      </div>
    </div>
  );
};
