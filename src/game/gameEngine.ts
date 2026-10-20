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
  CharacterOutfit
} from '../types/game';
import { HenryCharacter } from './character';
import { TrackManager, LANE_POSITIONS } from './trackManager';
import { soundManager } from '../audio/soundManager';

export const OUTFITS: CharacterOutfit[] = [
  {
    id: 'team_henry',
    name: 'Team Henry #7',
    description: 'Official blue and gold gymnastic jersey. Sharp & ready!',
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
    description: 'Shining gold & white leotard for a champion gymnast!',
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
    description: 'Cyber electric teal with bright purple energy glow!',
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
    description: 'Red & gold heroic leotard. Ready to fly high!',
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
  public isAirborneTrickPossible: boolean = false;

  // Game Speeds
  public baseSpeed: number = 17.0;
  public currentSpeed: number = 17.0;
  public gravity: number = -38.0;
  public normalJumpSpeed: number = 12.0;

  // Active Power-ups
  public activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // Stats
  public stats: GameStats = {
    score: 0,
    distance: 0,
    starsCollected: 0,
    tricksPerformed: 0,
    perfectTens: 0,
    highScore: 0,
    highestDistance: 0,
    totalRuns: 0,
    collectedLetters: { H: false, E: false, N: false, R: false, Y: false },
  };

  // Selected Outfit
  public currentOutfit: CharacterOutfit = OUTFITS[0];

  // Callbacks to UI
  public onTrick?: (trick: TrickFeedback) => void;
  public onStatsChange?: (stats: GameStats) => void;
  public onPowerUpsChange?: (powerUps: ActivePowerUp[]) => void;
  public onStatusChange?: (status: GameStatus) => void;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    // Load saved high score from localStorage if available
    try {
      const savedHigh = localStorage.getItem('henrys_hustle_high_score');
      if (savedHigh) this.stats.highScore = parseInt(savedHigh, 10) || 0;
      const savedStars = localStorage.getItem('henrys_hustle_stars');
      if (savedStars) this.stats.starsCollected = parseInt(savedStars, 10) || 0;
    } catch {
      // LocalStorage fallback
    }

    this.trackManager = new TrackManager(this.scene);
    this.henry = new HenryCharacter(this.currentOutfit);
    this.scene.add(this.henry.group);

    this.resetPlayerPosition();
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
    this.henry.group.position.set(0, 0, 0);
  }

  public setOutfit(outfit: CharacterOutfit) {
    this.currentOutfit = outfit;
    this.henry.applyOutfit(outfit);
  }

  public startGame() {
    this.status = 'PLAYING';
    this.currentSpeed = this.baseSpeed;
    this.stats.score = 0;
    this.stats.distance = 0;
    this.stats.collectedLetters = { H: false, E: false, N: false, R: false, Y: false };
    this.activePowerUps.clear();

    this.trackManager.reset();
    this.resetPlayerPosition();
    this.henry.triggerAnimation('RUN');

    soundManager.startRunnerMusic();
    if (this.onStatusChange) this.onStatusChange(this.status);
    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
    if (this.onPowerUpsChange) this.onPowerUpsChange([]);
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

      // Gymnastics side-step / cartwheel flourish if jumping
      if (!this.isGrounded) {
        this.performGymnasticsTrick('CARTWHEEL', 'EPIC TWIST!', 150);
      }
    }
  }

  public moveRight() {
    if (this.status !== 'PLAYING') return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];

      if (!this.isGrounded) {
        this.performGymnasticsTrick('CARTWHEEL', 'EPIC TWIST!', 150);
      }
    }
  }

  public jump() {
    if (this.status !== 'PLAYING') return;

    // Check for nearby hurdle to trigger Olympic VAULT!
    const nearHurdle = this.findNearbyHurdle(3.2);
    if (nearHurdle) {
      this.performVault(nearHurdle);
      return;
    }

    if (this.isGrounded) {
      const jumpBoost = this.activePowerUps.has('CHALK_BOOST') ? 16.5 : this.normalJumpSpeed;
      this.velocityY = jumpBoost;
      this.isGrounded = false;
      this.isRolling = false;
      this.henry.triggerAnimation('JUMP', 0.8);
      soundManager.playJump();
    } else {
      // In air trick: Backflip!
      this.performGymnasticsTrick('BACKFLIP', 'PERFECT 10!', 200);
    }
  }

  public slide() {
    if (this.status !== 'PLAYING') return;

    if (!this.isGrounded) {
      // Fast drop down from mid-air!
      this.velocityY = -24.0;
    }

    this.isRolling = true;
    this.rollTimer = 0.75;
    this.henry.triggerAnimation('SLIDE', 0.75);
    soundManager.playSlide();
  }

  public doTrickButton() {
    if (this.status !== 'PLAYING') return;
    if (!this.isGrounded) {
      // Aerial combo
      const tricks: Array<'BACKFLIP' | 'CARTWHEEL'> = ['BACKFLIP', 'CARTWHEEL'];
      const chosen = tricks[Math.floor(Math.random() * tricks.length)];
      this.performGymnasticsTrick(chosen, 'STICK IT!', 250);
    } else {
      // Ground acrobatic cartwheel
      this.performGymnasticsTrick('CARTWHEEL', 'CHAMPION FLIP!', 120);
    }
  }

  private performGymnasticsTrick(
    type: 'BACKFLIP' | 'CARTWHEEL',
    tag: TrickFeedback['tag'],
    points: number
  ) {
    this.henry.triggerAnimation(type, 0.6);
    soundManager.playGymnasticsFlip();

    const mult = this.activePowerUps.has('MULTIPLIER') || this.activePowerUps.has('FEVER_MODE') ? 2 : 1;
    const finalBonus = points * mult;

    this.stats.score += finalBonus;
    this.stats.tricksPerformed++;
    if (tag === 'PERFECT 10!') {
      this.stats.perfectTens++;
      soundManager.playPerfectTen();
    }

    if (this.onTrick) {
      this.onTrick({
        id: `trick_${Date.now()}`,
        name: type === 'BACKFLIP' ? 'Acrobatic Backflip' : 'Aerial Cartwheel',
        bonus: finalBonus,
        timestamp: Date.now(),
        tag,
      });
    }

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private performVault(hurdle: ObstacleData) {
    this.velocityY = 8.5;
    this.isGrounded = false;
    this.henry.triggerAnimation('VAULT', 0.55);
    soundManager.playVault();

    const bonus = 180;
    this.stats.score += bonus;
    this.stats.tricksPerformed++;

    if (this.onTrick) {
      this.onTrick({
        id: `vault_${Date.now()}`,
        name: 'Olympic Vault Leap',
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

  // --- MAIN TICK / UPDATE LOOP ---

  public update(dt: number) {
    if (this.status !== 'PLAYING') {
      this.henry.update(dt, 0.5);
      return;
    }

    // Cap delta time to prevent physics tunnel when tab un-focuses
    const clampedDt = Math.min(dt, 0.05);

    // Speed progression based on distance
    const isFever = this.activePowerUps.has('FEVER_MODE');
    const speedBoost = isFever ? 1.4 : 1.0;
    this.currentSpeed = (this.baseSpeed + Math.min(10.0, this.posZ * 0.004)) * speedBoost;

    // Advance forward
    const forwardStep = this.currentSpeed * clampedDt;
    this.posZ += forwardStep;
    this.stats.distance = Math.floor(this.posZ);
    this.stats.score += Math.floor(forwardStep * (isFever ? 4 : 2));

    // Smooth horizontal lane transition
    this.posX = THREE.MathUtils.damp(this.posX, this.targetX, 16.0, clampedDt);

    // Roll timer
    if (this.isRolling) {
      this.rollTimer -= clampedDt;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    // Determine current surface ground height (tracks vs train top vs balance beam)
    this.groundHeight = this.calculateSurfaceGroundHeight();

    // Vertical Physics
    if (!this.isGrounded || this.posY > this.groundHeight) {
      this.velocityY += this.gravity * clampedDt;
      this.posY += this.velocityY * clampedDt;

      if (this.posY <= this.groundHeight) {
        this.posY = this.groundHeight;
        this.velocityY = 0;
        this.isGrounded = true;

        // Reset to run animation if finished jump
        if (this.henry.getAnimationType() === 'JUMP') {
          this.henry.triggerAnimation('RUN');
        }
      }
    } else {
      this.posY = this.groundHeight;
    }

    // Update PowerUps timer
    this.updatePowerUps(clampedDt);

    // Check collisions with obstacles & collectibles
    this.checkCollisions();

    // Update track chunk recycling
    this.trackManager.update(this.posZ, clampedDt);

    // Apply Henry character position
    this.henry.group.position.set(this.posX, this.posY, this.posZ);
    this.henry.update(clampedDt, this.currentSpeed / this.baseSpeed);

    // Update Camera (Third-Person follow behind Henry with dynamic slight tilt)
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
          if (obs.type === 'TRAIN_STATIC') {
            // Train rooftop height is ~2.4
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
            // Incline up to train top
            const progress = (this.posZ - (obs.z - halfDepth)) / obs.depth;
            const rampH = THREE.MathUtils.clamp(progress * 2.4, 0, 2.4);
            surfaceHeight = Math.max(surfaceHeight, rampH);
          }
        }
      }
    }

    return surfaceHeight;
  }

  private checkCollisions() {
    const playerBox = {
      x: this.posX,
      y: this.posY + (this.isRolling ? 0.35 : 0.8),
      z: this.posZ,
      radiusX: 0.45,
      height: this.isRolling ? 0.7 : 1.6,
      depth: 0.6,
    };

    // 1. Collectibles
    const magnetActive = this.activePowerUps.has('MAGNET') || this.activePowerUps.has('FEVER_MODE');
    const magnetRadius = 6.0;

    this.trackManager.collectibles.forEach(col => {
      if (col.collected) return;

      const colX = LANE_POSITIONS[col.lane];
      const distZ = col.z - playerBox.z;
      const distX = colX - playerBox.x;
      const distY = col.y - playerBox.y;

      // Magnet pull effect
      if (magnetActive && distZ > -1.0 && distZ < magnetRadius) {
        col.z -= 0.3;
        // Collect if close enough
        if (Math.abs(distZ) < 2.0) {
          this.collectItem(col);
          return;
        }
      }

      // Standard pickup overlap
      if (Math.abs(distZ) < 1.1 && Math.abs(distX) < 1.0 && Math.abs(distY) < 1.5) {
        this.collectItem(col);
      }
    });

    // 2. Obstacles
    if (this.activePowerUps.has('FEVER_MODE')) {
      // Henry is invincible during Fever Mode!
      return;
    }

    for (const obs of this.trackManager.obstacles) {
      if (obs.lane !== this.currentLane) continue;

      const halfDepth = obs.depth / 2;
      const obsMinZ = obs.z - halfDepth;
      const obsMaxZ = obs.z + halfDepth;

      // Is player within Z range of this obstacle?
      if (playerBox.z >= obsMinZ - 0.4 && playerBox.z <= obsMaxZ + 0.2) {
        // Evaluate obstacle type
        if (obs.type === 'SPRINGBOARD') {
          // Launch Henry!
          if (this.posY <= 0.6) {
            this.velocityY = 19.5;
            this.isGrounded = false;
            soundManager.playSpringboard();
            this.henry.triggerAnimation('BACKFLIP', 0.9);

            const bonus = 200;
            this.stats.score += bonus;
            if (this.onTrick) {
              this.onTrick({
                id: `spring_${Date.now()}`,
                name: 'Springboard Super Launch!',
                bonus,
                timestamp: Date.now(),
                tag: 'CHAMPION FLIP!',
              });
            }
          }
        } else if (obs.type === 'HURDLE_LOW') {
          // Low Hurdle (height 1.0)
          // If Henry is above hurdle or jumped, clear it!
          if (this.posY < 0.85) {
            this.handleCrash();
            return;
          }
        } else if (obs.type === 'BARRIER_HIGH') {
          // High Barrier (gap underneath up to 1.1)
          // If Henry is rolling / sliding, he passes! Otherwise crash!
          if (!this.isRolling || this.posY > 0.6) {
            this.handleCrash();
            return;
          }
        } else if (obs.type === 'TRAIN_STATIC') {
          // If Henry is on top of train (posY >= 2.3), he's safe!
          if (this.posY < 2.2) {
            this.handleCrash();
            return;
          }
        }
      }
    }
  }

  private collectItem(col: CollectibleData) {
    col.collected = true;
    this.trackManager.removeCollectibleMesh(col.id);

    if (col.type === 'STAR') {
      soundManager.playCoin();
      const mult = this.activePowerUps.has('MULTIPLIER') || this.activePowerUps.has('FEVER_MODE') ? 2 : 1;
      this.stats.starsCollected += mult;
      this.stats.score += 15 * mult;
    } else if (col.type === 'LETTER' && col.letter) {
      soundManager.playLetter();
      const letterKey = col.letter as 'H' | 'E' | 'N' | 'R' | 'Y';
      this.stats.collectedLetters[letterKey] = true;
      this.stats.score += 150;

      // Check if all letters of HENRY are gathered!
      const allLetters = (['H', 'E', 'N', 'R', 'Y'] as const).every(l => this.stats.collectedLetters[l]);
      if (allLetters) {
        this.activateFeverMode();
      }
    } else if (col.type === 'POWERUP' && col.powerUpType) {
      soundManager.playPowerUp();
      this.activatePowerUp(col.powerUpType, 10.0);
    }

    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private activatePowerUp(type: PowerUpType, duration: number) {
    this.activePowerUps.set(type, {
      type,
      remainingTime: duration,
      totalTime: duration,
    });
    this.notifyPowerUps();
  }

  private activateFeverMode() {
    this.stats.collectedLetters = { H: false, E: false, N: false, R: false, Y: false };
    soundManager.playPerfectTen();
    this.activatePowerUp('FEVER_MODE', 9.0);
    this.henry.triggerAnimation('VICTORY', 1.0);

    if (this.onTrick) {
      this.onTrick({
        id: `fever_${Date.now()}`,
        name: 'SUPER HENRY FEVER MODE!',
        bonus: 500,
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

  private handleCrash() {
    this.status = 'GAME_OVER';
    soundManager.playCrash();
    soundManager.stopRunnerMusic();
    this.henry.triggerAnimation('STUMBLE', 1.5);

    // Save high score & stars
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('henrys_hustle_high_score', this.stats.highScore.toString());
      } catch {
        // Ignore
      }
    }

    try {
      localStorage.setItem('henrys_hustle_stars', this.stats.starsCollected.toString());
    } catch {
      // Ignore
    }

    if (this.onStatusChange) this.onStatusChange(this.status);
    if (this.onStatsChange) this.onStatsChange({ ...this.stats });
  }

  private updateCamera(dt: number) {
    // Authentic Subway Surfers camera angle: behind and slightly above Henry
    const targetCamX = this.posX * 0.45;
    const targetCamY = Math.max(3.2, this.posY * 0.4 + 3.2);
    const targetCamZ = this.posZ - 5.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12.0, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10.0, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 18.0, dt);

    // Look slightly ahead of Henry's head
    this.camera.lookAt(
      this.posX * 0.35,
      this.posY + 1.2,
      this.posZ + 6.0
    );
  }
}
