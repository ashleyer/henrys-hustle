/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'SHOP'
  | 'CHARACTER_STUDIO'
  | 'MISSIONS'
  | 'LEADERBOARD'
  | 'ACADEMY'
  | 'TUTORIAL';

export type Lane = -1 | 0 | 1;

export type PowerUpType =
  | 'MAGNET'
  | 'SPRING_SHOES'
  | 'CHALK_BOOST'
  | 'SKY_RINGS'      // Fly high above Boston's skyline
  | 'MULTIPLIER'
  | 'FEVER_MODE';

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  totalTime: number;
}

export type BostonMBTALine = 'GREEN' | 'RED' | 'ORANGE' | 'BLUE';

export type ObstacleType =
  | 'TRAIN_STATIC'      // MBTA Green/Red/Orange train car
  | 'TRAIN_MOVING'      // Oncoming MBTA train
  | 'HURDLE_LOW'        // Gymnastics vault table / hurdle
  | 'BARRIER_HIGH'      // MBTA overhead construction barrier
  | 'BARRIER_FULL'      // Track roadblock
  | 'SPRINGBOARD'       // Competition springboard
  | 'BALANCE_BEAM'      // Suede balance beam
  | 'RAMP';             // Ramp onto MBTA train roof

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
  speedZ?: number;
  lineColor?: BostonMBTALine;
}

export interface CollectibleData {
  id: string;
  type: 'STAR' | 'GOLD_MEDAL' | 'LETTER' | 'POWERUP' | 'BOSTON_MEDALLION';
  lane: Lane;
  z: number;
  y: number;
  collected?: boolean;
  letter?: 'H' | 'E' | 'N' | 'R' | 'Y';
  powerUpType?: PowerUpType;
  triviaId?: string;
}

export interface TrickFeedback {
  id: string;
  name: string;
  bonus: number;
  timestamp: number;
  tag: 'PERFECT 10!' | 'STICK IT!' | 'CHAMPION FLIP!' | 'VAULT MASTER!' | 'EPIC TWIST!' | 'TSUKAHARA!';
}

// Character Customization Options
export type HairStyle = 'SPIKY' | 'CURLY' | 'SWEEP' | 'PONYTAIL' | 'BUZZ';

export interface CustomCharacterProfile {
  name: string;
  hairStyle: HairStyle;
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  headbandColor: string;
  outfitId: string;
  shoesColor: string;
  wristGripColor: string;
}

export interface CharacterOutfit {
  id: string;
  name: string;
  title: string;
  description: string;
  historyNote?: string;
  jerseyText: string;
  suitColor: string;
  trimColor: string;
  shoesColor: string;
  headbandColor: string;
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

export interface EducationalTrivia {
  id: string;
  category: 'BOSTON_HISTORY' | 'GYMNASTICS_ACADEMY';
  title: string;
  subtitle: string;
  funFact: string;
  didYouKnow: string;
  icon: string;
  stationName?: string;
  distanceTrigger: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  isLoggedIn: boolean;
  isGoogleAccount: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  distance: number;
  stationReached: string;
  outfitName: string;
  isCurrentUser?: boolean;
  dateStr: string;
}

export interface GameStats {
  score: number;
  distance: number;
  currentStation: string;
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
  speedPace?: 'JUNIOR' | 'PRO';
}
