/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameEngine } from './gameEngine';

interface ThreeCanvasProps {
  onEngineReady: (engine: GameEngine) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onEngineReady }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep urban night sky / twilight
    scene.fog = new THREE.Fog(0x0f172a, 35, 95);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(0, 3.6, -6.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig
    // Warm Key Light (Sun / Stadium floodlight)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(12, 24, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool Hemisphere fill light (Sky & ground bounce)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 1.1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Subtle Cyan / Magenta neon ambient glow
    const neonLight = new THREE.PointLight(0xa855f7, 1.5, 40);
    neonLight.position.set(-6, 8, 10);
    scene.add(neonLight);

    // 6. Initialize Game Engine
    const engine = new GameEngine(scene, camera);
    engineRef.current = engine;
    onEngineReady(engine);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 7. Render Loop with THREE.Clock
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Update light position to track player
      if (engine.status === 'PLAYING') {
        keyLight.position.z = engine.posZ + 10;
        keyLight.target.position.z = engine.posZ;
        keyLight.target.updateMatrixWorld();
      }

      engine.update(dt);
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onEngineReady]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden" />;
};
