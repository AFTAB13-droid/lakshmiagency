"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeEmblem({ size = 80 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    // Group for complex 3D shape
    const group = new THREE.Group();
    scene.add(group);

    // Central 3D Icosahedron Gem (Champagne Gold metallic)
    const gemGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Gold
      metalness: 0.85,
      roughness: 0.2,
      wireframe: false,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    group.add(gem);

    // Outer Wireframe Rings (Royal Lotus / Plum)
    const wireGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xe83a89, // Lotus Pink
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // Torus Halo Ring (Floating Gold Aura)
    const haloGeo = new THREE.TorusGeometry(1.8, 0.04, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 3;
    group.add(halo);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffd700, 3, 10);
    pointLight1.position.set(2, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe83a89, 2, 10);
    pointLight2.position.set(-2, -3, 2);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.003;
      mouseY = y * 0.003;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      group.rotation.y += 0.012;
      group.rotation.x += 0.006;
      halo.rotation.z += 0.015;

      // Smooth mouse follow
      group.rotation.y += (mouseX - group.rotation.y) * 0.05;
      group.rotation.x += (mouseY - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      gemGeo.dispose();
      gemMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
      title="Lakshmi 3D Interactive Emblem"
    />
  );
}
