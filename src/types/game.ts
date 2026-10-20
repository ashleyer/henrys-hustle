/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'SHOP' | 'MISSIONS' | 'SETTINGS';

export type Lane = -1 | 0 | 1;

export type PowerUpType =
  | 'MAGNET'
  | 'SPRING_SHOES'
  | 'CHALK_BOOST'
  | 'SKY_RINGS'      // Jetpack equivalent: fly high above tracks collecting star rings!
  | 'MULTIPLIER'
  | 'FEVER_MODE';

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  totalTime: number;
}

export type GymnasticsTrickType =
  | 'TUCK_BACKFLIP'
  | 'PIKE_VAULT'
  | 'AERIAL_CARTWHEEL'
  | 'FULL_TWIST'
  | 'DOUBLE_LAYOUT'
  | 'TSUKAHARA'
  | 'BALANCE_SPRINT'
  | 'STICK_THE_LANDING';

export type ObstacleType =
  | 'TRAIN_STATIC'
  | 'TRAIN_MOVING'
  | 'HURDLE_LOW'        // Can vault or jump over
  | 'BARRIER_HIGH'      // Must slide / roll under
  | 'BARRIER_FULL'      // Must switch lanes
  | 'SPRINGBOARD'       // Launches high into the air
  | 'BALANCE_BEAM'      // Suede beam running
  | 'RAMP';             // Leads to train rooftop

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
  speedZ?: number;      // For moving oncoming trains
}

export interface CollectibleData {
  id: string;
  type: 'STAR' | 'GOLD_MEDAL' | 'LETTER' | 'POWERUP';
  lane: Lane;
  z: number;
  y: number;
  collected?: boolean;
  letter?: 'H' | 'E' | 'N' | 'R' | 'Y';
  powerUpType?: PowerUpType;
  curveT?: number;      // For smooth magnet bezier pull
}

export interface TrickFeedback {
  id: string;
  name: string;
  bonus: number;
  timestamp: number;
  tag: 'PERFECT 10!' | 'STICK IT!' | 'CHAMPION FLIP!' | 'VAULT MASTER!' | 'EPIC TWIST!' | 'TSUKAHARA!';
}

export interface CharacterOutfit {
  id: string;
  name: string;
  title: string;
  description: string;
  jerseyText: string;
  suitColor: string;
  trimColor: string;
  hairColor: string;
  skinColor: string;
  shoesColor: string;
  headbandColor: string;
  hasCape?: boolean;
  capeColor?: string;
  glowColor?: string;
  unlocked: boolean;
  cost: number;
}

export interface ChalkBoardItem {
  id: string;
  name: string;
  description: string;
  boardColor: string;
  trailColor: string;
  unlocked: boolean;
  cost: number;
}

export interface PowerUpUpgrade {
  level: number;
  maxLevel: number;
  baseDuration: number;
  upgradeCost: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewardStars: number;
}

export interface GameSettings {
  showOnScreenButtons: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
}

export interface GameStats {
  score: number;
  distance: number;
  starsCollected: number;
  starsInBank: number;
  tricksPerformed: number;
  perfectTens: number;
  vaultsPerformed: number;
  springboardLaunches: number;
  highScore: number;
  highestDistance: number;
  totalRuns: number;
  boardsAvailable: number;
  activeBoardActive: boolean;
  boardTimeRemaining: number;
  collectedLetters: { [key in 'H' | 'E' | 'N' | 'R' | 'Y']: boolean };
}
