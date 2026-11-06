/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
  onActionTriggered?: (action: 'STEER' | 'JUMP' | 'SLIDE' | 'TRICK') => void;
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
  onActionTriggered,
}) => {
  const lastTapRef = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasTriggeredSwipe = useRef<boolean>(false);
  const prevStarCount = useRef<number>(starCount);

  // Allow players to collapse corner buttons for pure Swipe-Anywhere mode
  const [buttonsCollapsed, setButtonsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hub_hustle_hide_buttons') === 'true';
    } catch {
      return false;
    }
  });

  // Touch sensitivity settings: ULTRA = 8px, HIGH = 14px, NORMAL = 22px
  const [sensitivity] = useState<'ULTRA' | 'HIGH' | 'NORMAL'>(() => {
    try {
      const saved = localStorage.getItem('hub_hustle_touch_sens');
      if (saved === 'ULTRA' || saved === 'HIGH' || saved === 'NORMAL') return saved;
    } catch {
      // Fallback
    }
    return 'ULTRA';
  });

  const getMinSwipeDist = useCallback(() => {
    switch (sensitivity) {
      case 'ULTRA':
        return 8;
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
      triggerHaptic(10);
    }
    prevStarCount.current = starCount;
  }, [starCount, triggerHaptic]);

  const handleLeftAction = useCallback(() => {
    soundManager.initContext();
    if (isInverted) {
      onRight();
    } else {
      onLeft();
    }
    triggerHaptic(14);
    onActionTriggered?.('STEER');
  }, [isInverted, onLeft, onRight, triggerHaptic, onActionTriggered]);

  const handleRightAction = useCallback(() => {
    soundManager.initContext();
    if (isInverted) {
      onLeft();
    } else {
      onRight();
    }
    triggerHaptic(14);
    onActionTriggered?.('STEER');
  }, [isInverted, onLeft, onRight, triggerHaptic, onActionTriggered]);

  // Jump: distinctive punchy 25ms haptic pulse
  const handleJumpAction = useCallback(() => {
    soundManager.initContext();
    onJump();
    triggerHaptic(25);
    onActionTriggered?.('JUMP');
  }, [onJump, triggerHaptic, onActionTriggered]);

  // Slide: smooth dual 18ms-25ms-18ms slide rumble
  const handleSlideAction = useCallback(() => {
    soundManager.initContext();
    onSlide();
    triggerHaptic([18, 25, 18]);
    onActionTriggered?.('SLIDE');
  }, [onSlide, triggerHaptic, onActionTriggered]);

  const handleTrickAction = useCallback(() => {
    soundManager.initContext();
    onTrick();
    triggerHaptic(20);
    onActionTriggered?.('TRICK');
  }, [onTrick, triggerHaptic, onActionTriggered]);

  const toggleCollapseButtons = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    setButtonsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('hub_hustle_hide_buttons', next ? 'true' : 'false');
      } catch {
        // Fallback
      }
      return next;
    });
  };

  // Continuous touch & swipe-anywhere gesture detection
  useEffect(() => {
    const minSwipeDist = getMinSwipeDist();

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('[role="button"]')) return;

      soundManager.initContext();
      if (e.touches.length >= 1) {
        const touch = e.touches[0];
        touchStartPos.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        hasTriggeredSwipe.current = false;

        // Double-tap anywhere on screen summons hoverboard shield
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          onDeployBoard();
          triggerHaptic(20);
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }

      if (!touchStartPos.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;

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
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        hasTriggeredSwipe.current = true;
      }
    };

    const handleTouchEnd = () => {
      if (!hasTriggeredSwipe.current && touchStartPos.current) {
        const elapsed = Date.now() - touchStartPos.current.time;
        if (elapsed < 300) {
          const tapX = touchStartPos.current.x;
          const tapY = touchStartPos.current.y;
          const width = window.innerWidth;
          const height = window.innerHeight;

          if (tapY < height * 0.32) {
            handleJumpAction();
          } else if (tapY > height * 0.85 && tapX > width * 0.35 && tapX < width * 0.65) {
            handleSlideAction();
          } else if (tapX < width * 0.5) {
            handleLeftAction();
          } else {
            handleRightAction();
          }
        }
      }

      touchStartPos.current = null;
      hasTriggeredSwipe.current = false;
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
          if (e.clientY < height * 0.32) {
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
  }, [getMinSwipeDist, handleJumpAction, handleLeftAction, handleRightAction, handleSlideAction, onDeployBoard, triggerHaptic]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none touch-none flex flex-col justify-end px-safe pb-safe">
      {/* Bottom Corner Ergonomic Dock — See-Through Surfaces Keep Track & Henry 100% Visible */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 pb-1 flex flex-col items-center">
        {!buttonsCollapsed && (
          <div className="w-full flex items-end justify-between gap-2 mb-1.5">
            {/* Left Corner Pad: Steer Left & Spin */}
            <div className="pointer-events-auto flex items-end gap-2">
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleLeftAction();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 active:bg-sky-500/50 border-2 border-sky-400/75 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-lg cursor-pointer touch-manipulation select-none"
                aria-label="Steer Left"
              >
                <ArrowLeft className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3] text-sky-300" />
                <span className="text-[10px] font-black tracking-wide text-sky-100">LEFT</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleTrickAction();
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 active:bg-purple-500/50 border-2 border-purple-400/75 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-lg cursor-pointer touch-manipulation select-none"
                aria-label="Spin Trick"
              >
                <Zap className="w-6 h-6 stroke-[2.5] text-yellow-300" />
                <span className="text-[9px] font-black text-purple-100 mt-0.5">SPIN 🤸</span>
              </button>
            </div>

            {/* Center: Optional Shield Button only when available */}
            {boardsAvailable > 0 && !isBoardActive && (
              <div className="pointer-events-auto mb-1">
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    soundManager.initContext();
                    onDeployBoard();
                    triggerHaptic(20);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-slate-950/55 hover:bg-cyan-950/80 active:scale-95 transition-transform flex items-center gap-1.5 text-cyan-200 font-black text-xs border-2 border-cyan-400/80 shadow-lg cursor-pointer touch-manipulation whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 text-cyan-300" />
                  <span>SHIELD 🛹 ({boardsAvailable})</span>
                </button>
              </div>
            )}

            {/* Right Corner Pad: Jump, Roll & Steer Right */}
            <div className="pointer-events-auto flex items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleJumpAction();
                  }}
                  className="w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 active:bg-emerald-500/50 border-2 border-emerald-400/75 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-lg cursor-pointer touch-manipulation select-none"
                  aria-label="Jump"
                >
                  <ArrowUp className="w-6 h-6 stroke-[3] text-emerald-300" />
                  <span className="text-[9px] font-black text-emerald-100 leading-none">JUMP</span>
                </button>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleSlideAction();
                  }}
                  className="w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 active:bg-amber-500/50 border-2 border-amber-400/75 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-lg cursor-pointer touch-manipulation select-none"
                  aria-label="Roll and Duck"
                >
                  <ArrowDown className="w-6 h-6 stroke-[3] text-amber-300" />
                  <span className="text-[9px] font-black text-amber-100 leading-none">ROLL</span>
                </button>
              </div>

              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleRightAction();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 active:bg-sky-500/50 border-2 border-sky-400/75 active:scale-95 transition-transform flex flex-col items-center justify-center text-white shadow-lg cursor-pointer touch-manipulation select-none"
                aria-label="Steer Right"
              >
                <ArrowRight className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3] text-sky-300" />
                <span className="text-[10px] font-black tracking-wide text-sky-100">RIGHT</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Zen / Swipe Mode Bar */}
        <button
          onClick={toggleCollapseButtons}
          className="pointer-events-auto px-3 py-0.5 rounded-full bg-slate-950/60 hover:bg-slate-900/80 border border-slate-700/70 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition cursor-pointer"
          title={buttonsCollapsed ? 'Show Touch Buttons' : 'Hide Buttons (Swipe Anywhere Mode)'}
        >
          {buttonsCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-yellow-400" />
              <span>Show Touch Buttons (Swipe Anywhere Active)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>Hide Buttons (Swipe Mode)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
