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
  Mission
} from '../types/game';
import { HenryCharacter } from './character';
import { TrackManager, LANE_POSITIONS } from './trackManager';
import { soundManager } from '../audio/soundManager';

export const OUTFITS: CharacterOutfit[] = [
  {
    id: 'team_henry',
    name: 'Team Henry #7',
    title: 'The Hometown Hero',
    description: 'Official royal blue & gold gymnastics uniform. Speed, precision, and heart!',
    jerseyText: '7',
    suitColor: '#1d4ed8',
    trimColor: '#facc15',
    hairColor: '#7c4722',
    skinColor: '#ffdfc4',
    shoesColor: '#ef4444',
    headbandColor: '#f59e0b',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'gold_champion',
    name: 'Olympic Gold',
    title: 'World Champion',
    description: 'Shining Olympic gold and pristine white. Fit for a Perfect 10 routine!',
    jerseyText: '7',
    suitColor: '#eab308',
    trimColor: '#ffffff',
    hairColor: '#451a03',
    skinColor: '#ffdfc4',
    shoesColor: '#fbbf24',
    headbandColor: '#ffffff',
    unlocked: false,
    cost: 60,
  },
  {
    id: 'neon_acrobat',
    name: 'Neon Acrobat',
    title: 'Cyber Tumbler',
    description: 'High-energy cyber teal and electric purple glow for night track hustling!',
    jerseyText: '7',
    suitColor: '#06b6d4',
    trimColor: '#a855f7',
    hairColor: '#172554',
    skinColor: '#ffdfc4',
    shoesColor: '#ec4899',
    headbandColor: '#06b6d4',
    unlocked: false,
    cost: 120,
  },
  {
    id: 'super_gymnast',
    name: 'Super Gymnast',
    title: 'Track Superhero',
    description: 'Crimson and solar gold hero leotard. Ready to leap over entire metro trains!',
    jerseyText: '7',
    suitColor: '#dc2626',
    trimColor: '#fbbf24',
    hairColor: '#18181b',
    skinColor: '#ffdfc4',
    shoesColor: '#fbbf24',
    headbandColor: '#dc2626',
    unlocked: false,
    cost: 200,
  },
];

export const CHALK_BOARDS: ChalkBoardItem[] = [
  {
    id: 'blue_lightning',
    name: 'Blue Lightning',
    description: 'Standard issue high-speed gymnastics hoverboard with crash protection.',
    boardColor: '#0284c7',
    trailColor: '#38bdf8',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'Blazing gold and orange board with sparkling chalk dust wake.',
    boardColor: '#ea580c',
    trailColor: '#facc15',
    unlocked: false,
    cost: 80,
  },
  {
    id: 'neon_phantom',
    name: 'Neon Phantom',
    description: 'Cyberpunk emerald & violet hover deck that leaves neon light ribbons.',
    boardColor: '#10b981',
    trailColor: '#a855f7',
    unlocked: false,
    cost: 150,
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
    id: 'm_score',
    title: 'City Sprinter',
    description: 'Score 1,500 points in one run',
    current: 0,
    target: 1500,
    completed: false,
    claimed: false,
    rewardStars: 40,
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

  // Player physics state
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

  // Speeds & physics constants
  public baseSpeed: number = 18.0;
  public currentSpeed: number = 18.0;
  public gravity: number = -40.0;
  public normalJumpSpeed: number = 13.0;

  // Camera Shake
  public cameraShakeTime: number = 0;
  public cameraShakeMagnitude: number = 0;

  // Active Power-ups
  public activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // Stats & Progress
  public stats: GameStats = {
    score: 0,
    distance: 0,
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

  // Callbacks
  public onTrick?: (trick: TrickFeedback) => void;
  public onStatsChange?: (stats: GameStats) => void;
  public onPowerUpsChange?: (powerUps: ActivePowerUp[]) => void;
  public onStatusChange?: (status: GameStatus) => void;
  public onMissionUpdate?: (missions: Mission[]) => void;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    // Load saved data
    this.loadSavedData();

    this.trackManager = new TrackManager(this.scene);
    this.henry = new HenryCharacter(this.currentOutfit);
    this.scene.add(this.henry.group);

    this.resetPlayerPosition();
  }

  private loadSavedData() {
    try {
      const savedHigh = localStorage.getItem('henrys_hustle_high_score');
      if (savedHigh) this.stats.highScore = parseInt(savedHigh, 10) || 0;

      const savedBank = localStorage.getItem('henrys_hustle_bank');
      if (savedBank) this.stats.starsInBank = parseInt(savedBank, 10) || 0;

      const savedBoards = localStorage.getItem('henrys_hustle_boards');
      if (savedBoards) this.stats.boardsAvailable = parseInt(savedBoards, 10) || 3;

      const savedOutfit = localStorage.getItem('henrys_hustle_outfit');
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
      localStorage.setItem('henrys_hustle_high_score', this.stats.highScore.toString());
      localStorage.setItem('henrys_hustle_bank', this.stats.starsInBank.toString());
      localStorage.setItem('henrys_hustle_boards', this.stats.boardsAvailable.toString());
      localStorage.setItem('henrys_hustle_outfit', this.currentOutfit.id);
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

  public setOutfit(outfit: CharacterOutfit) {
    this.currentOutfit = outfit;
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
    this.stats.starsCollected = 0;
    this.stats.tricksPerformed = 0;
    this.stats.perfectTens = 0;
    this.stats.vaultsPerformed = 0;
    this.stats.springboardLaunches = 0;
    this.stats.collectedLetters = { H: false, E: false, N: false, R: false, Y: false };
    this.activePowerUps.clear();

    // Reset missions progress for this run
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

      // Mid-air Acrobatic Twist / Roundoff
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

    // Check if near hurdle -> Olympic Vault
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
      // In-air trick: Triple Tuck Backflip
      if (!this.activePowerUps.has('SKY_RINGS')) {
        this.performGymnasticsTrick('TUCK_BACKFLIP', 'PERFECT 10!', 220);
      }
    }
  }

  // Slide or Mid-Air Fast Drop (Subway Surfers signature cancel mechanic)
  public slide() {
    if (this.status !== 'PLAYING') return;

    if (!this.isGrounded) {
      // Cancel jump instantly into fast dive roll!
      this.velocityY = -28.0;
      soundManager.playFastDive();
    } else {
      soundManager.playSlide();
    }

    this.isRolling = true;
    this.rollTimer = 0.72;
    this.henry.triggerAnimation('SLIDE', 0.72);
  }

  // Deploy Hoverboard (Chalk Board)
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

  // --- MAIN UPDATE LOOP ---

  public update(dt: number) {
    if (this.status !== 'PLAYING') {
      this.henry.update(dt, 0.5, 0, 0);
      return;
    }

    const clampedDt = Math.min(dt, 0.05);

    // Speed progression
    const isFever = this.activePowerUps.has('FEVER_MODE');
    const isFlying = this.activePowerUps.has('SKY_RINGS');
    const speedBoost = isFever ? 1.45 : isFlying ? 1.3 : 1.0;
    this.currentSpeed = (this.baseSpeed + Math.min(12.0, this.posZ * 0.0035)) * speedBoost;

    // Advance forward
    const forwardStep = this.currentSpeed * clampedDt;
    this.posZ += forwardStep;
    this.stats.distance = Math.floor(this.posZ);
    this.stats.score += Math.floor(forwardStep * (isFever ? 4 : 2));

    this.updateMissionProgress('m_score', Math.floor(forwardStep * 2));

    // Smooth horizontal lane transition
    this.posX = THREE.MathUtils.damp(this.posX, this.targetX, 18.0, clampedDt);

    // Roll timer
    if (this.isRolling) {
      this.rollTimer -= clampedDt;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    // Board timer
    if (this.stats.activeBoardActive) {
      this.stats.boardTimeRemaining -= clampedDt;
      if (this.stats.boardTimeRemaining <= 0) {
        this.stats.activeBoardActive = false;
        this.stats.boardTimeRemaining = 0;
        this.henry.setBoardActive(false);
      }
    }

    // Invulnerability timer
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= clampedDt;
    }

    // Calculate ground height
    this.groundHeight = this.calculateSurfaceGroundHeight();

    // Vertical Physics / Sky Flight
    if (isFlying) {
      // Sky Rings high flight mode (elevate to Y = 9.0 smoothly)
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

    // Update active powerups
    this.updatePowerUps(clampedDt);

    // Check collisions
    this.checkCollisions(clampedDt);

    // Track chunk recycling
    this.trackManager.update(this.posZ, clampedDt);

    // Update Henry
    this.henry.group.position.set(this.posX, this.posY, this.posZ);
    this.henry.update(clampedDt, this.currentSpeed / this.baseSpeed, this.posY, this.groundHeight);

    // Update Camera
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

    // 1. Collectibles with Smooth Magnet Pull
    const magnetActive = this.activePowerUps.has('MAGNET') || this.activePowerUps.has('FEVER_MODE');
    const magnetRadius = 7.5;

    this.trackManager.collectibles.forEach(col => {
      if (col.collected) return;

      const colX = LANE_POSITIONS[col.lane];
      const distZ = col.z - playerBox.z;
      const distX = colX - playerBox.x;
      const distY = col.y - playerBox.y;

      if (magnetActive && distZ > -1.0 && distZ < magnetRadius) {
        // Curve smoothly towards Henry's chest
        col.z -= dt * 14;
        if (Math.abs(distZ) < 2.2) {
          this.collectItem(col);
          return;
        }
      }

      // Normal overlap
      if (Math.abs(distZ) < 1.15 && Math.abs(distX) < 1.0 && Math.abs(distY) < 1.6) {
        this.collectItem(col);
      }
    });

    // 2. Obstacles
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

  // Crash or Board Shield Protection
  private handleCrashOrShield() {
    if (this.stats.activeBoardActive) {
      // Board saves Henry from crash!
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

    // Bank stars & save high score
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
        name: 'SUPER HENRY FEVER RUSH!',
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

    // Apply Camera Shake if active
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
