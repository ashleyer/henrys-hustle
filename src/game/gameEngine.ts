/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  GameStatus,
  Lane,
  ObstacleData,
  CollectibleData,
  ActivePowerUp,
  PowerUpType,
  TrickFeedback,
  GameStats,
  CharacterOutfit,
  ChalkBoardItem,
  Mission,
  CustomCharacterProfile,
  EducationalTrivia
} from '../types/game';
import { HenryCharacter } from './character';
import { TrackManager, LANE_POSITIONS } from './trackManager';
import { soundManager } from '../audio/soundManager';
import { MBTA_STATIONS, EDUCATIONAL_TRIVIA, MBTAStation } from '../data/educationalContent';

export const OUTFITS: CharacterOutfit[] = [
  {
    id: 'boston_t_conductor',
    name: 'Boston T Conductor',
    title: 'MBTA Track Champion',
    description: 'Iconic MBTA Forest Green & Silver uniform with Green, Red & Orange line trims!',
    historyNote: 'Celebrates America’s very first subway system, built in Boston in 1897!',
    jerseyText: '7',
    suitColor: '#15803d',
    trimColor: '#facc15',
    shoesColor: '#ef4444',
    headbandColor: '#15803d',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'team_henry',
    name: 'Team Henry #7',
    title: 'The Hometown Gymnast',
    description: 'Official royal blue & gold gymnastics uniform. Speed, precision, and championship heart!',
    jerseyText: '7',
    suitColor: '#1d4ed8',
    trimColor: '#facc15',
    shoesColor: '#ef4444',
    headbandColor: '#f59e0b',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'fenway_monster',
    name: 'Fenway Green Monster',
    title: 'Boston Ballpark Acrobat',
    description: 'Vibrant green and crisp white, inspired by Fenway Park’s legendary left-field wall!',
    historyNote: 'Fenway Park opened in 1912 and is the oldest active ballpark in Major League Baseball.',
    jerseyText: '7',
    suitColor: '#166534',
    trimColor: '#ffffff',
    shoesColor: '#ef4444',
    headbandColor: '#166534',
    unlocked: false,
    cost: 50,
  },
  {
    id: 'olympic_gold',
    name: 'Olympic Gold Champion',
    title: 'World Champion',
    description: 'Shining Olympic gold and pristine white. Fit for a Perfect 10.0 gymnastics routine!',
    jerseyText: '7',
    suitColor: '#eab308',
    trimColor: '#ffffff',
    shoesColor: '#fbbf24',
    headbandColor: '#ffffff',
    unlocked: false,
    cost: 80,
  },
  {
    id: 'freedom_trail',
    name: 'Freedom Trail Pioneer',
    title: 'Revolutionary Tumbler',
    description: 'Colonial navy, brass gold, and red accents honoring Paul Revere and the Boston patriots.',
    historyNote: 'The 2.5-mile Freedom Trail links 16 historic Boston sites from Boston Common to Bunker Hill.',
    jerseyText: '7',
    suitColor: '#1e3a8a',
    trimColor: '#dc2626',
    shoesColor: '#f59e0b',
    headbandColor: '#1e3a8a',
    unlocked: false,
    cost: 110,
  },
  {
    id: 'back_bay_varsity',
    name: 'Back Bay Sprinter 02116',
    title: 'Copley Square Marathoner',
    description: 'Deep navy and crimson collegiate leotard celebrating the famous Boston Marathon finish line!',
    historyNote: 'The Boston Marathon has finished on Boylston Street in Copley Square (02116) since 1986!',
    jerseyText: '7',
    suitColor: '#312e81',
    trimColor: '#e11d48',
    shoesColor: '#38bdf8',
    headbandColor: '#312e81',
    unlocked: false,
    cost: 140,
  },
  {
    id: 'neon_acrobat',
    name: 'Neon Acrobat',
    title: 'Cyber Tumbler',
    description: 'High-energy cyber electric teal and violet glow for high-speed night track hustling!',
    jerseyText: '7',
    suitColor: '#06b6d4',
    trimColor: '#a855f7',
    shoesColor: '#ec4899',
    headbandColor: '#06b6d4',
    unlocked: false,
    cost: 175,
  },
];

export const CHALK_BOARDS: ChalkBoardItem[] = [
  {
    id: 'green_line_express',
    name: 'Green Line Express',
    description: 'Forest green MBTA hover-deck with emergency crash protection.',
    boardColor: '#15803d',
    trailColor: '#86efac',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'red_line_rocket',
    name: 'Red Line Rocket',
    description: 'Blazing crimson hover-deck inspired by the high-speed Red Line.',
    boardColor: '#dc2626',
    trailColor: '#fca5a5',
    unlocked: false,
    cost: 60,
  },
  {
    id: 'solar_flare',
    name: 'Golden State House',
    description: 'Gleaming 24K gold board modeled after the Massachusetts State House dome.',
    boardColor: '#f59e0b',
    trailColor: '#fef08a',
    unlocked: false,
    cost: 120,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_backflip',
    title: 'Flip Master',
    description: 'Perform 3 mid-air gymnastics backflips',
    current: 0,
    target: 3,
    completed: false,
    claimed: false,
    rewardStars: 30,
  },
  {
    id: 'm_vault',
    title: 'Hurdle Hunter',
    description: 'Vault over 2 low hurdles',
    current: 0,
    target: 2,
    completed: false,
    claimed: false,
    rewardStars: 25,
  },
  {
    id: 'm_station',
    title: 'Back Bay Runner',
    description: 'Reach Copley Square Station (750m)',
    current: 0,
    target: 750,
    completed: false,
    claimed: false,
    rewardStars: 50,
  },
  {
    id: 'm_stars',
    title: 'Star Stash',
    description: 'Collect 50 stars in a single run',
    current: 0,
    target: 50,
    completed: false,
    claimed: false,
    rewardStars: 35,
  },
];

export class GameEngine {
  public status: GameStatus = 'MENU';
  public henry: HenryCharacter;
  public trackManager: TrackManager;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Player physics
  public currentLane: Lane = 0;
  public targetX: number = 0;
  public posX: number = 0;
  public posY: number = 0;
  public posZ: number = 0;
  public velocityY: number = 0;
  public isGrounded: boolean = true;
  public isRolling: boolean = false;
  public rollTimer: number = 0;
  public groundHeight: number = 0;
  public invulnerabilityTimer: number = 0;

  // Speeds
  public baseSpeed: number = 18.0;
  public currentSpeed: number = 18.0;
  public gravity: number = -40.0;
  public normalJumpSpeed: number = 13.0;

  // Camera Shake
  public cameraShakeTime: number = 0;
  public cameraShakeMagnitude: number = 0;

  // Power-ups
  public activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // Stats
  public stats: GameStats = {
    score: 0,
    distance: 0,
    currentStation: 'Park Street Station (1897)',
    starsCollected: 0,
    starsInBank: 0,
    tricksPerformed: 0,
    perfectTens: 0,
    vaultsPerformed: 0,
    springboardLaunches: 0,
    highScore: 0,
    highestDistance: 0,
    totalRuns: 0,
    boardsAvailable: 3,
    activeBoardActive: false,
    boardTimeRemaining: 0,
    collectedLetters: { H: false, E: false, N: false, R: false, Y: false },
  };

  public missions: Mission[] = [...INITIAL_MISSIONS];
  public currentOutfit: CharacterOutfit = OUTFITS[0];
  public currentBoard: ChalkBoardItem = CHALK_BOARDS[0];
  public customProfile: CustomCharacterProfile = {
    name: 'Henry',
    hairStyle: 'SPIKY',
    hairColor: '#7c4722',
    skinTone: '#ffdfc4',
    eyeColor: '#0284c7',
    headbandColor: '#15803d',
    outfitId: 'boston_t_conductor',
    shoesColor: '#ef4444',
    wristGripColor: '#ffffff',
  };

  // Trivia tracker
  private triggeredTriviaIds: Set<string> = new Set();

  // Callbacks
  public onTrick?: (trick: TrickFeedback) => void;
  public onStatsChange?: (stats: GameStats) => void;
  public onPowerUpsChange?: (powerUps: ActivePowerUp[]) => void;
  public onStatusChange?: (status: GameStatus) => void;
  public onMissionUpdate?: (missions: Mission[]) => void;
  public onTriviaUnlocked?: (trivia: EducationalTrivia) => void;
  public onStationReached?: (station: MBTAStation) => void;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    this.loadSavedData();

    this.trackManager = new TrackManager(this.scene);
    this.henry = new HenryCharacter(this.currentOutfit, this.customProfile);
    this.scene.add(this.henry.group);

    this.resetPlayerPosition();
  }

  private loadSavedData() {
    try {
      const savedHigh = localStorage.getItem('hub_hustle_high_score');
      if (savedHigh) this.stats.highScore = parseInt(savedHigh, 10) || 0;

      const savedBank = localStorage.getItem('hub_hustle_bank');
      if (savedBank) this.stats.starsInBank = parseInt(savedBank, 10) || 0;

      const savedBoards = localStorage.getItem('hub_hustle_boards');
      if (savedBoards) this.stats.boardsAvailable = parseInt(savedBoards, 10) || 3;

      const savedProfile = localStorage.getItem('hub_hustle_profile');
      if (savedProfile) {
        this.customProfile = JSON.parse(savedProfile);
      }

      const savedOutfit = localStorage.getItem('hub_hustle_outfit');
      if (savedOutfit) {
        const found = OUTFITS.find(o => o.id === savedOutfit);
        if (found) this.currentOutfit = found;
      }
    } catch {
      // LocalStorage fallback
    }
  }

  public saveProgress() {
    try {
      localStorage.setItem('hub_hustle_high_score', this.stats.highScore.toString());
      localStorage.setItem('hub_hustle_bank', this.stats.starsInBank.toString());
      localStorage.setItem('hub_hustle_boards', this.stats.boardsAvailable.toString());
      localStorage.setItem('hub_hustle_profile', JSON.stringify(this.customProfile));
      localStorage.setItem('hub_hustle_outfit', this.currentOutfit.id);
    } catch {
      // Ignore
    }
  }

  private resetPlayerPosition() {
    this.currentLane = 0;
    this.targetX = 0;
    this.posX = 0;
    this.posY = 0;
    this.posZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isRolling = false;
    this.groundHeight = 0;
    this.invulnerabilityTimer = 0;
    this.stats.activeBoardActive = false;
    this.stats.boardTimeRemaining = 0;
    this.henry.setBoardActive(false);
    this.henry.setSpringShoesActive(false);
    this.henry.setFlyingActive(false);
    this.henry.group.position.set(0, 0, 0);
  }

  public setCustomProfile(profile: CustomCharacterProfile) {
    this.customProfile = { ...profile };
    this.henry.applyCustomProfile(profile);

    const outfit = OUTFITS.find(o => o.id === profile.outfitId);
    if (outfit) {
      this.currentOutfit = outfit;
      this.henry.applyOutfit(outfit);
    }
    this.saveProgress();
  }

  public setOutfit(outfit: CharacterOutfit) {
    this.currentOutfit = outfit;
    this.customProfile.outfitId = outfit.id;
    this.henry.applyOutfit(outfit);
    this.saveProgress();
  }

  public setBoard(board: ChalkBoardItem) {
    this.currentBoard = board;
  }

  public startGame() {
    this.status = 'PLAYING';
    this.currentSpeed = this.baseSpeed;
    this.stats.score = 0;
    this.stats.distance = 0;
    this.stats.currentStation = 'Park Street Station (1897)';
    this.stats.starsCollected = 0;
    this.stats.tricksPerformed = 0;
    this.stats.perfectTens = 0;
    this.stats.vaultsPerformed = 0;
    this.stats.springboardLaunches = 0;
    this.stats.collectedLetters = { H: false, E: false, N: false, R: false, Y: false };
    this.triggeredTriviaIds.clear();
    this.activePowerUps.clear();

    this.missions.forEach(m => {
      m.current = 0;
      m.completed = false;
    });

    this.trackManager.reset();
    this.resetPlayerPosition();
    this.henry.triggerAnimation('RUN');

    soundManager.startRunnerMusic();
    if (this.onStatusChange) this.onStatusChange(this.status);
    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
    if (this.onPowerUpsChange) this.onPowerUpsChange([]);
    if (this.onMissionUpdate) this.onMissionUpdate([...this.missions]);
  }

  public pauseGame() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      soundManager.stopRunnerMusic();
      if (this.onStatusChange) this.onStatusChange(this.status);
    }
  }

  public resumeGame() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      soundManager.startRunnerMusic();
      if (this.onStatusChange) this.onStatusChange(this.status);
    }
  }

  // --- CONTROLS ---

  public moveLeft() {
    if (this.status !== 'PLAYING') return;
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];
      soundManager.playLaneSwitch();

      if (!this.isGrounded && !this.activePowerUps.has('SKY_RINGS')) {
        this.performGymnasticsTrick('AERIAL_CARTWHEEL', 'EPIC TWIST!', 160);
      }
    }
  }

  public moveRight() {
    if (this.status !== 'PLAYING') return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];
      soundManager.playLaneSwitch();

      if (!this.isGrounded && !this.activePowerUps.has('SKY_RINGS')) {
        this.performGymnasticsTrick('AERIAL_CARTWHEEL', 'EPIC TWIST!', 160);
      }
    }
  }

  public jump() {
    if (this.status !== 'PLAYING') return;

    const nearHurdle = this.findNearbyHurdle(3.4);
    if (nearHurdle) {
      this.performVault(nearHurdle);
      return;
    }

    if (this.isGrounded) {
      const hasSpringShoes = this.activePowerUps.has('SPRING_SHOES');
      const hasChalk = this.activePowerUps.has('CHALK_BOOST');
      const jumpBoost = hasSpringShoes ? 18.0 : hasChalk ? 15.5 : this.normalJumpSpeed;

      this.velocityY = jumpBoost;
      this.isGrounded = false;
      this.isRolling = false;

      if (hasSpringShoes) {
        soundManager.playSpringJump();
        this.henry.triggerAnimation('FLIP', 0.9);
      } else {
        soundManager.playJump();
        this.henry.triggerAnimation('JUMP', 0.8);
      }
    } else {
      if (!this.activePowerUps.has('SKY_RINGS')) {
        this.performGymnasticsTrick('TUCK_BACKFLIP', 'PERFECT 10!', 220);
      }
    }
  }

  public slide() {
    if (this.status !== 'PLAYING') return;

    if (!this.isGrounded) {
      this.velocityY = -28.0;
      soundManager.playFastDive();
    } else {
      soundManager.playSlide();
    }

    this.isRolling = true;
    this.rollTimer = 0.72;
    this.henry.triggerAnimation('SLIDE', 0.72);
  }

  public deployChalkBoard(): boolean {
    if (this.status !== 'PLAYING') return false;
    if (this.stats.activeBoardActive) return false;
    if (this.stats.boardsAvailable <= 0) return false;

    this.stats.boardsAvailable--;
    this.stats.activeBoardActive = true;
    this.stats.boardTimeRemaining = 30.0;
    this.henry.setBoardActive(true);
    soundManager.playBoardDeploy();
    this.saveProgress();

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
    return true;
  }

  public doTrickButton() {
    if (this.status !== 'PLAYING') return;
    if (!this.isGrounded) {
      const tricks: Array<'TUCK_BACKFLIP' | 'AERIAL_CARTWHEEL' | 'FULL_TWIST'> = [
        'TUCK_BACKFLIP',
        'AERIAL_CARTWHEEL',
        'FULL_TWIST',
      ];
      const chosen = tricks[Math.floor(Math.random() * tricks.length)];
      this.performGymnasticsTrick(chosen, 'STICK IT!', 260);
    } else {
      this.performGymnasticsTrick('AERIAL_CARTWHEEL', 'CHAMPION FLIP!', 140);
    }
  }

  private performGymnasticsTrick(
    type: 'TUCK_BACKFLIP' | 'AERIAL_CARTWHEEL' | 'FULL_TWIST',
    tag: TrickFeedback['tag'],
    points: number
  ) {
    const animMap = {
      TUCK_BACKFLIP: 'FLIP' as const,
      AERIAL_CARTWHEEL: 'CARTWHEEL' as const,
      FULL_TWIST: 'TWIST' as const,
    };

    this.henry.triggerAnimation(animMap[type], 0.65);
    soundManager.playGymnasticsFlip();

    const mult = this.activePowerUps.has('MULTIPLIER') || this.activePowerUps.has('FEVER_MODE') ? 2 : 1;
    const finalBonus = points * mult;

    this.stats.score += finalBonus;
    this.stats.tricksPerformed++;

    if (type === 'TUCK_BACKFLIP') {
      this.updateMissionProgress('m_backflip', 1);
    }

    if (tag === 'PERFECT 10!') {
      this.stats.perfectTens++;
      soundManager.playPerfectTen();
      this.shakeCamera(0.2, 0.15);
    }

    if (this.onTrick) {
      this.onTrick({
        id: `trick_${Date.now()}`,
        name: type === 'TUCK_BACKFLIP' ? 'Triple Tuck Backflip' : type === 'AERIAL_CARTWHEEL' ? 'Aerial Cartwheel' : 'Full Layout Twist',
        bonus: finalBonus,
        timestamp: Date.now(),
        tag,
      });
    }

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private performVault(hurdle: ObstacleData) {
    this.velocityY = 9.2;
    this.isGrounded = false;
    this.henry.triggerAnimation('VAULT', 0.58);
    soundManager.playVault();

    const bonus = 200;
    this.stats.score += bonus;
    this.stats.vaultsPerformed++;
    this.stats.tricksPerformed++;

    this.updateMissionProgress('m_vault', 1);

    if (this.onTrick) {
      this.onTrick({
        id: `vault_${Date.now()}`,
        name: 'Olympic Vault Handspring',
        bonus,
        timestamp: Date.now(),
        tag: 'VAULT MASTER!',
      });
    }
  }

  private findNearbyHurdle(maxDistZ: number): ObstacleData | null {
    return this.trackManager.obstacles.find(obs => {
      if (obs.type === 'HURDLE_LOW' && obs.lane === this.currentLane) {
        const dist = obs.z - this.posZ;
        return dist > 0.4 && dist < maxDistZ;
      }
      return false;
    }) || null;
  }

  private updateMissionProgress(missionId: string, delta: number) {
    const mission = this.missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      mission.current += delta;
      if (mission.current >= mission.target) {
        mission.current = mission.target;
        mission.completed = true;
        this.stats.starsInBank += mission.rewardStars;
        soundManager.playLetter();
        this.saveProgress();
      }
      if (this.onMissionUpdate) this.onMissionUpdate([...this.missions]);
    }
  }

  public shakeCamera(magnitude: number, duration: number) {
    this.cameraShakeMagnitude = magnitude;
    this.cameraShakeTime = duration;
  }

  public update(dt: number) {
    if (this.status !== 'PLAYING') {
      this.henry.update(dt, 0.5, 0, 0);
      return;
    }

    const clampedDt = Math.min(dt, 0.05);

    const isFever = this.activePowerUps.has('FEVER_MODE');
    const isFlying = this.activePowerUps.has('SKY_RINGS');
    const speedBoost = isFever ? 1.45 : isFlying ? 1.3 : 1.0;
    this.currentSpeed = (this.baseSpeed + Math.min(12.0, this.posZ * 0.0035)) * speedBoost;

    const forwardStep = this.currentSpeed * clampedDt;
    this.posZ += forwardStep;
    this.stats.distance = Math.floor(this.posZ);
    this.stats.score += Math.floor(forwardStep * (isFever ? 4 : 2));

    this.updateMissionProgress('m_station', forwardStep);

    // Check MBTA Stations reached
    for (let i = MBTA_STATIONS.length - 1; i >= 0; i--) {
      if (this.stats.distance >= MBTA_STATIONS[i].distance) {
        if (this.stats.currentStation !== MBTA_STATIONS[i].name) {
          this.stats.currentStation = MBTA_STATIONS[i].name;
          if (this.onStationReached) this.onStationReached(MBTA_STATIONS[i]);
        }
        break;
      }
    }

    // Check Educational Trivia triggers
    EDUCATIONAL_TRIVIA.forEach(t => {
      if (this.stats.distance >= t.distanceTrigger && !this.triggeredTriviaIds.has(t.id)) {
        this.triggeredTriviaIds.add(t.id);
        if (this.onTriviaUnlocked) this.onTriviaUnlocked(t);
      }
    });

    this.posX = THREE.MathUtils.damp(this.posX, this.targetX, 18.0, clampedDt);

    if (this.isRolling) {
      this.rollTimer -= clampedDt;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    if (this.stats.activeBoardActive) {
      this.stats.boardTimeRemaining -= clampedDt;
      if (this.stats.boardTimeRemaining <= 0) {
        this.stats.activeBoardActive = false;
        this.stats.boardTimeRemaining = 0;
        this.henry.setBoardActive(false);
      }
    }

    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= clampedDt;
    }

    this.groundHeight = this.calculateSurfaceGroundHeight();

    if (isFlying) {
      this.posY = THREE.MathUtils.damp(this.posY, 9.0, 4.0, clampedDt);
      this.velocityY = 0;
      this.isGrounded = false;
      this.henry.setFlyingActive(true);
    } else {
      this.henry.setFlyingActive(false);

      if (!this.isGrounded || this.posY > this.groundHeight) {
        this.velocityY += this.gravity * clampedDt;
        this.posY += this.velocityY * clampedDt;

        if (this.posY <= this.groundHeight) {
          this.posY = this.groundHeight;
          this.velocityY = 0;
          this.isGrounded = true;

          if (this.henry.getAnimationType() === 'JUMP') {
            this.henry.triggerAnimation('RUN');
          }
        }
      } else {
        this.posY = this.groundHeight;
      }
    }

    this.updatePowerUps(clampedDt);
    this.checkCollisions(clampedDt);
    this.trackManager.update(this.posZ, clampedDt);

    this.henry.group.position.set(this.posX, this.posY, this.posZ);
    this.henry.update(clampedDt, this.currentSpeed / this.baseSpeed, this.posY, this.groundHeight);
    this.updateCamera(clampedDt);

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private calculateSurfaceGroundHeight(): number {
    let surfaceHeight = 0;

    for (const obs of this.trackManager.obstacles) {
      if (obs.lane === this.currentLane) {
        const halfDepth = obs.depth / 2;
        const inZ = this.posZ >= obs.z - halfDepth && this.posZ <= obs.z + halfDepth + 1.0;

        if (inZ) {
          if (obs.type === 'TRAIN_STATIC' || obs.type === 'TRAIN_MOVING') {
            if (this.posY >= 2.1) {
              surfaceHeight = 2.4;
            }
          } else if (obs.type === 'BALANCE_BEAM') {
            if (this.posY >= 1.0) {
              surfaceHeight = 1.2;
              if (this.henry.getAnimationType() === 'RUN') {
                this.henry.triggerAnimation('BALANCE', 0.5);
              }
            }
          } else if (obs.type === 'RAMP') {
            const progress = (this.posZ - (obs.z - halfDepth)) / obs.depth;
            const rampH = THREE.MathUtils.clamp(progress * 2.4, 0, 2.4);
            surfaceHeight = Math.max(surfaceHeight, rampH);
          }
        }
      }
    }

    return surfaceHeight;
  }

  private checkCollisions(dt: number) {
    const playerBox = {
      x: this.posX,
      y: this.posY + (this.isRolling ? 0.35 : 0.8),
      z: this.posZ,
      height: this.isRolling ? 0.7 : 1.6,
    };

    const magnetActive = this.activePowerUps.has('MAGNET') || this.activePowerUps.has('FEVER_MODE');
    const magnetRadius = 7.5;

    this.trackManager.collectibles.forEach(col => {
      if (col.collected) return;

      const colX = LANE_POSITIONS[col.lane];
      const distZ = col.z - playerBox.z;
      const distX = colX - playerBox.x;
      const distY = col.y - playerBox.y;

      if (magnetActive && distZ > -1.0 && distZ < magnetRadius) {
        col.z -= dt * 14;
        if (Math.abs(distZ) < 2.2) {
          this.collectItem(col);
          return;
        }
      }

      if (Math.abs(distZ) < 1.15 && Math.abs(distX) < 1.0 && Math.abs(distY) < 1.6) {
        this.collectItem(col);
      }
    });

    if (this.activePowerUps.has('FEVER_MODE') || this.activePowerUps.has('SKY_RINGS') || this.invulnerabilityTimer > 0) {
      return;
    }

    for (const obs of this.trackManager.obstacles) {
      if (obs.lane !== this.currentLane) continue;

      const halfDepth = obs.depth / 2;
      const obsMinZ = obs.z - halfDepth;
      const obsMaxZ = obs.z + halfDepth;

      if (playerBox.z >= obsMinZ - 0.4 && playerBox.z <= obsMaxZ + 0.2) {
        if (obs.type === 'SPRINGBOARD') {
          if (this.posY <= 0.6) {
            this.velocityY = 20.0;
            this.isGrounded = false;
            soundManager.playSpringJump();
            this.henry.triggerAnimation('FLIP', 0.95);
            this.stats.springboardLaunches++;
            this.shakeCamera(0.25, 0.2);

            const bonus = 250;
            this.stats.score += bonus;
            if (this.onTrick) {
              this.onTrick({
                id: `spring_${Date.now()}`,
                name: 'Springboard Super Launch!',
                bonus,
                timestamp: Date.now(),
                tag: 'TSUKAHARA!',
              });
            }
          }
        } else if (obs.type === 'HURDLE_LOW') {
          if (this.posY < 0.85) {
            this.handleCrashOrShield();
            return;
          }
        } else if (obs.type === 'BARRIER_HIGH') {
          if (!this.isRolling || this.posY > 0.6) {
            this.handleCrashOrShield();
            return;
          }
        } else if (obs.type === 'TRAIN_STATIC' || obs.type === 'TRAIN_MOVING') {
          if (this.posY < 2.2) {
            this.handleCrashOrShield();
            return;
          }
        }
      }
    }
  }

  private handleCrashOrShield() {
    if (this.stats.activeBoardActive) {
      this.stats.activeBoardActive = false;
      this.stats.boardTimeRemaining = 0;
      this.henry.setBoardActive(false);
      this.invulnerabilityTimer = 2.2;
      soundManager.playBoardCrashSave();
      this.shakeCamera(0.35, 0.3);
      return;
    }

    this.handleGameOver();
  }

  private handleGameOver() {
    this.status = 'GAME_OVER';
    soundManager.playCrash();
    soundManager.stopRunnerMusic();
    this.henry.triggerAnimation('STUMBLE', 1.5);
    this.shakeCamera(0.4, 0.4);

    this.stats.starsInBank += this.stats.starsCollected;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
    }
    this.saveProgress();

    if (this.onStatusChange) this.onStatusChange(this.status);
    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private collectItem(col: CollectibleData) {
    col.collected = true;
    this.trackManager.removeCollectibleMesh(col.id);

    if (col.type === 'STAR') {
      soundManager.playStarCollect();
      const mult = this.activePowerUps.has('MULTIPLIER') || this.activePowerUps.has('FEVER_MODE') ? 2 : 1;
      this.stats.starsCollected += mult;
      this.stats.score += 15 * mult;
      this.updateMissionProgress('m_stars', mult);
    } else if (col.type === 'BOSTON_MEDALLION') {
      soundManager.playLetter();
      this.stats.score += 300;
      this.stats.starsCollected += 10;
      // Trigger a random Boston educational fact!
      const unreadTrivia = EDUCATIONAL_TRIVIA[Math.floor(Math.random() * EDUCATIONAL_TRIVIA.length)];
      if (this.onTriviaUnlocked) this.onTriviaUnlocked(unreadTrivia);
    } else if (col.type === 'LETTER' && col.letter) {
      soundManager.playLetter();
      const letterKey = col.letter as 'H' | 'E' | 'N' | 'R' | 'Y';
      this.stats.collectedLetters[letterKey] = true;
      this.stats.score += 200;

      const allLetters = (['H', 'E', 'N', 'R', 'Y'] as const).every(l => this.stats.collectedLetters[l]);
      if (allLetters) {
        this.activateFeverMode();
      }
    } else if (col.type === 'POWERUP' && col.powerUpType) {
      soundManager.playPowerUp();
      this.activatePowerUp(col.powerUpType, 11.0);
    }

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  public activatePowerUp(type: PowerUpType, duration: number) {
    this.activePowerUps.set(type, {
      type,
      remainingTime: duration,
      totalTime: duration,
    });

    if (type === 'SPRING_SHOES') {
      this.henry.setSpringShoesActive(true);
    } else if (type === 'SKY_RINGS') {
      soundManager.setSkyMode(true);
    } else if (type === 'FEVER_MODE') {
      soundManager.setFeverMode(true);
    }

    this.notifyPowerUps();
  }

  private activateFeverMode() {
    this.stats.collectedLetters = { H: false, E: false, N: false, R: false, Y: false };
    soundManager.playPerfectTen();
    this.activatePowerUp('FEVER_MODE', 10.0);
    this.henry.triggerAnimation('VICTORY', 1.0);
    this.shakeCamera(0.2, 0.3);

    if (this.onTrick) {
      this.onTrick({
        id: `fever_${Date.now()}`,
        name: 'SUPER HENRY HUB RUSH!',
        bonus: 600,
        timestamp: Date.now(),
        tag: 'PERFECT 10!',
      });
    }
  }

  private updatePowerUps(dt: number) {
    let changed = false;
    for (const [type, pwr] of this.activePowerUps.entries()) {
      pwr.remainingTime -= dt;
      if (pwr.remainingTime <= 0) {
        this.activePowerUps.delete(type);
        if (type === 'SPRING_SHOES') this.henry.setSpringShoesActive(false);
        if (type === 'SKY_RINGS') soundManager.setSkyMode(false);
        if (type === 'FEVER_MODE') soundManager.setFeverMode(false);
        changed = true;
      }
    }
    if (changed) {
      this.notifyPowerUps();
    }
  }

  private notifyPowerUps() {
    if (this.onPowerUpsChange) {
      this.onPowerUpsChange(Array.from(this.activePowerUps.values()));
    }
  }

  private updateCamera(dt: number) {
    const isFlying = this.activePowerUps.has('SKY_RINGS');
    const targetCamX = this.posX * 0.42;
    const targetCamY = isFlying ? 11.2 : Math.max(3.2, this.posY * 0.4 + 3.2);
    const targetCamZ = this.posZ - 5.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12.0, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10.0, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 18.0, dt);

    if (this.cameraShakeTime > 0) {
      this.cameraShakeTime -= dt;
      const shakeX = (Math.random() - 0.5) * this.cameraShakeMagnitude;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeMagnitude;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
    }

    this.camera.lookAt(
      this.posX * 0.35,
      isFlying ? 9.4 : this.posY + 1.2,
      this.posZ + 6.0
    );
  }
}
