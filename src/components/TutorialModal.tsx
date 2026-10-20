/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, CheckCircle, X, Play } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TutorialModalProps {
  onStartGame: () => void;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onStartGame, onClose }) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: 'Step 1: Lane Switching on The T',
      desc: 'Boston’s subway has 3 tracks! Dodge parked Green, Red, and Orange Line trains by switching lanes.',
      actionText: 'Swipe Left / Right or Press A / D / Arrow Keys',
      icon: (
        <div className="flex gap-2 text-2xl">
          <ArrowLeft className="w-8 h-8 text-blue-400" />
          <ArrowRight className="w-8 h-8 text-blue-400" />
        </div>
      ),
      tip: 'Stay alert for oncoming moving trains on the tracks!',
    },
    {
      title: 'Step 2: The Olympic Vault',
      desc: 'Low red barriers and pommel horses can be cleared cleanly! Jump toward them and Henry will plant hands and vault over.',
      actionText: 'Swipe Up or Press W / Up / Space',
      icon: <ArrowUp className="w-10 h-10 text-emerald-400" />,
      tip: 'Vaulting gives extra gymnastics execution points!',
    },
    {
      title: 'Step 3: Forward Kip Roll & Fast Drop',
      desc: 'High street signs require sliding under! In mid-air, press slide to instantly cancel your jump into a fast dive roll.',
      actionText: 'Swipe Down or Press S / Down',
      icon: <ArrowDown className="w-10 h-10 text-amber-400" />,
      tip: 'The fast drop is the secret move of pro Subway Surfers!',
    },
    {
      title: 'Step 4: Mid-Air Acrobatic Flips',
      desc: 'While airborne off a jump or springboard, tap jump again to do a 360° backflip, or swipe left/right to do an aerial twist!',
      actionText: 'Jump again or Swipe in mid-air',
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
      tip: 'Pulling off tricks earns "PERFECT 10.0!" judge bonuses.',
    },
    {
      title: 'Step 5: The MBTA Chalk-Board',
      desc: 'Double-tap anywhere on screen or press Shift to deploy your hoverboard! It protects Henry against 1 obstacle crash.',
      actionText: 'Double-Tap Screen or Press Shift',
      icon: <Shield className="w-10 h-10 text-cyan-400" />,
      tip: 'Keep spare boards in your Star Bank from the Gym Shop.',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    soundManager.playVault();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onStartGame();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-6 shadow-2xl relative flex flex-col text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress pills */}
        <div className="flex justify-center gap-1.5 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-yellow-400' : i < step ? 'w-3 bg-emerald-400' : 'w-3 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto my-2 shadow-inner">
          {currentStep.icon}
        </div>

        {/* Content */}
        <h2 className="font-arcade text-xl text-white mt-2">{currentStep.title}</h2>
        <p className="text-xs text-slate-300 my-2 px-2 leading-relaxed">{currentStep.desc}</p>

        {/* Action badge */}
        <div className="bg-yellow-500/10 border border-yellow-400/40 rounded-xl py-2 px-3 text-xs font-bold text-yellow-300 my-2">
          👉 {currentStep.actionText}
        </div>

        {/* Pro Tip */}
        <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-lg p-2 mb-4">
          💡 <span className="text-slate-300 font-semibold">{currentStep.tip}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-slate-950 font-arcade text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            {step === steps.length - 1 ? (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>START RUNNING!</span>
              </>
            ) : (
              <span>NEXT LESSON ({step + 1}/{steps.length})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
