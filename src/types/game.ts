/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Lane = -1 | 0 | 1;

export type PowerUpType = 'MAGNET' | 'CHALK_BOOST' | 'MULTIPLIER' | 'FEVER_MODE';

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  totalTime: number;
}

export type ObstacleType =
  | 'TRAIN_STATIC'
  | 'TRAIN_MOVING'
  | 'HURDLE_LOW'     // Jump or Vault over!
  | 'BARRIER_HIGH'   // Roll or Slide under!
  | 'SPRINGBOARD'    // Launches Henry high into air for tricks!
  | 'BALANCE_BEAM'   // High beam between tracks!
  | 'RAMP';          // Walkway ramp onto train tops

export interface ObstacleData {
  id: string;
  type: ObstacleType;
  lane: Lane;
  z: number;
  width: number;
  height: number;
  depth: number;
  canVault?: boolean;
  canRollUnder?: boolean;
  isPassed?: boolean;
  hit?: boolean;
}

export interface CollectibleData {
  id: string;
  type: 'STAR' | 'GOLD_MEDAL' | 'CHALK' | 'LETTER' | 'POWERUP';
  lane: Lane;
  z: number;
  y: number;
  collected?: boolean;
  letter?: 'H' | 'E' | 'N' | 'R' | 'Y';
  powerUpType?: PowerUpType;
}

export interface TrickFeedback {
  id: string;
  name: string;
  bonus: number;
  timestamp: number;
  tag: 'PERFECT 10!' | 'STICK IT!' | 'CHAMPION FLIP!' | 'VAULT MASTER!' | 'EPIC TWIST!';
}

export interface CharacterOutfit {
  id: string;
  name: string;
  description: string;
  jerseyText: string;
  suitColor: string;
  trimColor: string;
  hairColor: string;
  skinColor: string;
  shoesColor: string;
  headbandColor: string;
  unlocked: boolean;
  cost: number;
}

export interface Mission {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  reward: number;
}

export interface GameStats {
  score: number;
  distance: number;
  starsCollected: number;
  tricksPerformed: number;
  perfectTens: number;
  highScore: number;
  highestDistance: number;
  totalRuns: number;
  collectedLetters: { [key in 'H' | 'E' | 'N' | 'R' | 'Y']: boolean };
}
