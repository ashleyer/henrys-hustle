/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

interface TrickGuideModalProps {
  onClose: () => void;
}

export const TrickGuideModal: React.FC<TrickGuideModalProps> = ({ onClose }) => {
  const guideItems = [
    {
      title: 'Olympic Vault',
      badge: 'VAULT MASTER',
      desc: 'Jump toward low hurdles or pommel horses. Henry will plant his hands and vault cleanly over!',
      icon: '🤸‍♂️',
      controls: 'Tap VAULT or Press W / Up / Space',
    },
    {
      title: 'Triple Backflip',
      badge: 'PERFECT 10',
      desc: 'Tap jump a second time while in mid-air to pull off a 360° gymnastics backflip with score multipliers!',
      icon: '🔄',
      controls: 'Jump twice in mid-air',
    },
    {
      title: 'Aerial Cartwheel & Twist',
      badge: 'EPIC TWIST',
      desc: 'Swipe or press Left/Right while airborne to perform an acrobatic full body twist or aerial cartwheel!',
      icon: '⭐',
      controls: 'Left / Right while jumping',
    },
    {
      title: 'Forward Kip Roll & Fast Drop',
      badge: 'ROLL DUCK',
      desc: 'Slide low under red street barriers. In mid-air, press slide to instantly dive down to the tracks!',
      icon: '⚡',
      controls: 'Tap ROLL or Press S / Down',
    },
    {
      title: 'Chalk-Board Hoverboard',
      badge: 'CRASH SHIELD',
      desc: 'Double-tap anywhere or press Shift to summon your hoverboard! It protects Henry from 1 crash!',
      icon: '🛹',
      controls: 'Double-Tap or Press Shift / Board Button',
    },
    {
      title: 'Super Henry Fever Rush',
      badge: 'WORD HUNT',
      desc: 'Collect the floating letters H-E-N-R-Y along the track to activate invincible rainbow super speed!',
      icon: '🏆',
      controls: 'Spell H-E-N-R-Y',
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-6 shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg text-white">HENRY'S GYMNASTICS GUIDE</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Learn how to pull off Olympic-grade tricks and combos like a champion gymnast!
        </p>

        {/* Moves List */}
        <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1">
          {guideItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl border border-slate-800 bg-slate-800/40 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{item.title}</span>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-black">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-1.5">{item.desc}</p>
                <div className="text-[10px] text-amber-400 font-bold bg-slate-900/60 px-2 py-1 rounded-lg inline-block">
                  👉 {item.controls}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-arcade text-sm transition"
        >
          READY TO HUSTLE!
        </button>
      </div>
    </div>
  );
};
