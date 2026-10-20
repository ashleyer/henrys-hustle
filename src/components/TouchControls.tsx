/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onTrick: () => void;
  onDeployBoard: () => void;
  boardsAvailable: number;
  isBoardActive: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
  onTrick,
  onDeployBoard,
  boardsAvailable,
  isBoardActive,
}) => {
  const lastTapRef = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // High-performance swipe & gesture detection
  useEffect(() => {
    const minSwipeDist = 20;

    const handleTouchStart = (e: TouchEvent) => {
      soundManager.initContext();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartPos.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };

        // Screen-wide double-tap detection for quick hoverboard summon
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          onDeployBoard();
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent browser default overscroll / pull-to-refresh during game
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartPos.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
      const elapsed = Date.now() - touchStartPos.current.time;
      touchStartPos.current = null;

      // Only evaluate if completed in a reasonable swipe gesture window (< 600ms)
      if (elapsed > 650) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        if (absX > minSwipeDist) {
          if (deltaX > 0) onRight();
          else onLeft();
        }
      } else {
        if (absY > minSwipeDist) {
          if (deltaY < 0) onJump();
          else onSlide();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onLeft, onRight, onJump, onSlide, onDeployBoard]);

  return (
    <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-between items-end px-2 sm:px-6 md:px-10 pointer-events-none select-none touch-none pb-safe">
      {/* Left / Right Steering Buttons (Thumb Friendly) */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            soundManager.initContext();
            onLeft();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600/90 active:bg-blue-400 border-2 border-blue-300 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md cursor-pointer touch-manipulation"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
          <span className="text-[10px] font-black tracking-wide text-blue-100">LEFT</span>
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            soundManager.initContext();
            onRight();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600/90 active:bg-blue-400 border-2 border-blue-300 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md cursor-pointer touch-manipulation"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-8 h-8 stroke-[3]" />
          <span className="text-[10px] font-black tracking-wide text-blue-100">RIGHT</span>
        </button>
      </div>

      {/* Center Trick & Hoverboard Buttons */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 pb-1">
        {boardsAvailable > 0 && !isBoardActive && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              soundManager.initContext();
              onDeployBoard();
            }}
            className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-95 transition flex items-center gap-1.5 text-white font-black text-xs sm:text-sm shadow-xl border-2 border-white backdrop-blur-md cursor-pointer animate-pulse touch-manipulation"
          >
            <Shield className="w-4 h-4 text-white fill-white/20" />
            <span>BOARD ({boardsAvailable}) 🛹</span>
          </button>
        )}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            soundManager.initContext();
            onTrick();
          }}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 active:scale-90 transition flex items-center gap-2 text-white font-black text-xs sm:text-sm shadow-[0_0_22px_rgba(251,191,36,0.7)] border-2 border-yellow-200 cursor-pointer touch-manipulation"
        >
          <Zap className="w-5 h-5 fill-yellow-200 text-yellow-200 animate-spin" />
          <span>FLIP TRICK! 🤸</span>
        </button>
      </div>

      {/* Roll & Jump Action Buttons (Right Thumb Friendly) */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            soundManager.initContext();
            onSlide();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/90 active:bg-amber-300 border-2 border-amber-200 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md cursor-pointer touch-manipulation"
          aria-label="Duck and Roll"
        >
          <ArrowDown className="w-8 h-8 stroke-[3] text-white" />
          <span className="text-[10px] font-black tracking-wide text-amber-100">DUCK 🏃</span>
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            soundManager.initContext();
            onJump();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/90 active:bg-emerald-300 border-2 border-emerald-200 active:scale-90 transition flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md cursor-pointer touch-manipulation"
          aria-label="Jump and Vault"
        >
          <ArrowUp className="w-8 h-8 stroke-[3] text-white" />
          <span className="text-[10px] font-black tracking-wide text-emerald-100">JUMP ⬆️</span>
        </button>
      </div>
    </div>
  );
};
