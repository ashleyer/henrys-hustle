/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterOutfit } from '../types/game';

export interface HenryAnimationState {
  type: 'RUN' | 'JUMP' | 'BACKFLIP' | 'CARTWHEEL' | 'SLIDE' | 'VAULT' | 'BALANCE' | 'STUMBLE' | 'VICTORY';
  time: number;
  duration: number;
}

export class HenryCharacter {
  public group: THREE.Group;
  public hips: THREE.Group;
  public chest: THREE.Group;
  public head: THREE.Group;
  public hairGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftLowerLeg: THREE.Group;
  public rightLowerLeg: THREE.Group;
  public leftHand: THREE.Group;
  public rightHand: THREE.Group;

  // Chalk particle effect
  private chalkParticles: THREE.Points;
  private chalkGeo: THREE.BufferGeometry;
  private chalkPositions: Float32Array;
  private chalkOpacities: Float32Array;

  // Materials for outfit customization
  private suitMat: THREE.MeshStandardMaterial;
  private trimMat: THREE.MeshStandardMaterial;
  private skinMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;
  private headbandMat: THREE.MeshStandardMaterial;
  private goldStarMat: THREE.MeshStandardMaterial;

  private animState: HenryAnimationState = {
    type: 'RUN',
    time: 0,
    duration: 1.0,
  };

  private runCycleTime: number = 0;

  constructor(outfit?: CharacterOutfit) {
    this.group = new THREE.Group();
    this.group.name = 'HenryHero';

    // Materials
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdfc4,
      roughness: 0.6,
      metalness: 0.05,
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.hairColor : 0x7c4722, // Chestnut brown
      roughness: 0.8,
      metalness: 0.05,
    });

    this.suitMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.suitColor : 0x1e40af, // Team Royal Blue
      roughness: 0.35,
      metalness: 0.25,
    });

    this.trimMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.trimColor : 0xfbbf24, // Gold trim
      roughness: 0.2,
      metalness: 0.5,
    });

    this.shoesMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.shoesColor : 0xef4444, // Red sneakers / gymnastic gym shoes
      roughness: 0.4,
      metalness: 0.1,
    });

    this.headbandMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.headbandColor : 0xf59e0b, // Amber headband
      roughness: 0.5,
    });

    this.goldStarMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Hierarchical body assembly
    this.hips = new THREE.Group();
    this.hips.position.y = 0.72; // Centered at hips
    this.group.add(this.hips);

    // Hips / Lower Leotard
    const hipsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.24), this.suitMat);
    hipsMesh.castShadow = true;
    hipsMesh.position.y = 0.05;
    this.hips.add(hipsMesh);

    // Belt / Gold trim
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.26), this.trimMat);
    belt.position.y = 0.14;
    this.hips.add(belt);

    // Chest / Torso
    this.chest = new THREE.Group();
    this.chest.position.y = 0.16;
    this.hips.add(this.chest);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.26), this.suitMat);
    chestMesh.castShadow = true;
    chestMesh.position.y = 0.18;
    this.chest.add(chestMesh);

    // Front Chest Decal (Henry's "#7" emblem + Gold Star)
    const jerseyDecal = this.createJerseyDecalCanvas();
    const decalMat = new THREE.MeshBasicMaterial({
      map: jerseyDecal,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), decalMat);
    decalMesh.position.set(0, 0.2, 0.135);
    this.chest.add(decalMesh);

    // Back Decal ("HENRY")
    const backDecal = this.createBackDecalCanvas();
    const backMat = new THREE.MeshBasicMaterial({
      map: backDecal,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.2), backMat);
    backMesh.position.set(0, 0.2, -0.135);
    backMesh.rotation.y = Math.PI;
    this.chest.add(backMesh);

    // Head
    this.head = new THREE.Group();
    this.head.position.y = 0.42;
    this.chest.add(this.head);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), this.skinMat);
    headMesh.castShadow = true;
    headMesh.position.y = 0.16;
    this.head.add(headMesh);

    // Headband
    const headband = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.34), this.headbandMat);
    headband.position.y = 0.26;
    this.head.add(headband);

    // Spiky Gymnastic Hair
    this.hairGroup = new THREE.Group();
    this.head.add(this.hairGroup);
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.36), this.hairMat);
    hairTop.position.y = 0.33;
    this.hairGroup.add(hairTop);

    // Hair tufts
    for (let i = -1; i <= 1; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), this.hairMat);
      tuft.position.set(i * 0.1, 0.4, 0.05);
      tuft.rotation.x = -0.2;
      tuft.rotation.z = -i * 0.25;
      this.hairGroup.add(tuft);
    }

    // Face features (big enthusiastic cartoon eyes, smile)
    const faceDecal = this.createFaceCanvas();
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceDecal,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), faceMat);
    faceMesh.position.set(0, 0.14, 0.165);
    this.head.add(faceMesh);

    // Shoulders & Arms
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(0.24, 0.32, 0);
    this.chest.add(this.leftArm);

    const leftBicep = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), this.suitMat);
    leftBicep.position.y = -0.1;
    leftBicep.castShadow = true;
    this.leftArm.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.1), this.skinMat);
    leftForearm.position.y = -0.28;
    this.leftArm.add(leftForearm);

    // Gymnastics wrist grips / chalk wraps
    const leftGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    leftGrip.position.y = -0.34;
    this.leftArm.add(leftGrip);

    this.leftHand = new THREE.Group();
    this.leftHand.position.y = -0.42;
    this.leftArm.add(this.leftHand);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(-0.24, 0.32, 0);
    this.chest.add(this.rightArm);

    const rightBicep = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), this.suitMat);
    rightBicep.position.y = -0.1;
    rightBicep.castShadow = true;
    this.rightArm.add(rightBicep);

    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.1), this.skinMat);
    rightForearm.position.y = -0.28;
    this.rightArm.add(rightForearm);

    // Gymnastics wrist grip right
    const rightGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    rightGrip.position.y = -0.34;
    this.rightArm.add(rightGrip);

    this.rightHand = new THREE.Group();
    this.rightHand.position.y = -0.42;
    this.rightArm.add(this.rightHand);

    // Legs
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(0.11, -0.05, 0);
    this.hips.add(this.leftLeg);

    const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.32, 0.14), this.suitMat);
    leftThigh.position.y = -0.14;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    this.leftLowerLeg = new THREE.Group();
    this.leftLowerLeg.position.y = -0.3;
    this.leftLeg.add(this.leftLowerLeg);

    const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), this.skinMat);
    leftShin.position.y = -0.15;
    this.leftLowerLeg.add(leftShin);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), this.shoesMat);
    leftShoe.position.set(0, -0.32, 0.04);
    leftShoe.castShadow = true;
    this.leftLowerLeg.add(leftShoe);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(-0.11, -0.05, 0);
    this.hips.add(this.rightLeg);

    const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.32, 0.14), this.suitMat);
    rightThigh.position.y = -0.14;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    this.rightLowerLeg = new THREE.Group();
    this.rightLowerLeg.position.y = -0.3;
    this.rightLeg.add(this.rightLowerLeg);

    const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.12), this.skinMat);
    rightShin.position.y = -0.15;
    this.rightLowerLeg.add(rightShin);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), this.shoesMat);
    rightShoe.position.set(0, -0.32, 0.04);
    rightShoe.castShadow = true;
    this.rightLowerLeg.add(rightShoe);

    // Chalk Dust Particle Cloud (procedural)
    const particleCount = 40;
    this.chalkGeo = new THREE.BufferGeometry();
    this.chalkPositions = new Float32Array(particleCount * 3);
    this.chalkOpacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      this.chalkPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      this.chalkPositions[i * 3 + 1] = Math.random() * 0.5;
      this.chalkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      this.chalkOpacities[i] = 0;
    }

    this.chalkGeo.setAttribute('position', new THREE.BufferAttribute(this.chalkPositions, 3));

    const chalkTexture = this.createChalkTexture();
    const chalkMat = new THREE.PointsMaterial({
      size: 0.18,
      map: chalkTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.chalkParticles = new THREE.Points(this.chalkGeo, chalkMat);
    this.chalkParticles.position.y = 0.5;
    this.group.add(this.chalkParticles);
  }

  // Create front jersey canvas texture "#7"
  private createJerseyDecalCanvas(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // White circle backdrop
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 90, 0, Math.PI * 2);
    ctx.fill();

    // Gold border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Text "#7"
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('7', 128, 134);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Back decal with "HENRY"
  private createBackDecalCanvas(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 192);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HENRY', 128, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('7', 128, 130);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Cute energetic boy face canvas
  private createFaceCanvas(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 192);

    // Friendly bright eyes
    const drawEye = (x: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, 70, 24, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#333333';
      ctx.stroke();

      // Iris (sparkling bright brown / hazel)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x + 2, 72, 14, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(x + 2, 72, 8, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 2, 66, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEye(75);
    drawEye(181);

    // Cute eyebrows
    ctx.strokeStyle = '#5a3825';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(56, 42);
    ctx.quadraticCurveTo(76, 34, 96, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 40);
    ctx.quadraticCurveTo(180, 34, 200, 42);
    ctx.stroke();

    // Joyful grin / smile
    ctx.beginPath();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 6;
    ctx.arc(128, 120, 38, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(55, 115, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(201, 115, 16, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Chalk puff texture
  private createChalkTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Update outfit styles dynamically
  public applyOutfit(outfit: CharacterOutfit) {
    this.suitMat.color.set(outfit.suitColor);
    this.trimMat.color.set(outfit.trimColor);
    this.hairMat.color.set(outfit.hairColor);
    this.shoesMat.color.set(outfit.shoesColor);
    this.headbandMat.color.set(outfit.headbandColor);
  }

  public triggerAnimation(type: HenryAnimationState['type'], duration: number = 0.6) {
    this.animState = {
      type,
      time: 0,
      duration,
    };
  }

  public getAnimationType(): HenryAnimationState['type'] {
    return this.animState.type;
  }

  // Animate Henry frame-by-frame
  public update(dt: number, speedMultiplier: number = 1.0) {
    this.animState.time += dt;
    this.runCycleTime += dt * 11 * speedMultiplier;

    // Reset base rotations
    this.group.rotation.set(0, 0, 0);
    this.hips.rotation.set(0, 0, 0);
    this.chest.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);

    const animProgress = Math.min(1.0, this.animState.time / this.animState.duration);

    switch (this.animState.type) {
      case 'RUN': {
        // High energy kid runner cycle
        const cycle = this.runCycleTime;
        const swing = Math.sin(cycle);

        // Legs alternate swing
        this.leftLeg.rotation.x = swing * 0.9;
        this.rightLeg.rotation.x = -swing * 0.9;

        // Knee bend when leg goes back
        this.leftLowerLeg.rotation.x = swing > 0 ? swing * 1.1 : 0.1;
        this.rightLowerLeg.rotation.x = -swing > 0 ? -swing * 1.1 : 0.1;

        // Opposing arm swing with gymnastic fist
        this.leftArm.rotation.x = -swing * 0.85;
        this.rightArm.rotation.x = swing * 0.85;
        this.leftArm.rotation.z = 0.15;
        this.rightArm.rotation.z = -0.15;

        // Bouncy torso
        this.hips.position.y = 0.72 + Math.abs(Math.sin(cycle)) * 0.08;
        this.chest.rotation.y = -swing * 0.15;
        break;
      }

      case 'JUMP': {
        // Gymnastic Tuck / Pike Jump
        // Arms raise high in proud gymnastic V-shape
        this.leftArm.rotation.set(0, 0, 2.3);
        this.rightArm.rotation.set(0, 0, -2.3);

        // Legs tucked under
        this.leftLeg.rotation.x = -1.2;
        this.rightLeg.rotation.x = -1.2;
        this.leftLowerLeg.rotation.x = 1.6;
        this.rightLowerLeg.rotation.x = 1.6;

        this.hips.position.y = 0.65;
        break;
      }

      case 'BACKFLIP': {
        // Full 360 gymnastics backflip!
        const flipAngle = animProgress * Math.PI * 2;
        this.group.rotation.x = -flipAngle;

        // Tucked position during flip
        const tuckFactor = Math.sin(animProgress * Math.PI);
        this.leftLeg.rotation.x = -1.6 * tuckFactor;
        this.rightLeg.rotation.x = -1.6 * tuckFactor;
        this.leftLowerLeg.rotation.x = 2.0 * tuckFactor;
        this.rightLowerLeg.rotation.x = 2.0 * tuckFactor;

        this.leftArm.rotation.x = 2.2 * tuckFactor;
        this.rightArm.rotation.x = 2.2 * tuckFactor;

        // Emit chalk puff at start of backflip
        this.puffChalk(dt);
        break;
      }

      case 'CARTWHEEL': {
        // Acrobatic side roll / Aerial cartwheel
        const cartwheelAngle = animProgress * Math.PI * 2;
        this.group.rotation.z = cartwheelAngle;

        // Starfish / X shape
        this.leftArm.rotation.set(0, 0, 2.4);
        this.rightArm.rotation.set(0, 0, -2.4);
        this.leftLeg.rotation.set(0, 0, 0.6);
        this.rightLeg.rotation.set(0, 0, -0.6);
        this.leftLowerLeg.rotation.x = 0;
        this.rightLowerLeg.rotation.x = 0;

        this.puffChalk(dt);
        break;
      }

      case 'SLIDE': {
        // Gymnastics Forward Roll / Kip slide under obstacle
        const rollAngle = animProgress * Math.PI * 2;
        this.group.rotation.x = rollAngle;
        this.hips.position.y = 0.35; // Lower to ground

        // Tightly tucked forward roll
        this.leftLeg.rotation.x = -2.1;
        this.rightLeg.rotation.x = -2.1;
        this.leftLowerLeg.rotation.x = 2.0;
        this.rightLowerLeg.rotation.x = 2.0;
        this.leftArm.rotation.x = -1.8;
        this.rightArm.rotation.x = -1.8;
        break;
      }

      case 'VAULT': {
        // Vaulting over hurdle / table: hands plant forward, legs clear over
        this.leftArm.rotation.set(-1.2, 0, 0.4);
        this.rightArm.rotation.set(-1.2, 0, -0.4);
        this.leftLeg.rotation.set(1.1, 0, 0.4);
        this.rightLeg.rotation.set(1.1, 0, -0.4);
        this.leftLowerLeg.rotation.x = 0.3;
        this.rightLowerLeg.rotation.x = 0.3;
        this.chest.rotation.x = 0.4;
        break;
      }

      case 'BALANCE': {
        // Olympic Balance Beam: arms wide horizontal, delicate tiptoe
        this.leftArm.rotation.set(0, 0, 1.57);
        this.rightArm.rotation.set(0, 0, -1.57);
        const tipCycle = this.runCycleTime * 1.4;
        this.leftLeg.rotation.x = Math.sin(tipCycle) * 0.5;
        this.rightLeg.rotation.x = -Math.sin(tipCycle) * 0.5;
        this.chest.rotation.z = Math.sin(tipCycle * 0.5) * 0.12;
        break;
      }

      case 'STUMBLE': {
        // Cartoon stumble / bonk
        this.group.rotation.x = 0.45;
        this.leftArm.rotation.set(-1.5, 0, 0.8);
        this.rightArm.rotation.set(-1.5, 0, -0.8);
        this.leftLeg.rotation.x = -0.5;
        this.rightLeg.rotation.x = 0.5;
        break;
      }

      case 'VICTORY': {
        // Olympic "Stick the landing" pose!
        this.leftArm.rotation.set(0, 0, 2.4);
        this.rightArm.rotation.set(0, 0, -2.4);
        this.leftLeg.rotation.set(0, 0, 0.25);
        this.rightLeg.rotation.set(0, 0, -0.25);
        this.chest.rotation.x = -0.15; // Proud puffed chest
        this.head.rotation.x = -0.2; // Looking up at the crowd
        break;
      }
    }

    // Auto-return to RUN if timed animation finished
    if (this.animState.type !== 'RUN' && this.animState.type !== 'STUMBLE' && this.animState.type !== 'VICTORY') {
      if (this.animState.time >= this.animState.duration) {
        this.triggerAnimation('RUN');
      }
    }
  }

  private puffChalk(dt: number) {
    const pos = this.chalkPositions;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += dt * 0.6;
      pos[i * 3 + 0] += (Math.random() - 0.5) * dt * 0.4;
      pos[i * 3 + 2] += (Math.random() - 0.5) * dt * 0.4;
      if (pos[i * 3 + 1] > 1.4) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
        pos[i * 3 + 1] = 0.4;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
    }
    this.chalkGeo.attributes.position.needsUpdate = true;
  }
}
