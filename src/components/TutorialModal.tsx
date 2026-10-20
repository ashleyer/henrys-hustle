/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, X, Volume2, Sparkles, Play } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TutorialModalProps {
  onStartGame: () => void;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onStartGame, onClose }) => {
  const [step, setStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const steps = [
    {
      title: 'STEP 1: STEER LEFT & RIGHT! 🚇',
      kidSummary: 'Dodge trains on the tracks!',
      desc: 'Boston has Green, Red, and Orange Line tracks! Move between the 3 lanes to avoid parked and moving trains.',
      howTo: 'Tap LEFT or RIGHT buttons, swipe your finger, or press A / D / Arrow Keys!',
      badgeColor: 'from-blue-500 to-cyan-500',
      icon: (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-2xl font-black">↔️</span>
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </div>
        </div>
      ),
      tip: 'Stay on the open track with lots of shiny gold stars!',
      soundAction: () => soundManager.playLaneSwitch(),
    },
    {
      title: 'STEP 2: JUMP & VAULT! 🤸',
      kidSummary: 'Leap high over hurdles!',
      desc: 'Jump over low red barriers and gymnastics pommel horses! Henry plants his hands and vaults cleanly over obstacles.',
      howTo: 'Tap JUMP ⬆️, swipe UP, or press W / Up Arrow / Spacebar!',
      badgeColor: 'from-emerald-500 to-green-600',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg animate-bounce">
          <ArrowUp className="w-9 h-9 stroke-[3]" />
        </div>
      ),
      tip: 'Vaulting earns extra gymnastics judge points!',
      soundAction: () => soundManager.playVault(),
    },
    {
      title: 'STEP 3: DUCK & ROLL! 🏃',
      kidSummary: 'Slide under tall signs!',
      desc: 'Duck under high yellow subway signs! If you are high in the air, pressing duck will instantly dive-roll you back to the ground!',
      howTo: 'Tap DUCK ⬇️, swipe DOWN, or press S / Down Arrow!',
      badgeColor: 'from-amber-500 to-orange-600',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
          <ArrowDown className="w-9 h-9 stroke-[3]" />
        </div>
      ),
      tip: 'Fast dropping is how pro gymnasts dodge sudden hurdles!',
      soundAction: () => soundManager.playSlide(),
    },
    {
      title: 'STEP 4: DO A BACKFLIP! ✨',
      kidSummary: 'Score a Perfect 10.0!',
      desc: 'While jumping in the air, tap the FLIP TRICK button or swipe left/right to do 360° backflips and aerial cartwheels!',
      howTo: 'Tap "FLIP TRICK 🤸" button or swipe while in the air!',
      badgeColor: 'from-purple-500 to-pink-500',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-spin">
          <Zap className="w-8 h-8 fill-yellow-200 text-yellow-200" />
        </div>
      ),
      tip: 'Flips boost your score multiplier and impress the Olympic judges!',
      soundAction: () => soundManager.playTrickWoosh(),
    },
    {
      title: 'STEP 5: CHALK HOVERBOARD! 🛹',
      kidSummary: 'Your secret crash shield!',
      desc: 'Hop onto your hoverboard! If you accidentally bump into a train or barrier, your board protects you so you keep running!',
      howTo: 'Double-tap the screen, tap "BOARD 🛹", or press Shift!',
      badgeColor: 'from-cyan-500 to-blue-600',
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shadow-lg">
          <Shield className="w-8 h-8 fill-cyan-100 text-white" />
        </div>
      ),
      tip: 'Unlock new MBTA Green & Red Line boards in the Star Shop!',
      soundAction: () => soundManager.playBoardDeploy(),
    },
  ];

  const currentStep = steps[step];

  const handleSpeak = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const speechText = `${currentStep.title}. ${currentStep.kidSummary}. ${currentStep.desc}. How to do it: ${currentStep.howTo}. Tip: ${currentStep.tip}`;
    soundManager.speakText(speechText, () => setIsSpeaking(false));
  };

  const handleNext = () => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
    currentStep.soundAction();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onStartGame();
    }
  };

  const handlePrev = () => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-md w-full bg-slate-900 border-3 border-yellow-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(250,204,21,0.3)] relative flex flex-col text-center">
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
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
          }`}
          title="Read instructions out loud"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isSpeaking ? 'Stop Voice' : '🔊 Read to Me!'}</span>
        </button>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-7 mb-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                soundManager.stopSpeaking();
                setIsSpeaking(false);
                setStep(i);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === step ? 'w-10 bg-yellow-400 shadow-md' : i < step ? 'w-3 bg-emerald-400' : 'w-3 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Big Step Icon Container */}
        <div className="h-20 flex items-center justify-center mx-auto my-1">
          {currentStep.icon}
        </div>

        {/* Title & Kid Summary */}
        <h2 className="font-arcade text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-white mt-1 drop-shadow">
          {currentStep.title}
        </h2>
        <div className="text-sm font-black text-emerald-300 mt-0.5">
          {currentStep.kidSummary}
        </div>

        {/* Instruction Card */}
        <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-3.5 text-left my-3 shadow-inner">
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
            {currentStep.desc}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-amber-400">HOW:</span>
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-xl">
              {currentStep.howTo}
            </span>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-1.5 text-xs text-emerald-200 flex items-center justify-center gap-1.5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
          <span className="font-semibold">{currentStep.tip}</span>
        </div>

        {/* Interactive Sound Test Button */}
        <button
          onClick={currentStep.soundAction}
          className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 py-1.5 px-3 rounded-xl border border-amber-400/30 mb-3 mx-auto flex items-center gap-1.5 cursor-pointer"
        >
          <span>🎵 Test Move Sound!</span>
        </button>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400 hover:from-yellow-300 hover:to-emerald-300 text-slate-950 font-arcade text-base sm:text-lg shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-black"
          >
            {step === steps.length - 1 ? (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>LET'S PLAY! 🚀</span>
              </>
            ) : (
              <span>NEXT STEP ➡️</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
