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
  private railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.15 });
  private tieGeo = new THREE.BoxGeometry(2.0, 0.08, 0.3);
  private tieMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  private groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

  // Train Materials
  private trainBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
  private trainStripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.25 });
  private trainWindowMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1 });
  private trainWheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });

  // Gymnastics Prop Materials
  private hurdleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.4 });
  private springboardMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.1, roughness: 0.5 });
  private springboardSpringMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 });
  private balanceBeamMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });

  // Collectible Materials
  private starMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.85,
    roughness: 0.15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.4,
  });

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
      new THREE.BoxGeometry(LANE_WIDTH * 3 + 4.8, 0.4, this.CHUNK_LENGTH),
      this.groundMat
    );
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    chunk.add(ground);

    // Ballast track borders
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, this.CHUNK_LENGTH), curbMat);
    leftCurb.position.set(-LANE_WIDTH * 1.5 - 1.4, 0.15, 0);
    chunk.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, this.CHUNK_LENGTH), curbMat);
    rightCurb.position.set(LANE_WIDTH * 1.5 + 1.4, 0.15, 0);
    chunk.add(rightCurb);

    // 3 Subway Track Lanes
    const lanes: Lane[] = [-1, 0, 1];
    lanes.forEach(lane => {
      const x = LANE_POSITIONS[lane];
      const leftRail = new THREE.Mesh(this.railGeo, this.railMat);
      leftRail.position.set(x - 0.5, 0.05, 0);
      chunk.add(leftRail);

      const rightRail = new THREE.Mesh(this.railGeo, this.railMat);
      rightRail.position.set(x + 0.5, 0.05, 0);
      chunk.add(rightRail);

      const numTies = Math.floor(this.CHUNK_LENGTH / 2.5);
      for (let t = 0; t < numTies; t++) {
        const tie = new THREE.Mesh(this.tieGeo, this.tieMat);
        tie.position.set(x, 0.02, -this.CHUNK_LENGTH / 2 + t * 2.5 + 1.25);
        tie.receiveShadow = true;
        chunk.add(tie);
      }
    });

    // City & Stadium Flanks
    this.addCityScenery(chunk);

    // Overhead Gantry with Signal Light
    this.addOverheadGantry(chunk, 0);

    // Sky Clouds overhead (for high jumping & sky flight!)
    this.addSkyClouds(chunk);

    return chunk;
  }

  private addCityScenery(chunk: THREE.Group) {
    const buildingColors = [0x1e293b, 0x0f172a, 0x1e3a8a, 0x312e81, 0x1e1b4b];
    const flankDist = LANE_WIDTH * 2 + 4.2;

    [-1, 1].forEach(side => {
      for (let b = 0; b < 4; b++) {
        const height = 16 + Math.random() * 20;
        const width = 8 + Math.random() * 4;
        const depth = 13;
        const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });

        const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bMat);
        const zPos = -this.CHUNK_LENGTH / 2 + b * 15 + 7.5;
        building.position.set(side * (flankDist + width / 2), height / 2 - 0.2, zPos);
        chunk.add(building);

        // Windows
        const winGeo = new THREE.PlaneGeometry(0.8, 1.2);
        const winMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xfef08a : 0x38bdf8 });
        for (let wy = 3; wy < height - 2; wy += 3.8) {
          for (let wz = -depth / 2 + 2; wz < depth / 2 - 2; wz += 2.8) {
            if (Math.random() > 0.25) {
              const win = new THREE.Mesh(winGeo, winMat);
              win.position.set(side * (flankDist + 0.05), wy, zPos + wz);
              win.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
              chunk.add(win);
            }
          }
        }
      }
    });

    // Neon Gymnastics signs
    if (Math.random() > 0.35) {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 128;
      const sCtx = signCanvas.getContext('2d')!;
      sCtx.fillStyle = '#0284c7';
      sCtx.fillRect(0, 0, 512, 128);
      sCtx.lineWidth = 10;
      sCtx.strokeStyle = '#facc15';
      sCtx.strokeRect(5, 5, 502, 118);

      sCtx.fillStyle = '#fef08a';
      sCtx.font = 'bold 44px sans-serif';
      sCtx.textAlign = 'center';
      const messages = ['HENRY GYMNASTICS', 'PERFECT 10 ARENA', 'GO CHAMPION #7!', 'STICK THE LANDING!'];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      sCtx.fillText(msg, 256, 76);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.2), signMat);
      signMesh.position.set(-LANE_WIDTH * 2 - 1.8, 8.0, 0);
      signMesh.rotation.y = 0.25;
      chunk.add(signMesh);
    }
  }

  private addOverheadGantry(chunk: THREE.Group, z: number) {
    const gantry = new THREE.Group();
    gantry.position.z = z;

    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 7, 8);

    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-LANE_WIDTH * 1.5 - 1.0, 3.5, 0);
    gantry.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(LANE_WIDTH * 1.5 + 1.0, 3.5, 0);
    gantry.add(rightPost);

    const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 3 + 2.5, 0.3, 0.35);
    const crossBeam = new THREE.Mesh(beamGeo, postMat);
    crossBeam.position.set(0, 6.8, 0);
    gantry.add(crossBeam);

    const signalLight = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    signalLight.position.set(0, 6.4, 0.25);
    gantry.add(signalLight);

    chunk.add(gantry);
  }

  private addSkyClouds(chunk: THREE.Group) {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.7,
    });

    for (let c = 0; c < 3; c++) {
      const cloud = new THREE.Group();
      const z = -this.CHUNK_LENGTH / 2 + c * 20 + 10;
      const x = (Math.random() - 0.5) * 15;
      cloud.position.set(x, 14 + Math.random() * 4, z);

      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 1.2, 8, 8), cloudMat);
        puff.position.set((p - 1.5) * 1.4, Math.random() * 0.4, (Math.random() - 0.5) * 1.2);
        cloud.add(puff);
      }
      chunk.add(cloud);
    }
  }

  // Generate obstacles and items for a chunk
  private generateChunkFeatures(chunkStartZ: number) {
    const lanes: Lane[] = [-1, 0, 1];
    const featureCount = 3 + Math.floor(Math.random() * 2);

    for (let f = 0; f < featureCount; f++) {
      const z = chunkStartZ - this.CHUNK_LENGTH / 2 + (f + 0.5) * (this.CHUNK_LENGTH / featureCount);
      const patternRand = Math.random();

      if (patternRand < 0.35) {
        // --- Subway Train (Static or Slow Moving) ---
        const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
        const isMoving = Math.random() > 0.65;
        const hasRamp = !isMoving && Math.random() > 0.4;

        this.spawnTrain(trainLane, z, hasRamp, isMoving);

        // Collectibles on remaining lanes
        const otherLanes = lanes.filter(l => l !== trainLane);
        const freeLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        this.spawnStarLine(freeLane, z - 4, z + 4, 0.5);

        if (hasRamp) {
          this.spawnStarLine(trainLane, z - 3, z + 4, 3.2);
        }
      } else if (patternRand < 0.58) {
        // --- Gymnastics Springboard + High Star Arc ---
        const boardLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnSpringboard(boardLane, z);
        this.spawnStarArc(boardLane, z + 2, z + 12, 1.0, 5.8);

        // Special Item at the top of the flight
        if (Math.random() > 0.3) {
          this.spawnLetterOrPowerup(boardLane, z + 7, 5.5);
        }
      } else if (patternRand < 0.8) {
        // --- Low Vault Hurdle & High Roll Bar ---
        const hurdleLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnHurdle(hurdleLane, z);

        const remainingLanes = lanes.filter(l => l !== hurdleLane);
        const barrierLane = remainingLanes[Math.floor(Math.random() * remainingLanes.length)];
        this.spawnHighBarrier(barrierLane, z);

        const thirdLane = remainingLanes.find(l => l !== barrierLane) || 0;
        this.spawnStarLine(thirdLane, z - 2, z + 2, 0.5);
      } else {
        // --- Olympic Balance Beam ---
        const beamLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnBalanceBeam(beamLane, z);
        this.spawnStarLine(beamLane, z - 4, z + 4, 1.8);

        if (Math.random() > 0.4) {
          this.spawnLetterOrPowerup(beamLane, z, 2.2);
        }
      }

      // Also generate high sky star lines for Sky Rings mode
      if (Math.random() > 0.5) {
        const skyLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnStarLine(skyLane, z - 3, z + 3, 8.5);
      }
    }
  }

  // --- SPAWN IMPLEMENTATIONS ---

  private spawnTrain(lane: Lane, z: number, hasRamp: boolean, isMoving: boolean) {
    const id = `train_${lane}_${Math.floor(z)}`;
    const trainData: ObstacleData = {
      id,
      type: isMoving ? 'TRAIN_MOVING' : 'TRAIN_STATIC',
      lane,
      z,
      width: 1.8,
      height: 2.5,
      depth: 9.5,
      speedZ: isMoving ? -4.5 : 0, // oncoming train
    };
    this.obstacles.push(trainData);

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    // Train Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 9.5), this.trainBodyMat);
    body.position.y = 1.25;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.35, 9.5), this.trainStripeMat);
    stripe.position.y = 1.1;
    group.add(stripe);

    // Vents
    for (let ac = -3.2; ac <= 3.2; ac += 3.2) {
      const acUnit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.8), this.tieMat);
      acUnit.position.set(0, 2.5, ac);
      group.add(acUnit);
    }

    // Windows
    for (let w = -3.4; w <= 3.4; w += 1.7) {
      [-0.96, 0.96].forEach(sideX => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), this.trainWindowMat);
        win.position.set(sideX, 1.6, w);
        win.rotation.y = sideX > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(win);
      });
    }

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), this.trainWindowMat);
    windshield.position.set(0, 1.6, -4.76);
    windshield.rotation.y = Math.PI;
    group.add(windshield);

    // Headlights
    [-0.55, 0.55].forEach(lx => {
      const lightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      lightMesh.position.set(lx, 0.7, -4.76);
      group.add(lightMesh);
    });

    // Ramp if enabled
    if (hasRamp) {
      const rampGeo = new THREE.BoxGeometry(1.8, 0.15, 4.2);
      const rampMesh = new THREE.Mesh(rampGeo, this.trainStripeMat);
      rampMesh.position.set(0, 1.2, -6.5);
      rampMesh.rotation.x = -0.55;
      rampMesh.castShadow = true;
      group.add(rampMesh);

      this.obstacles.push({
        id: `ramp_${id}`,
        type: 'RAMP',
        lane,
        z: z - 6.5,
        width: 1.8,
        height: 2.4,
        depth: 4.2,
      });
    }

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnHurdle(lane: Lane, z: number) {
    const id = `hurdle_${lane}_${Math.floor(z)}`;
    this.obstacles.push({
      id,
      type: 'HURDLE_LOW',
      lane,
      z,
      width: 1.8,
      height: 1.0,
      depth: 0.6,
      canVault: true,
    });

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 0.2), this.hurdleMat);
    bar.position.y = 0.9;
    bar.castShadow = true;
    group.add(bar);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8), this.hurdleMat);
    pad.position.y = 0.98;
    pad.rotation.z = Math.PI / 2;
    group.add(pad);

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
    this.obstacles.push({
      id,
      type: 'BARRIER_HIGH',
      lane,
      z,
      width: 1.8,
      height: 2.4,
      depth: 0.6,
      canRollUnder: true,
    });

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    const signBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.0, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.3, roughness: 0.5 })
    );
    signBar.position.y = 1.85;
    signBar.castShadow = true;
    group.add(signBar);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.92, 0.25, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    stripe.position.y = 1.85;
    group.add(stripe);

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
    this.obstacles.push({
      id,
      type: 'SPRINGBOARD',
      lane,
      z,
      width: 1.4,
      height: 0.35,
      depth: 1.5,
    });

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    const topBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.5), this.springboardMat);
    topBoard.position.set(0, 0.24, 0);
    topBoard.rotation.x = -0.14;
    topBoard.castShadow = true;
    group.add(topBoard);

    [-0.4, 0.4].forEach(sx => {
      const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8), this.springboardSpringMat);
      spring.position.set(sx, 0.11, 0.25);
      group.add(spring);
    });

    const baseBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.5), this.tieMat);
    baseBoard.position.y = 0.04;
    group.add(baseBoard);

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
  }

  private spawnBalanceBeam(lane: Lane, z: number) {
    const id = `beam_${lane}_${Math.floor(z)}`;
    const beamLength = 8.0;
    this.obstacles.push({
      id,
      type: 'BALANCE_BEAM',
      lane,
      z,
      width: 0.5,
      height: 1.2,
      depth: beamLength,
    });

    const group = new THREE.Group();
    group.position.set(LANE_POSITIONS[lane], 0, z);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, beamLength), this.balanceBeamMat);
    beam.position.y = 1.2;
    beam.castShadow = true;
    group.add(beam);

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
      const y = baseY + 4 * (peakY - baseY) * t * (1 - t);
      this.spawnStar(lane, z, y);
    }
  }

  private spawnStar(lane: Lane, z: number, y: number) {
    const id = `star_${lane}_${Math.floor(z * 10)}`;
    this.collectibles.push({
      id,
      type: 'STAR',
      lane,
      z,
      y,
    });

    const starGroup = new THREE.Group();
    starGroup.position.set(LANE_POSITIONS[lane], y, z);
    const starMesh = this.createStarMesh();
    starGroup.add(starMesh);

    this.scene.add(starGroup);
    this.collectibleMeshes.set(id, starGroup);
  }

  private createStarMesh(): THREE.Mesh {
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
    return new THREE.Mesh(geo, this.starMat);
  }

  private spawnLetterOrPowerup(lane: Lane, z: number, y: number) {
    const letters: Array<'H' | 'E' | 'N' | 'R' | 'Y'> = ['H', 'E', 'N', 'R', 'Y'];
    const powerUps: PowerUpType[] = ['MAGNET', 'SPRING_SHOES', 'SKY_RINGS', 'MULTIPLIER', 'CHALK_BOOST'];

    const isLetter = Math.random() > 0.45;
    const id = `special_${lane}_${Math.floor(z)}`;

    if (isLetter) {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      this.collectibles.push({
        id,
        type: 'LETTER',
        lane,
        z,
        y,
        letter,
      });

      const group = new THREE.Group();
      group.position.set(LANE_POSITIONS[lane], y, z);

      const badgeGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16);
      badgeGeo.rotateX(Math.PI / 2);
      const badgeMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
      });
      group.add(new THREE.Mesh(badgeGeo, badgeMat));

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
      this.collectibles.push({
        id,
        type: 'POWERUP',
        lane,
        z,
        y,
        powerUpType,
      });

      const group = new THREE.Group();
      group.position.set(LANE_POSITIONS[lane], y, z);

      // Icon colors based on powerup
      const colors: Record<PowerUpType, number> = {
        MAGNET: 0xef4444,
        SPRING_SHOES: 0xf59e0b,
        SKY_RINGS: 0x06b6d4,
        MULTIPLIER: 0xa855f7,
        CHALK_BOOST: 0x10b981,
        FEVER_MODE: 0xf43f5e,
      };

      const pwrMat = new THREE.MeshStandardMaterial({
        color: colors[powerUpType] || 0x06b6d4,
        metalness: 0.8,
        roughness: 0.2,
        emissive: colors[powerUpType] || 0x0891b2,
        emissiveIntensity: 0.6,
      });

      const orb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), pwrMat);
      group.add(orb);

      this.scene.add(group);
      this.collectibleMeshes.set(id, group);
    }
  }

  // Update dynamic elements (moving trains, rotating collectibles)
  public update(playerZ: number, dt: number) {
    // 1. Rotate collectibles
    this.collectibleMeshes.forEach(mesh => {
      mesh.rotation.y += dt * 3.5;
    });

    // 2. Advance moving trains
    this.obstacles.forEach(obs => {
      if (obs.type === 'TRAIN_MOVING' && obs.speedZ) {
        obs.z += obs.speedZ * dt;
        const mesh = this.obstacleMeshes.get(obs.id);
        if (mesh) {
          mesh.position.z = obs.z;
        }
      }
    });

    // 3. Recycle chunks
    const firstChunk = this.chunkGroups[0];
    if (playerZ - firstChunk.position.z > this.CHUNK_LENGTH * 1.5) {
      const recycledChunk = this.chunkGroups.shift()!;
      this.furthestChunkZ += this.CHUNK_LENGTH;
      recycledChunk.position.z = this.furthestChunkZ;
      this.chunkGroups.push(recycledChunk);

      this.generateChunkFeatures(this.furthestChunkZ);
      this.cleanupBehindPlayer(playerZ - 20);
    }
  }

  private cleanupBehindPlayer(thresholdZ: number) {
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
    this.obstacleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.collectibleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.obstacleMeshes.clear();
    this.collectibleMeshes.clear();
    this.obstacles = [];
    this.collectibles = [];

    this.chunkGroups.forEach((chunk, i) => {
      chunk.position.z = i * this.CHUNK_LENGTH;
      this.furthestChunkZ = i * this.CHUNK_LENGTH;
      if (i > 0) {
        this.generateChunkFeatures(chunk.position.z);
      }
    });
  }
}
