/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, Sparkles, Sliders } from 'lucide-react';
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
  isInverted?: boolean;
  starCount?: number;
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
  isInverted = false,
  starCount = 0,
}) => {
  const lastTapRef = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasTriggeredSwipe = useRef<boolean>(false);
  const prevStarCount = useRef<number>(starCount);
  const [lastTouchFeedback, setLastTouchFeedback] = useState<string | null>(null);

  // Touch sensitivity settings: ULTRA = 8px, HIGH = 14px, NORMAL = 22px
  const [sensitivity, setSensitivity] = useState<'ULTRA' | 'HIGH' | 'NORMAL'>(() => {
    try {
      const saved = localStorage.getItem('hub_hustle_touch_sens');
      if (saved === 'ULTRA' || saved === 'HIGH' || saved === 'NORMAL') return saved;
    } catch {
      // Fallback
    }
    return 'ULTRA';
  });

  // Touch ripple indicator for tactile kid feedback
  const [touchRipple, setTouchRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const getMinSwipeDist = useCallback(() => {
    switch (sensitivity) {
      case 'ULTRA':
        return 8; // Ultra responsive: even a gentle nudge triggers lane switch!
      case 'HIGH':
        return 14;
      case 'NORMAL':
        return 22;
      default:
        return 8;
    }
  }, [sensitivity]);

  // Short haptic pulses via navigator.vibrate for mobile responsiveness
  const triggerHaptic = useCallback((pattern: number | number[] = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }, []);

  // Trigger crisp haptic vibration when Henry collects a star
  useEffect(() => {
    if (starCount > prevStarCount.current) {
      // Crisp 10ms star collection pulse
      triggerHaptic(10);
    }
    prevStarCount.current = starCount;
  }, [starCount, triggerHaptic]);

  const triggerFeedback = useCallback((label: string, hapticPattern: number | number[] = 15) => {
    setLastTouchFeedback(label);
    triggerHaptic(hapticPattern);
    setTimeout(() => {
      setLastTouchFeedback(curr => (curr === label ? null : curr));
    }, 450);
  }, [triggerHaptic]);

  // Direction handlers:
  // When isInverted is false (normal):
  // Left action triggers onLeft() -> moves to negative X (Screen Left)
  // Right action triggers onRight() -> moves to positive X (Screen Right)
  const handleLeftAction = useCallback(() => {
    soundManager.initContext();
    if (isInverted) {
      onRight();
      triggerFeedback('INVERT: RIGHT ➡️', 14);
    } else {
      onLeft();
      triggerFeedback('LEFT ⬅️', 14);
    }
  }, [isInverted, onLeft, onRight, triggerFeedback]);

  const handleRightAction = useCallback(() => {
    soundManager.initContext();
    if (isInverted) {
      onLeft();
      triggerFeedback('INVERT: LEFT ⬅️', 14);
    } else {
      onRight();
      triggerFeedback('RIGHT ➡️', 14);
    }
  }, [isInverted, onLeft, onRight, triggerFeedback]);

  // Jump: distinctive punchy 25ms haptic pulse
  const handleJumpAction = useCallback(() => {
    soundManager.initContext();
    onJump();
    triggerFeedback('JUMP ⬆️', 25);
  }, [onJump, triggerFeedback]);

  // Slide: smooth dual 15ms-10ms slide rumble
  const handleSlideAction = useCallback(() => {
    soundManager.initContext();
    onSlide();
    triggerFeedback('DUCK 🏃', [18, 25, 18]);
  }, [onSlide, triggerFeedback]);

  const cycleSensitivity = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    setSensitivity(prev => {
      const next = prev === 'ULTRA' ? 'HIGH' : prev === 'HIGH' ? 'NORMAL' : 'ULTRA';
      try {
        localStorage.setItem('hub_hustle_touch_sens', next);
      } catch {
        // Fallback
      }
      triggerFeedback(`SENS: ${next} ⚡`);
      return next;
    });
  };

  // Ultra-sensitive continuous touch & gesture detection (fires immediately in touchmove)
  useEffect(() => {
    const minSwipeDist = getMinSwipeDist();

    const handleTouchStart = (e: TouchEvent) => {
      soundManager.initContext();
      if (e.touches.length >= 1) {
        const touch = e.touches[0];
        touchStartPos.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        hasTriggeredSwipe.current = false;

        // Visual touch ripple
        setTouchRipple({ x: touch.clientX, y: touch.clientY, id: Date.now() });

        // Double-tap anywhere on screen summons hoverboard
        const now = Date.now();
        if (now - lastTapRef.current < 320) {
          onDeployBoard();
          triggerFeedback('BOARD! 🛹');
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent browser default pull-to-refresh or page bouncing
      if (e.cancelable) {
        e.preventDefault();
      }

      if (!touchStartPos.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Trigger IMMEDIATELY while moving finger — no need to lift finger!
      if (absX > minSwipeDist || absY > minSwipeDist) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX < 0) {
            // Finger dragged Left -> steer LEFT
            handleLeftAction();
          } else {
            // Finger dragged Right -> steer RIGHT
            handleRightAction();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            // Finger dragged Up -> JUMP
            handleJumpAction();
          } else {
            // Finger dragged Down -> DUCK
            handleSlideAction();
          }
        }

        // Reset start position to current finger position so player can chain rapid swipes in one touch!
        touchStartPos.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        hasTriggeredSwipe.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // If finger was tapped quickly without swiping, detect Tap-to-Steer!
      if (!hasTriggeredSwipe.current && touchStartPos.current) {
        const elapsed = Date.now() - touchStartPos.current.time;
        if (elapsed < 300) {
          const tapX = touchStartPos.current.x;
          const tapY = touchStartPos.current.y;
          const width = window.innerWidth;
          const height = window.innerHeight;

          // Upper area tap jumps
          if (tapY < height * 0.35) {
            handleJumpAction();
          } else if (tapY > height * 0.85 && tapX > width * 0.35 && tapX < width * 0.65) {
            // Bottom center tap ducks
            handleSlideAction();
          } else if (tapX < width * 0.5) {
            // Left half of screen tap moves LEFT
            handleLeftAction();
          } else {
            // Right half of screen tap moves RIGHT
            handleRightAction();
          }
        }
      }

      touchStartPos.current = null;
      hasTriggeredSwipe.current = false;
      setTimeout(() => setTouchRipple(null), 300);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('[role="button"]')) return;

      soundManager.initContext();
      touchStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
      hasTriggeredSwipe.current = false;
      setTouchRipple({ x: e.clientX, y: e.clientY, id: Date.now() });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !touchStartPos.current) return;
      const deltaX = e.clientX - touchStartPos.current.x;
      const deltaY = e.clientY - touchStartPos.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > minSwipeDist || absY > minSwipeDist) {
        if (absX > absY) {
          if (deltaX < 0) {
            handleLeftAction();
          } else {
            handleRightAction();
          }
        } else {
          if (deltaY < 0) {
            handleJumpAction();
          } else {
            handleSlideAction();
          }
        }
        touchStartPos.current = {
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        };
        hasTriggeredSwipe.current = true;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !touchStartPos.current) return;
      if (!hasTriggeredSwipe.current) {
        const elapsed = Date.now() - touchStartPos.current.time;
        if (elapsed < 350) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          if (e.clientY < height * 0.35) {
            handleJumpAction();
          } else if (e.clientY > height * 0.85 && e.clientX > width * 0.35 && e.clientX < width * 0.65) {
            handleSlideAction();
          } else if (e.clientX < width * 0.5) {
            handleLeftAction();
          } else {
            handleRightAction();
          }
        }
      }
      touchStartPos.current = null;
      hasTriggeredSwipe.current = false;
      setTimeout(() => setTouchRipple(null), 300);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [getMinSwipeDist, handleJumpAction, handleLeftAction, handleRightAction, handleSlideAction, onDeployBoard, triggerFeedback]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none touch-none flex flex-col justify-between p-3 pb-5">
      {/* Visual Touch Ripple Following Player Finger */}
      {touchRipple && (
        <div
          className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full border-2 border-yellow-300/70 bg-yellow-400/20 animate-ping"
          style={{ left: touchRipple.x, top: touchRipple.y }}
        />
      )}

      {/* Visual Direction Toast Banner & Sensitivity Badge */}
      <div className="flex flex-col items-center pt-20 pointer-events-none gap-2">
        {lastTouchFeedback && (
          <div className="animate-in fade-in zoom-in-95 duration-150 px-4 py-1.5 rounded-full bg-slate-900/90 border-2 border-yellow-400 text-yellow-300 font-arcade text-sm font-bold shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            <span>{lastTouchFeedback}</span>
          </div>
        )}

        {/* Quick Sensitivity Switcher */}
        <button
          onClick={cycleSensitivity}
          onPointerDown={cycleSensitivity}
          className="pointer-events-auto px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-700/80 hover:border-yellow-400/70 text-slate-300 hover:text-yellow-300 text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 shadow backdrop-blur-sm cursor-pointer"
          title="Click to toggle touch sensitivity (Ultra, High, Normal)"
        >
          <Sliders className="w-3 h-3 text-yellow-400" />
          <span>TOUCH SENSITIVITY:</span>
          <span className="text-yellow-400 font-black">{sensitivity} ⚡</span>
        </button>
      </div>

      {/* Ergonomic Dual-Thumb Touch Controls */}
      <div className="flex items-end justify-between w-full px-2 sm:px-6 md:px-12 pb-safe">
        {/* Left Thumb: Steer LEFT Button */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              handleLeftAction();
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 hover:bg-blue-500 active:bg-blue-400 border-4 border-blue-200 active:scale-90 transition-transform flex flex-col items-center justify-center text-white shadow-[0_8px_30px_rgba(37,99,235,0.7)] backdrop-blur-md cursor-pointer touch-manipulation select-none"
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-11 h-11 stroke-[3.5]" />
            <span className="text-xs font-black tracking-wider text-blue-100 mt-0.5">LEFT</span>
          </button>
        </div>

        {/* Center: Flip Trick & Chalkboard Summon */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 mb-1">
          {boardsAvailable > 0 && !isBoardActive && (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                soundManager.initContext();
                onDeployBoard();
                triggerFeedback('BOARD! 🛹');
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
              triggerFeedback('FLIP! 🤸');
            }}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 active:scale-90 transition flex items-center gap-2 text-white font-black text-xs sm:text-sm shadow-[0_0_24px_rgba(251,191,36,0.8)] border-2 border-yellow-200 cursor-pointer touch-manipulation"
          >
            <Zap className="w-5 h-5 fill-yellow-200 text-yellow-200 animate-spin" />
            <span>FLIP TRICK! 🤸</span>
          </button>
        </div>

        {/* Right Thumb: Jump, Duck, and Steer RIGHT */}
        <div className="pointer-events-auto flex items-end gap-2.5">
          {/* Action Column: Jump & Duck */}
          <div className="flex flex-col gap-2">
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                handleJumpAction();
              }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 border-3 border-emerald-200 active:scale-90 transition-transform flex flex-col items-center justify-center text-white shadow-[0_6px_20px_rgba(16,185,129,0.6)] backdrop-blur-md cursor-pointer touch-manipulation select-none"
              aria-label="Jump and Vault"
            >
              <ArrowUp className="w-8 h-8 stroke-[3.5] text-white" />
              <span className="text-[10px] font-black text-emerald-100">JUMP ⬆️</span>
            </button>
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                handleSlideAction();
              }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-300 border-3 border-amber-200 active:scale-90 transition-transform flex flex-col items-center justify-center text-white shadow-[0_6px_20px_rgba(245,158,11,0.6)] backdrop-blur-md cursor-pointer touch-manipulation select-none"
              aria-label="Duck and Roll"
            >
              <ArrowDown className="w-8 h-8 stroke-[3.5] text-white" />
              <span className="text-[10px] font-black text-amber-100">DUCK 🏃</span>
            </button>
          </div>

          {/* Steer RIGHT Button (Prominent right thumb target!) */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              handleRightAction();
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 hover:bg-blue-500 active:bg-blue-400 border-4 border-blue-200 active:scale-90 transition-transform flex flex-col items-center justify-center text-white shadow-[0_8px_30px_rgba(37,99,235,0.7)] backdrop-blur-md cursor-pointer touch-manipulation select-none"
            aria-label="Steer Right"
          >
            <ArrowRight className="w-11 h-11 stroke-[3.5]" />
            <span className="text-xs font-black tracking-wider text-blue-100 mt-0.5">RIGHT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
