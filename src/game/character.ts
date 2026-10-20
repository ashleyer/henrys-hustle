/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterOutfit, GymnasticsTrickType } from '../types/game';

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

  // Equipment & Accessories
  public boardMesh: THREE.Group;
  public springShoesLeft: THREE.Mesh;
  public springShoesRight: THREE.Mesh;
  public gymRingsGroup: THREE.Group;
  public contactShadow: THREE.Mesh;

  // Particles
  private chalkParticles: THREE.Points;
  private chalkGeo: THREE.BufferGeometry;
  private chalkPositions: Float32Array;

  // Materials
  private suitMat: THREE.MeshStandardMaterial;
  private trimMat: THREE.MeshStandardMaterial;
  private skinMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;
  private headbandMat: THREE.MeshStandardMaterial;
  private boardMat: THREE.MeshStandardMaterial;

  // Animation state
  private currentAnim: 'RUN' | 'JUMP' | 'SLIDE' | 'VAULT' | 'FLIP' | 'CARTWHEEL' | 'TWIST' | 'BALANCE' | 'BOARD' | 'FLY' | 'STUMBLE' | 'VICTORY' = 'RUN';
  private animTimer: number = 0;
  private animDuration: number = 0.6;
  private runCycleTime: number = 0;

  // Active gear flags
  public isBoardActive: boolean = false;
  public isSpringShoesActive: boolean = false;
  public isFlyingActive: boolean = false;

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
      color: outfit ? outfit.hairColor : 0x7c4722,
      roughness: 0.8,
      metalness: 0.05,
    });

    this.suitMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.suitColor : 0x1d4ed8,
      roughness: 0.35,
      metalness: 0.25,
    });

    this.trimMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.trimColor : 0xfacc15,
      roughness: 0.2,
      metalness: 0.5,
    });

    this.shoesMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.shoesColor : 0xef4444,
      roughness: 0.4,
      metalness: 0.1,
    });

    this.headbandMat = new THREE.MeshStandardMaterial({
      color: outfit ? outfit.headbandColor : 0xf59e0b,
      roughness: 0.5,
    });

    this.boardMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
    });

    // 1. Hips Root
    this.hips = new THREE.Group();
    this.hips.position.y = 0.72;
    this.group.add(this.hips);

    // Hips / Lower Leotard
    const hipsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.24), this.suitMat);
    hipsMesh.castShadow = true;
    hipsMesh.position.y = 0.05;
    this.hips.add(hipsMesh);

    // Gold trim belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.26), this.trimMat);
    belt.position.y = 0.14;
    this.hips.add(belt);

    // 2. Chest & Torso
    this.chest = new THREE.Group();
    this.chest.position.y = 0.16;
    this.hips.add(this.chest);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.26), this.suitMat);
    chestMesh.castShadow = true;
    chestMesh.position.y = 0.18;
    this.chest.add(chestMesh);

    // Front Jersey Decal ("#7")
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

    // Back Decal ("HENRY 7")
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

    // 3. Head & Face
    this.head = new THREE.Group();
    this.head.position.y = 0.42;
    this.chest.add(this.head);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), this.skinMat);
    headMesh.castShadow = true;
    headMesh.position.y = 0.16;
    this.head.add(headMesh);

    const headband = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.34), this.headbandMat);
    headband.position.y = 0.26;
    this.head.add(headband);

    // Hair
    this.hairGroup = new THREE.Group();
    this.head.add(this.hairGroup);
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.36), this.hairMat);
    hairTop.position.y = 0.33;
    this.hairGroup.add(hairTop);

    for (let i = -1; i <= 1; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), this.hairMat);
      tuft.position.set(i * 0.1, 0.41, 0.05);
      tuft.rotation.x = -0.2;
      tuft.rotation.z = -i * 0.25;
      this.hairGroup.add(tuft);
    }

    // Expressive face
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

    // 4. Arms with Gymnastics Grips
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

    const leftGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    leftGrip.position.y = -0.34;
    this.leftArm.add(leftGrip);

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

    const rightGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    rightGrip.position.y = -0.34;
    this.rightArm.add(rightGrip);

    // 5. Legs
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

    // Spring shoe accessory (spring coil under left foot)
    this.springShoesLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 })
    );
    this.springShoesLeft.position.set(0, -0.42, 0.04);
    this.springShoesLeft.visible = false;
    this.leftLowerLeg.add(this.springShoesLeft);

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

    this.springShoesRight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 })
    );
    this.springShoesRight.position.set(0, -0.42, 0.04);
    this.springShoesRight.visible = false;
    this.rightLowerLeg.add(this.springShoesRight);

    // 6. Gymnastics Chalk-Board (Hoverboard)
    this.boardMesh = new THREE.Group();
    this.boardMesh.position.set(0, 0.08, 0);
    this.boardMesh.visible = false;

    // Aerodynamic board deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 1.6), this.boardMat);
    deck.castShadow = true;
    this.boardMesh.add(deck);

    // Glowing neon edge trims
    const neonTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.04, 1.62),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.boardMesh.add(neonTrim);

    // Magnetic levitation thruster rings underneath
    [-0.5, 0.5].forEach(tz => {
      const thruster = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.04, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(0, -0.06, tz);
      this.boardMesh.add(thruster);
    });

    this.group.add(this.boardMesh);

    // 7. Olympic Gymnastics Sky Rings
    this.gymRingsGroup = new THREE.Group();
    this.gymRingsGroup.visible = false;

    [-0.32, 0.32].forEach(rx => {
      const strap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      strap.position.set(rx, 1.6, 0);
      this.gymRingsGroup.add(strap);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.03, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 })
      );
      ring.position.set(rx, 1.0, 0);
      this.gymRingsGroup.add(ring);
    });

    this.group.add(this.gymRingsGroup);

    // 8. Dynamic Blob Contact Shadow (Grounding)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });

    this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.02; // Just above ground
    this.group.add(this.contactShadow);

    // 9. Chalk particles
    const particleCount = 45;
    this.chalkGeo = new THREE.BufferGeometry();
    this.chalkPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      this.chalkPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      this.chalkPositions[i * 3 + 1] = Math.random() * 0.4;
      this.chalkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    this.chalkGeo.setAttribute('position', new THREE.BufferAttribute(this.chalkPositions, 3));

    const chalkMat = new THREE.PointsMaterial({
      size: 0.16,
      map: this.createChalkTexture(),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.chalkParticles = new THREE.Points(this.chalkGeo, chalkMat);
    this.group.add(this.chalkParticles);
  }

  private createJerseyDecalCanvas(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 128px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('7', 128, 134);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

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
    ctx.fillText('HENRY', 128, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 74px sans-serif';
    ctx.fillText('7', 128, 130);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private createFaceCanvas(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 192);

    const drawEye = (x: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, 70, 24, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(x + 2, 72, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + 2, 72, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 2, 66, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEye(75);
    drawEye(181);

    ctx.strokeStyle = '#5a3825';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(56, 42);
    ctx.quadraticCurveTo(76, 32, 96, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 40);
    ctx.quadraticCurveTo(180, 32, 200, 42);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 6;
    ctx.arc(128, 118, 38, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
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

    return new THREE.CanvasTexture(canvas);
  }

  public applyOutfit(outfit: CharacterOutfit) {
    this.suitMat.color.set(outfit.suitColor);
    this.trimMat.color.set(outfit.trimColor);
    this.hairMat.color.set(outfit.hairColor);
    this.shoesMat.color.set(outfit.shoesColor);
    this.headbandMat.color.set(outfit.headbandColor);
  }

  public setBoardActive(active: boolean) {
    this.isBoardActive = active;
    this.boardMesh.visible = active;
  }

  public setSpringShoesActive(active: boolean) {
    this.isSpringShoesActive = active;
    this.springShoesLeft.visible = active;
    this.springShoesRight.visible = active;
  }

  public setFlyingActive(active: boolean) {
    this.isFlyingActive = active;
    this.gymRingsGroup.visible = active;
  }

  public triggerAnimation(anim: typeof this.currentAnim, duration: number = 0.6) {
    this.currentAnim = anim;
    this.animTimer = 0;
    this.animDuration = duration;
  }

  public getAnimationType() {
    return this.currentAnim;
  }

  // Update Henry's animations and contact shadow
  public update(dt: number, speedRatio: number = 1.0, currentPosY: number = 0, groundY: number = 0) {
    this.animTimer += dt;
    this.runCycleTime += dt * 11 * speedRatio;

    // Reset base rotations
    this.group.rotation.set(0, 0, 0);
    this.hips.rotation.set(0, 0, 0);
    this.chest.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);

    // Update Contact Shadow scale & opacity based on jump height
    const heightAboveGround = Math.max(0, currentPosY - groundY);
    this.contactShadow.position.y = groundY - currentPosY + 0.02;
    const shadowScale = Math.max(0.3, 1.2 - heightAboveGround * 0.15);
    this.contactShadow.scale.set(shadowScale, shadowScale, 1);
    (this.contactShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.7 - heightAboveGround * 0.12);

    const progress = Math.min(1.0, this.animTimer / this.animDuration);

    // If Riding Hoverboard, use cool surfer/acrobat stance
    if (this.isBoardActive && this.currentAnim === 'RUN') {
      this.hips.rotation.y = 0.45;
      this.leftArm.rotation.set(0, 0, 1.4);
      this.rightArm.rotation.set(0, 0, -1.4);
      this.leftLeg.rotation.set(0, 0.2, 0.2);
      this.rightLeg.rotation.set(0, -0.2, -0.2);
      this.boardMesh.rotation.y = Math.sin(this.runCycleTime * 0.5) * 0.08;
      this.boardMesh.position.y = 0.08 + Math.sin(this.runCycleTime * 2) * 0.03;
      return;
    }

    // If Flying with Sky Rings
    if (this.isFlyingActive) {
      this.leftArm.rotation.set(0, 0, 2.7);
      this.rightArm.rotation.set(0, 0, -2.7);
      this.leftLeg.rotation.set(0.3, 0, 0.1);
      this.rightLeg.rotation.set(0.3, 0, -0.1);
      this.chest.rotation.x = -0.3;
      return;
    }

    switch (this.currentAnim) {
      case 'RUN': {
        const cycle = this.runCycleTime;
        const swing = Math.sin(cycle);

        this.leftLeg.rotation.x = swing * 0.95;
        this.rightLeg.rotation.x = -swing * 0.95;
        this.leftLowerLeg.rotation.x = swing > 0 ? swing * 1.15 : 0.1;
        this.rightLowerLeg.rotation.x = -swing > 0 ? -swing * 1.15 : 0.1;

        this.leftArm.rotation.x = -swing * 0.85;
        this.rightArm.rotation.x = swing * 0.85;
        this.leftArm.rotation.z = 0.15;
        this.rightArm.rotation.z = -0.15;

        this.hips.position.y = 0.72 + Math.abs(Math.sin(cycle)) * 0.08;
        this.chest.rotation.y = -swing * 0.15;
        break;
      }

      case 'JUMP': {
        // High gymnastics tuck jump
        this.leftArm.rotation.set(0, 0, 2.4);
        this.rightArm.rotation.set(0, 0, -2.4);
        this.leftLeg.rotation.x = -1.3;
        this.rightLeg.rotation.x = -1.3;
        this.leftLowerLeg.rotation.x = 1.7;
        this.rightLowerLeg.rotation.x = 1.7;
        this.hips.position.y = 0.65;
        break;
      }

      case 'FLIP': {
        // 360 Acrobatic backflip!
        const flipAngle = progress * Math.PI * 2;
        this.group.rotation.x = -flipAngle;

        const tuck = Math.sin(progress * Math.PI);
        this.leftLeg.rotation.x = -1.8 * tuck;
        this.rightLeg.rotation.x = -1.8 * tuck;
        this.leftLowerLeg.rotation.x = 2.2 * tuck;
        this.rightLowerLeg.rotation.x = 2.2 * tuck;
        this.leftArm.rotation.x = 2.3 * tuck;
        this.rightArm.rotation.x = 2.3 * tuck;
        break;
      }

      case 'CARTWHEEL': {
        // Full sideways 360 aerial cartwheel
        const cartwheelAngle = progress * Math.PI * 2;
        this.group.rotation.z = cartwheelAngle;

        this.leftArm.rotation.set(0, 0, 2.5);
        this.rightArm.rotation.set(0, 0, -2.5);
        this.leftLeg.rotation.set(0, 0, 0.7);
        this.rightLeg.rotation.set(0, 0, -0.7);
        this.leftLowerLeg.rotation.x = 0;
        this.rightLowerLeg.rotation.x = 0;
        break;
      }

      case 'TWIST': {
        // 360 Full body twist
        const twistAngle = progress * Math.PI * 2;
        this.group.rotation.y = twistAngle;
        this.leftArm.rotation.set(0, 0, 2.8);
        this.rightArm.rotation.set(0, 0, -2.8);
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        break;
      }

      case 'SLIDE': {
        // Low gymnastics forward kip roll
        const rollAngle = progress * Math.PI * 2;
        this.group.rotation.x = rollAngle;
        this.hips.position.y = 0.35;

        this.leftLeg.rotation.x = -2.2;
        this.rightLeg.rotation.x = -2.2;
        this.leftLowerLeg.rotation.x = 2.2;
        this.rightLowerLeg.rotation.x = 2.2;
        this.leftArm.rotation.x = -1.9;
        this.rightArm.rotation.x = -1.9;
        break;
      }

      case 'VAULT': {
        // Olympic Vault: hands plant forward, legs whip through
        this.leftArm.rotation.set(-1.3, 0, 0.4);
        this.rightArm.rotation.set(-1.3, 0, -0.4);
        this.leftLeg.rotation.set(1.2, 0, 0.3);
        this.rightLeg.rotation.set(1.2, 0, -0.3);
        this.chest.rotation.x = 0.4;
        break;
      }

      case 'BALANCE': {
        this.leftArm.rotation.set(0, 0, 1.57);
        this.rightArm.rotation.set(0, 0, -1.57);
        const tipCycle = this.runCycleTime * 1.4;
        this.leftLeg.rotation.x = Math.sin(tipCycle) * 0.5;
        this.rightLeg.rotation.x = -Math.sin(tipCycle) * 0.5;
        this.chest.rotation.z = Math.sin(tipCycle * 0.5) * 0.12;
        break;
      }

      case 'STUMBLE': {
        this.group.rotation.x = 0.45;
        this.leftArm.rotation.set(-1.5, 0, 0.8);
        this.rightArm.rotation.set(-1.5, 0, -0.8);
        this.leftLeg.rotation.x = -0.5;
        this.rightLeg.rotation.x = 0.5;
        break;
      }

      case 'VICTORY': {
        this.leftArm.rotation.set(0, 0, 2.5);
        this.rightArm.rotation.set(0, 0, -2.5);
        this.leftLeg.rotation.set(0, 0, 0.25);
        this.rightLeg.rotation.set(0, 0, -0.25);
        this.chest.rotation.x = -0.15;
        this.head.rotation.x = -0.2;
        break;
      }
    }

    if (this.currentAnim !== 'RUN' && this.currentAnim !== 'STUMBLE' && this.currentAnim !== 'VICTORY') {
      if (this.animTimer >= this.animDuration) {
        this.triggerAnimation('RUN');
      }
    }
  }
}
