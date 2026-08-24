'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function NodeLattice({ count = 36 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  const [points, connections] = useMemo(() => {
    const pts: [number, number, number][] = [];
    const radius = 1.4;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      pts.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ]);
    }
    return [pts, []];
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Central Cyber Core */}
      <Sphere args={[0.65, 32, 32]}>
        <meshStandardMaterial
          color="#1E6BFF"
          emissive="#1E6BFF"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.8}
          wireframe
        />
      </Sphere>

      {/* Inner Glowing Core */}
      <Sphere args={[0.35, 16, 16]}>
        <meshBasicMaterial color="#00D8F6" wireframe={false} transparent opacity={0.7} />
      </Sphere>

      {/* Orbit Rings */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
        <mesh key={`ring-${i}`} rotation={[Math.PI / 2.5, angle, 0]}>
          <torusGeometry args={[1.25, 0.015, 8, 48]} />
          <meshStandardMaterial
            color="#00D8F6"
            emissive="#00D8F6"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Orbiting Satellite Nodes */}
      {points.slice(0, 16).map((pt, i) => (
        <mesh key={`pt-${i}`} position={pt}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#38BDF8' : '#60A5FA'}
            emissive="#38BDF8"
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function SpatialParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return [pos];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00D8F6" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Campus3DCore({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-24 h-24 rounded-full border-2 border-primary/30 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[220px] ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 5, 4]} color="#00D8F6" intensity={1.5} distance={8} />
        <pointLight position={[-4, -3, -2]} color="#1E6BFF" intensity={1.2} distance={6} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <NodeLattice />
        </Float>
        <SpatialParticles />
      </Canvas>
    </div>
  );
}
