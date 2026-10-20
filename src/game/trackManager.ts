/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ObstacleData, CollectibleData, Lane, PowerUpType } from '../types/game';

export const LANE_WIDTH = 2.2;
export const LANE_POSITIONS: Record<Lane, number> = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
};

export class TrackManager {
  public scene: THREE.Scene;
  public obstacles: ObstacleData[] = [];
  public collectibles: CollectibleData[] = [];

  // Meshes mapped by id
  private obstacleMeshes: Map<string, THREE.Group> = new Map();
  private collectibleMeshes: Map<string, THREE.Group> = new Map();

  // Reusable Track Chunks
  private chunkGroups: THREE.Group[] = [];
  private readonly CHUNK_LENGTH = 60;
  private readonly CHUNK_COUNT = 6;
  private furthestChunkZ = 0;

  // Shared Geometries & Materials
  private railGeo = new THREE.BoxGeometry(0.1, 0.1, this.CHUNK_LENGTH);
  private railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  private tieGeo = new THREE.BoxGeometry(2.0, 0.08, 0.3);
  private tieMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  private groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // Train Materials
  private trainBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.4 });
  private trainStripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.3 });
  private trainWindowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  private trainWheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });

  // Gymnastics Prop Materials
  private hurdleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.4 });
  private springboardMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.1, roughness: 0.5 });
  private springboardSpringMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
  private balanceBeamMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Suede tan

  // Collectible Materials
  private starMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2, emissive: 0xca8a04, emissiveIntensity: 0.3 });
  private medalMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15, emissive: 0xb45309, emissiveIntensity: 0.4 });
  private powerupMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.2, emissive: 0x0891b2, emissiveIntensity: 0.5 });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initTrackChunks();
  }

  private initTrackChunks() {
    for (let i = 0; i < this.CHUNK_COUNT; i++) {
      const chunkZ = i * this.CHUNK_LENGTH;
      const chunk = this.createChunk(chunkZ);
      this.chunkGroups.push(chunk);
      this.scene.add(chunk);
      this.furthestChunkZ = chunkZ;

      // Spawn initial obstacles and items (skip first chunk so player has a clean start)
      if (i > 0) {
        this.generateChunkFeatures(chunkZ);
      }
    }
  }

  private createChunk(zOffset: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = zOffset;

    // Ground platform
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(LANE_WIDTH * 3 + 4, 0.4, this.CHUNK_LENGTH),
      this.groundMat
    );
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    chunk.add(ground);

    // Ballast track borders
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, this.CHUNK_LENGTH), curbMat);
    leftCurb.position.set(-LANE_WIDTH * 1.5 - 1.2, 0.1, 0);
    chunk.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, this.CHUNK_LENGTH), curbMat);
    rightCurb.position.set(LANE_WIDTH * 1.5 + 1.2, 0.1, 0);
    chunk.add(rightCurb);

    // Rails for all 3 lanes
    const lanes: Lane[] = [-1, 0, 1];
    lanes.forEach(lane => {
      const x = LANE_POSITIONS[lane];
      // Left and right steel rail
      const leftRail = new THREE.Mesh(this.railGeo, this.railMat);
      leftRail.position.set(x - 0.5, 0.05, 0);
      chunk.add(leftRail);

      const rightRail = new THREE.Mesh(this.railGeo, this.railMat);
      rightRail.position.set(x + 0.5, 0.05, 0);
      chunk.add(rightRail);

      // Railroad ties (every 2.5 meters)
      const numTies = Math.floor(this.CHUNK_LENGTH / 2.5);
      for (let t = 0; t < numTies; t++) {
        const tie = new THREE.Mesh(this.tieGeo, this.tieMat);
        tie.position.set(x, 0.02, -this.CHUNK_LENGTH / 2 + t * 2.5 + 1.25);
        tie.receiveShadow = true;
        chunk.add(tie);
      }
    });

    // Scenery: City buildings & Gymnastics stadium facades along flanks
    this.addCityScenery(chunk);

    // Overhead Railway Signal Gantry
    this.addOverheadGantry(chunk, 0);

    return chunk;
  }

  private addCityScenery(chunk: THREE.Group) {
    // City buildings on left & right
    const buildingColors = [0x1e293b, 0x0f172a, 0x334155, 0x1e3a8a, 0x3b0764];
    const flankDist = LANE_WIDTH * 2 + 3.8;

    [-1, 1].forEach(side => {
      for (let b = 0; b < 4; b++) {
        const height = 14 + Math.random() * 18;
        const width = 8 + Math.random() * 4;
        const depth = 12;
        const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });

        const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bMat);
        const zPos = -this.CHUNK_LENGTH / 2 + b * 15 + 7.5;
        building.position.set(side * (flankDist + width / 2), height / 2 - 0.2, zPos);
        chunk.add(building);

        // Lit building windows
        const winGeo = new THREE.PlaneGeometry(0.8, 1.2);
        const winMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xfef08a : 0x38bdf8 });
        for (let wy = 3; wy < height - 2; wy += 3.5) {
          for (let wz = -depth / 2 + 2; wz < depth / 2 - 2; wz += 2.5) {
            if (Math.random() > 0.3) {
              const windowMesh = new THREE.Mesh(winGeo, winMat);
              windowMesh.position.set(
                side * (flankDist + 0.05),
                wy,
                zPos + wz
              );
              windowMesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
              chunk.add(windowMesh);
            }
          }
        }
      }
    });

    // Funky Gymnastics billboard / banner
    if (Math.random() > 0.4) {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 128;
      const sCtx = signCanvas.getContext('2d')!;
      sCtx.fillStyle = '#0284c7';
      sCtx.fillRect(0, 0, 512, 128);
      sCtx.lineWidth = 8;
      sCtx.strokeStyle = '#facc15';
      sCtx.strokeRect(4, 4, 504, 120);

      sCtx.fillStyle = '#fef08a';
      sCtx.font = 'bold 44px sans-serif';
      sCtx.textAlign = 'center';
      const messages = ['HENRY GYMNASTICS', 'PERFECT 10.0 ARENA', 'GO HENRY #7!', 'STICK THE LANDING!'];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      sCtx.fillText(msg, 256, 76);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), signMat);
      signMesh.position.set(-LANE_WIDTH * 2 - 1.5, 7.5, 0);
      signMesh.rotation.y = 0.3;
      chunk.add(signMesh);
    }
  }

  private addOverheadGantry(chunk: THREE.Group, z: number) {
    const gantry = new THREE.Group();
    gantry.position.z = z;

    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4 });
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 6, 8);

    // Left post
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-LANE_WIDTH * 1.5 - 0.8, 3, 0);
    gantry.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(LANE_WIDTH * 1.5 + 0.8, 3, 0);
    gantry.add(rightPost);

    // Cross beam
    const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 3 + 2, 0.25, 0.3);
    const crossBeam = new THREE.Mesh(beamGeo, postMat);
    crossBeam.position.set(0, 5.8, 0);
    gantry.add(crossBeam);

    // Signal lights (Green for Henry!)
    const signalMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const signalLight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), signalMat);
    signalLight.position.set(0, 5.5, 0.2);
    gantry.add(signalLight);

    chunk.add(gantry);
  }

  // Generate obstacles and items for a specific chunk
  private generateChunkFeatures(chunkStartZ: number) {
    const lanes: Lane[] = [-1, 0, 1];

    // Determine segment density based on distance
    const featureCount = 3 + Math.floor(Math.random() * 2);

    for (let f = 0; f < featureCount; f++) {
      const z = chunkStartZ - this.CHUNK_LENGTH / 2 + (f + 0.5) * (this.CHUNK_LENGTH / featureCount);

      // Choose a pattern: Train, Hurdle, Barrier, Springboard, or Balance Beam
      const patternRand = Math.random();

      if (patternRand < 0.35) {
        // --- Parked Subway Train ---
        const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
        const hasRamp = Math.random() > 0.5;

        this.spawnTrain(trainLane, z, hasRamp);

        // Collectibles on the other lanes or on train top!
        const otherLanes = lanes.filter(l => l !== trainLane);
        const freeLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        this.spawnStarLine(freeLane, z - 4, z + 4, 0.5);

        if (hasRamp) {
          // Stars along the top of the train!
          this.spawnStarLine(trainLane, z - 3, z + 4, 3.2);
        }
      } else if (patternRand < 0.6) {
        // --- Gymnastics Springboard + High Star Arc ---
        const boardLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnSpringboard(boardLane, z);

        // Big star arc through the sky!
        this.spawnStarArc(boardLane, z + 2, z + 12, 1.0, 5.5);

        // Letter or PowerUp in the middle of the high jump!
        if (Math.random() > 0.4) {
          this.spawnLetterOrPowerup(boardLane, z + 7, 5.2);
        }
      } else if (patternRand < 0.8) {
        // --- Gymnastics Hurdle (Vaultable) & Roll Bar ---
        const hurdleLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnHurdle(hurdleLane, z);

        // Put a high barrier on another lane to encourage rolling
        const remainingLanes = lanes.filter(l => l !== hurdleLane);
        const barrierLane = remainingLanes[Math.floor(Math.random() * remainingLanes.length)];
        this.spawnHighBarrier(barrierLane, z);

        // Coins in the 3rd lane
        const thirdLane = remainingLanes.find(l => l !== barrierLane) || 0;
        this.spawnStarLine(thirdLane, z - 2, z + 2, 0.5);
      } else {
        // --- Olympic Balance Beam ---
        const beamLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnBalanceBeam(beamLane, z);
        this.spawnStarLine(beamLane, z - 4, z + 4, 1.8);
      }
    }
  }

  // --- SPAWN HELPERS ---

  private spawnTrain(lane: Lane, z: number, hasRamp: boolean) {
    const id = `train_${lane}_${Math.floor(z)}`;
    const trainData: ObstacleData = {
      id,
      type: 'TRAIN_STATIC',
      lane,
      z,
      width: 1.8,
      height: 2.5,
      depth: 9.0,
    };
    this.obstacles.push(trainData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // Train Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 9.0), this.trainBodyMat);
    body.position.y = 1.25;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Train Yellow Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.35, 9.0), this.trainStripeMat);
    stripe.position.y = 1.1;
    group.add(stripe);

    // Train Roof AC units
    for (let ac = -3; ac <= 3; ac += 3) {
      const acUnit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.8), this.tieMat);
      acUnit.position.set(0, 2.5, ac);
      group.add(acUnit);
    }

    // Windows along side
    for (let w = -3.2; w <= 3.2; w += 1.6) {
      [-0.96, 0.96].forEach(sideX => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), this.trainWindowMat);
        win.position.set(sideX, 1.6, w);
        win.rotation.y = sideX > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(win);
      });
    }

    // Front Windshield & Headlights
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), this.trainWindowMat);
    windshield.position.set(0, 1.6, -4.51);
    windshield.rotation.y = Math.PI;
    group.add(windshield);

    // Train Headlights
    [-0.55, 0.55].forEach(lx => {
      const lightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      lightMesh.position.set(lx, 0.7, -4.51);
      group.add(lightMesh);
    });

    // Ramp if enabled
    if (hasRamp) {
      const rampGeo = new THREE.BoxGeometry(1.8, 0.15, 4.0);
      const rampMesh = new THREE.Mesh(rampGeo, this.trainStripeMat);
      rampMesh.position.set(0, 1.2, -6.0);
      rampMesh.rotation.x = -0.58; // Incline to train top
      rampMesh.castShadow = true;
      group.add(rampMesh);

      // Track obstacle for ramp
      this.obstacles.push({
        id: `ramp_${id}`,
        type: 'RAMP',
        lane,
        z: z - 6.0,
        width: 1.8,
        height: 2.4,
        depth: 4.0,
      });
    }

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnHurdle(lane: Lane, z: number) {
    const id = `hurdle_${lane}_${Math.floor(z)}`;
    const hurdleData: ObstacleData = {
      id,
      type: 'HURDLE_LOW',
      lane,
      z,
      width: 1.8,
      height: 1.0,
      depth: 0.6,
      canVault: true,
    };
    this.obstacles.push(hurdleData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // Gymnastics low hurdle / pommel block
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 0.2), this.hurdleMat);
    bar.position.y = 0.9;
    bar.castShadow = true;
    group.add(bar);

    // Padded vault top
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8), this.hurdleMat);
    pad.position.y = 0.98;
    pad.rotation.z = Math.PI / 2;
    group.add(pad);

    // Hurdle Legs
    [-0.8, 0.8].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), this.railMat);
      leg.position.set(lx, 0.45, 0);
      group.add(leg);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.6), this.tieMat);
      foot.position.set(lx, 0.04, 0);
      group.add(foot);
    });

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnHighBarrier(lane: Lane, z: number) {
    const id = `barrier_${lane}_${Math.floor(z)}`;
    const barrierData: ObstacleData = {
      id,
      type: 'BARRIER_HIGH',
      lane,
      z,
      width: 1.8,
      height: 2.4,
      depth: 0.6,
      canRollUnder: true,
    };
    this.obstacles.push(barrierData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // High sign bar (suspended from 1.3 to 2.4 height)
    const signBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.0, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.3, roughness: 0.5 })
    );
    signBar.position.y = 1.85;
    signBar.castShadow = true;
    group.add(signBar);

    // Striped warning decal
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.92, 0.25, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    stripe.position.y = 1.85;
    group.add(stripe);

    // Support pillars
    [-0.85, 0.85].forEach(lx => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.3, 6), this.railMat);
      pole.position.set(lx, 1.15, 0);
      group.add(pole);
    });

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnSpringboard(lane: Lane, z: number) {
    const id = `springboard_${lane}_${Math.floor(z)}`;
    const boardData: ObstacleData = {
      id,
      type: 'SPRINGBOARD',
      lane,
      z,
      width: 1.4,
      height: 0.35,
      depth: 1.5,
    };
    this.obstacles.push(boardData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // Angled red gymnastics springboard
    const topBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.5), this.springboardMat);
    topBoard.position.set(0, 0.24, 0);
    topBoard.rotation.x = -0.14; // Angled ramp
    topBoard.castShadow = true;
    group.add(topBoard);

    // Shiny gold springs underneath
    [-0.4, 0.4].forEach(sx => {
      const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8), this.springboardSpringMat);
      spring.position.set(sx, 0.11, 0.25);
      group.add(spring);
    });

    // Base board
    const baseBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.5), this.tieMat);
    baseBoard.position.y = 0.04;
    group.add(baseBoard);

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnBalanceBeam(lane: Lane, z: number) {
    const id = `beam_${lane}_${Math.floor(z)}`;
    const beamLength = 8.0;
    const beamData: ObstacleData = {
      id,
      type: 'BALANCE_BEAM',
      lane,
      z,
      width: 0.5,
      height: 1.2,
      depth: beamLength,
    };
    this.obstacles.push(beamData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // Suede tan Olympic balance beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, beamLength), this.balanceBeamMat);
    beam.position.y = 1.2;
    beam.castShadow = true;
    group.add(beam);

    // Beam steel legs
    [-2.5, 2.5].forEach(lz => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), this.railMat);
      leg.position.set(0, 0.55, lz);
      group.add(leg);

      const crossFoot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.2), this.tieMat);
      crossFoot.position.set(0, 0.04, lz);
      group.add(crossFoot);
    });

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnStarLine(lane: Lane, startZ: number, endZ: number, y: number) {
    const step = 2.0;
    for (let z = startZ; z <= endZ; z += step) {
      this.spawnStar(lane, z, y);
    }
  }

  private spawnStarArc(lane: Lane, startZ: number, endZ: number, baseY: number, peakY: number) {
    const steps = 6;
    const length = endZ - startZ;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const z = startZ + t * length;
      // Parabolic arc
      const y = baseY + 4 * (peakY - baseY) * t * (1 - t);
      this.spawnStar(lane, z, y);
    }
  }

  private spawnStar(lane: Lane, z: number, y: number) {
    const id = `star_${lane}_${Math.floor(z * 10)}`;
    const starData: CollectibleData = {
      id,
      type: 'STAR',
      lane,
      z,
      y,
    };
    this.collectibles.push(starData);

    const starGroup = new THREE.Group();
    starGroup.position.set(LANE_POSITIONS[lane], y, z);

    // 5-pointed 3D Star shape
    const starMesh = this.createStarMesh();
    starGroup.add(starMesh);

    this.scene.add(starGroup);
    this.collectibleMeshes.set(id, starGroup);
  }

  private createStarMesh(): THREE.Mesh {
    // Extruded 5-pointed star
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.28;
    const innerRadius = 0.13;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    const mesh = new THREE.Mesh(geo, this.starMat);
    return mesh;
  }

  private spawnLetterOrPowerup(lane: Lane, z: number, y: number) {
    const letters: Array<'H' | 'E' | 'N' | 'R' | 'Y'> = ['H', 'E', 'N', 'R', 'Y'];
    const powerUps: PowerUpType[] = ['MAGNET', 'CHALK_BOOST', 'MULTIPLIER', 'FEVER_MODE'];

    const isLetter = Math.random() > 0.4;
    const id = `special_${lane}_${Math.floor(z)}`;

    if (isLetter) {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      const colData: CollectibleData = {
        id,
        type: 'LETTER',
        lane,
        z,
        y,
        letter,
      };
      this.collectibles.push(colData);

      const group = new THREE.Group();
      group.position.set(LANE_POSITIONS[lane], y, z);

      // Glowing Badge with Letter
      const badgeGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16);
      badgeGeo.rotateX(Math.PI / 2);
      const badgeMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
      });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      group.add(badge);

      // Letter canvas text
      const lCanvas = document.createElement('canvas');
      lCanvas.width = 128;
      lCanvas.height = 128;
      const ctx = lCanvas.getContext('2d')!;
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 88px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 64, 68);

      const lTex = new THREE.CanvasTexture(lCanvas);
      const lFace = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), new THREE.MeshBasicMaterial({ map: lTex, transparent: true }));
      lFace.position.z = 0.09;
      group.add(lFace);

      this.scene.add(group);
      this.collectibleMeshes.set(id, group);
    } else {
      const powerUpType = powerUps[Math.floor(Math.random() * powerUps.length)];
      const colData: CollectibleData = {
        id,
        type: 'POWERUP',
        lane,
        z,
        y,
        powerUpType,
      };
      this.collectibles.push(colData);

      const group = new THREE.Group();
      group.position.set(LANE_POSITIONS[lane], y, z);

      // PowerUp glowing box / orb
      const orb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38), this.powerupMat);
      group.add(orb);

      this.scene.add(group);
      this.collectibleMeshes.set(id, group);
    }
  }

  // Recycle chunks ahead of player
  public update(playerZ: number, dt: number) {
    // Spin collectibles
    this.collectibleMeshes.forEach(mesh => {
      mesh.rotation.y += dt * 3.5;
    });

    // Check if player has passed earliest chunk
    const firstChunk = this.chunkGroups[0];
    if (playerZ - firstChunk.position.z > this.CHUNK_LENGTH * 1.5) {
      // Recycle first chunk to the front
      const recycledChunk = this.chunkGroups.shift()!;
      this.furthestChunkZ += this.CHUNK_LENGTH;
      recycledChunk.position.z = this.furthestChunkZ;
      this.chunkGroups.push(recycledChunk);

      // Generate features for new chunk
      this.generateChunkFeatures(this.furthestChunkZ);

      // Cleanup old obstacles & collectibles behind player
      this.cleanupBehindPlayer(playerZ - 20);
    }
  }

  private cleanupBehindPlayer(thresholdZ: number) {
    // Remove obstacles behind threshold
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.z < thresholdZ) {
        const mesh = this.obstacleMeshes.get(obs.id);
        if (mesh) {
          this.scene.remove(mesh);
          this.obstacleMeshes.delete(obs.id);
        }
        return false;
      }
      return true;
    });

    // Remove collectibles behind threshold
    this.collectibles = this.collectibles.filter(col => {
      if (col.z < thresholdZ || col.collected) {
        const mesh = this.collectibleMeshes.get(col.id);
        if (mesh) {
          this.scene.remove(mesh);
          this.collectibleMeshes.delete(col.id);
        }
        return false;
      }
      return true;
    });
  }

  public removeCollectibleMesh(id: string) {
    const mesh = this.collectibleMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.collectibleMeshes.delete(id);
    }
  }

  public reset() {
    // Clear all meshes
    this.obstacleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.collectibleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.obstacleMeshes.clear();
    this.collectibleMeshes.clear();
    this.obstacles = [];
    this.collectibles = [];

    // Reset chunks
    this.chunkGroups.forEach((chunk, i) => {
      chunk.position.z = i * this.CHUNK_LENGTH;
      this.furthestChunkZ = i * this.CHUNK_LENGTH;
      if (i > 0) {
        this.generateChunkFeatures(chunk.position.z);
      }
    });
  }
}
