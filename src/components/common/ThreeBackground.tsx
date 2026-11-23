"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ==========================================
    // MATHEMATICAL 3D QUANTUM FOURIER WAVE MATRIX
    // ==========================================
    const waveGroup = new THREE.Group();
    waveGroup.position.set(0, -6, 0);
    waveGroup.rotation.x = -Math.PI / 3.2;
    masterGroup.add(waveGroup);

    const waveSegments = 54;
    const waveGeo = new THREE.PlaneGeometry(85, 85, waveSegments, waveSegments);
    const wavePositions = waveGeo.attributes.position;

    // Golden wireframe wave lines
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37, // Champagne Gold
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveGroup.add(waveMesh);

    // Glowing Lotus & Gold crest points at vertices
    const wavePointsMat = new THREE.PointsMaterial({
      size: 0.95,
      color: 0xe83a89, // Royal Lotus Pink
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const wavePoints = new THREE.Points(waveGeo, wavePointsMat);
    waveGroup.add(wavePoints);

    // Ambient floating golden celestial dust
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 1.1,
      color: 0xffd700,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Mouse Tracking for dynamic wave disturbance
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      masterGroup.rotation.y = currentMouseX * 0.25;
      masterGroup.rotation.x = currentMouseY * 0.15;

      // Mathematical Fourier Ripple Physics
      const pos = wavePositions.array as Float32Array;
      for (let i = 0; i < wavePositions.count; i++) {
        const vx = pos[i * 3];
        const vy = pos[i * 3 + 1];

        // Distance from center
        const dist = Math.sqrt(vx * vx + vy * vy);

        // Continuous harmonic wave formula
        const zWave =
          Math.sin(vx * 0.2 + time * 1.6) * Math.cos(vy * 0.2 + time * 1.3) * 2.8 +
          Math.sin(dist * 0.3 - time * 2.0) * 1.9 +
          Math.cos((vx + vy) * 0.12 + time * 0.9) * 1.3;

        // Interactive mouse gravity perturbation ripple
        const mouseDist = Math.hypot(vx - currentMouseX * 32, vy - currentMouseY * 32);
        const mouseRipple =
          Math.sin(mouseDist * 0.45 - time * 3.5) * Math.exp(-mouseDist * 0.07) * 2.2;

        pos[i * 3 + 2] = zWave + mouseRipple;
      }
      wavePositions.needsUpdate = true;

      // Slow majestic rotation of wave horizon
      waveGroup.rotation.z = Math.sin(time * 0.1) * 0.08;

      // Celestial dust drift
      dust.rotation.y += 0.0005;
      dust.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      waveGeo.dispose();
      waveMat.dispose();
      wavePointsMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
