/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onTrick: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
  onTrick,
}) => {
  // Swipe detection
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDist = 30;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDist) {
          if (deltaX > 0) onRight();
          else onLeft();
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDist) {
          if (deltaY < 0) onJump();
          else onSlide();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onLeft, onRight, onJump, onSlide]);

  return (
    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-between items-end px-4 md:px-8 pointer-events-none select-none">
      {/* Left / Right D-Pad Buttons for Kids */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={onLeft}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900/80 active:bg-blue-600/90 border border-slate-700/80 active:scale-90 transition flex items-center justify-center text-white shadow-xl backdrop-blur-sm"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <button
          onClick={onRight}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900/80 active:bg-blue-600/90 border border-slate-700/80 active:scale-90 transition flex items-center justify-center text-white shadow-xl backdrop-blur-sm"
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Center Trick Button */}
      <div className="pointer-events-auto flex flex-col items-center">
        <button
          onClick={onTrick}
          className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 active:scale-95 transition flex items-center gap-1.5 text-white font-black text-xs md:text-sm shadow-xl border-2 border-yellow-300"
        >
          <Zap className="w-4 h-4 fill-yellow-200 text-yellow-200" />
          <span>GYMNASTICS TRICK</span>
        </button>
      </div>

      {/* Jump & Slide Action Buttons */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={onSlide}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-900/80 active:bg-amber-600 border border-amber-600/50 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-sm"
          aria-label="Slide or Forward Roll"
        >
          <ArrowDown className="w-6 h-6 text-amber-300" />
          <span className="text-[10px] font-bold text-amber-200">ROLL</span>
        </button>
        <button
          onClick={onJump}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-900/80 active:bg-emerald-600 border border-emerald-600/50 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-sm"
          aria-label="Jump or Vault"
        >
          <ArrowUp className="w-6 h-6 text-emerald-300" />
          <span className="text-[10px] font-bold text-emerald-200">VAULT</span>
        </button>
      </div>
    </div>
  );
};
