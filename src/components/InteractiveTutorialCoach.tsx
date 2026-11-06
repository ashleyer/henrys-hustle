/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, CheckCircle2 } from 'lucide-react';

export type CoachStep = 'STEER' | 'JUMP' | 'SLIDE' | 'TRICK' | 'DONE';

interface InteractiveTutorialCoachProps {
  activeStep: CoachStep;
  onSkip: () => void;
  onPracticeAction?: (action: 'STEER' | 'JUMP' | 'SLIDE' | 'TRICK') => void;
}

interface StepConfig {
  stepNumber: number;
  emoji: string;
  headline: string;
  kidHint: string;
  accentBorder: string;
}

const STEP_CONFIGS: Record<Exclude<CoachStep, 'DONE'>, StepConfig> = {
  STEER: {
    stepNumber: 1,
    emoji: '👈 👉',
    headline: 'MOVE LEFT OR RIGHT!',
    kidHint: 'Tap LEFT / RIGHT or swipe your finger!',
    accentBorder: 'border-sky-400',
  },
  JUMP: {
    stepNumber: 2,
    emoji: '🦘 ⬆️',
    headline: 'JUMP HIGH!',
    kidHint: 'Tap JUMP or swipe UP to leap!',
    accentBorder: 'border-emerald-400',
  },
  SLIDE: {
    stepNumber: 3,
    emoji: '🏃 ⬇️',
    headline: 'DUCK & ROLL!',
    kidHint: 'Tap ROLL or swipe DOWN to slide under signs!',
    accentBorder: 'border-amber-400',
  },
  TRICK: {
    stepNumber: 4,
    emoji: '🤸 ✨',
    headline: 'DO A SUPER SPIN!',
    kidHint: 'Tap SPIN in the air for bonus stars!',
    accentBorder: 'border-purple-400',
  },
};

export const InteractiveTutorialCoach: React.FC<InteractiveTutorialCoachProps> = ({
  activeStep,
  onSkip,
  onPracticeAction,
}) => {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (activeStep === 'DONE') return;
    setCelebrating(false);
  }, [activeStep]);

  if (activeStep === 'DONE') return null;

  const cfg = STEP_CONFIGS[activeStep];

  return (
    <div className="fixed inset-x-0 top-14 sm:top-16 z-30 flex flex-col items-center px-3 pointer-events-none select-none">
      {/* Compact, High-Visibility Tooltip Banner — Leaves Center Track 100% Clear */}
      <div
        className={`pointer-events-auto max-w-sm w-full bg-slate-950/90 border-2 ${cfg.accentBorder} rounded-3xl px-4 py-2.5 shadow-2xl flex flex-col items-center text-center transition-transform duration-150`}
      >
        {/* Top Row: Step Label + Step Dots + Skip */}
        <div className="w-full flex items-center justify-between gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-300 text-[10px] font-bold">
            STEP {cfg.stepNumber} OF 4
          </span>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-2 rounded-full transition-all ${
                  num === cfg.stepNumber
                    ? 'w-6 bg-yellow-400'
                    : num < cfg.stepNumber
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
          >
            Skip ⏭️
          </button>
        </div>

        {/* Main Kid Visual Cue */}
        <div className="flex items-center justify-center gap-2.5 my-0.5">
          <span className="text-2xl sm:text-3xl animate-bounce-subtle">{cfg.emoji}</span>
          <div className="text-left">
            <div className="font-arcade text-base sm:text-lg text-yellow-300 leading-tight">
              {cfg.headline}
            </div>
            <div className="text-xs font-bold text-white leading-snug">
              {cfg.kidHint}
            </div>
          </div>
        </div>

        {/* Direct Tap-Here Mini Practice Button for 6-Year-Olds */}
        {onPracticeAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCelebrating(true);
              onPracticeAction(activeStep);
            }}
            className="mt-1.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-yellow-400 text-slate-950 font-arcade text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            {celebrating ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>GREAT JOB! ⭐</span>
              </>
            ) : (
              <>
                {activeStep === 'STEER' && <><ArrowLeft className="w-3.5 h-3.5" /><span>TAP HERE TO TRY!</span><ArrowRight className="w-3.5 h-3.5" /></>}
                {activeStep === 'JUMP' && <><ArrowUp className="w-3.5 h-3.5" /><span>TAP HERE TO JUMP!</span></>}
                {activeStep === 'SLIDE' && <><ArrowDown className="w-3.5 h-3.5" /><span>TAP HERE TO ROLL!</span></>}
                {activeStep === 'TRICK' && <><Zap className="w-3.5 h-3.5" /><span>TAP HERE TO SPIN!</span></>}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
