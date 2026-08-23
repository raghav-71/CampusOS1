'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ─── Reduced Motion Hook ──────────────────────────────────────────────────────
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

// ─── Floating Book ────────────────────────────────────────────────────────────
function FloatingBook({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={reducedMotion ? 0 : 0.3} floatIntensity={reducedMotion ? 0 : 0.8}>
      <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
        {/* Book body */}
        <boxGeometry args={[0.4, 0.55, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Book spine */}
      <mesh position={[position[0] - 0.21, position[1], position[2]]} rotation={rotation}>
        <boxGeometry args={[0.02, 0.55, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </Float>
  );
}

// ─── Floating Graduation Cap ──────────────────────────────────────────────────
function GraduationCap({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Board */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.7]} />
        <meshStandardMaterial color="#6C47FF" roughness={0.2} metalness={0.6} emissive="#6C47FF" emissiveIntensity={0.15} />
      </mesh>
      {/* Top button */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 8]} />
        <meshStandardMaterial color="#A78BFA" roughness={0.1} metalness={0.8} emissive="#A78BFA" emissiveIntensity={0.3} />
      </mesh>
      {/* Tassel string */}
      <mesh position={[0.25, -0.05, 0.25]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ─── Floating Atom ────────────────────────────────────────────────────────────
function FloatingAtom({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.6;
    groupRef.current.rotation.x = state.clock.elapsedTime * 0.3;
  });

  const orbitMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.1, metalness: 0.9, emissive: '#38BDF8', emissiveIntensity: 0.4 }),
    []
  );

  return (
    <Float speed={reducedMotion ? 0 : 2} floatIntensity={reducedMotion ? 0 : 1}>
      <group ref={groupRef} position={position}>
        {/* Nucleus */}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#F472B6" roughness={0.1} metalness={0.8} emissive="#F472B6" emissiveIntensity={0.5} />
        </mesh>
        {/* Orbit rings */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
          <mesh key={`orbit-${i}`} rotation={[Math.PI / 2, angle, 0]}>
            <torusGeometry args={[0.35, 0.015, 8, 48]} />
            <primitive object={orbitMaterial} />
          </mesh>
        ))}
        {/* Electrons */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
          <mesh key={`electron-${i}`} position={[Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// ─── Floating Bulb ────────────────────────────────────────────────────────────
function FloatingBulb({ position }: { position: [number, number, number] }) {
  const reducedMotion = useReducedMotion();
  return (
    <Float speed={reducedMotion ? 0 : 1.8} rotationIntensity={reducedMotion ? 0 : 0.5} floatIntensity={reducedMotion ? 0 : 1.2}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#FDE68A" roughness={0.05} metalness={0.1} emissive="#F59E0B" emissiveIntensity={0.6} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.1, 8]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Glow point light */}
        <pointLight color="#F59E0B" intensity={reducedMotion ? 0 : 1.5} distance={2} decay={2} />
      </group>
    </Float>
  );
}

// ─── Floating Laptop ──────────────────────────────────────────────────────────
function FloatingLaptop({ position }: { position: [number, number, number] }) {
  const reducedMotion = useReducedMotion();
  return (
    <Float speed={reducedMotion ? 0 : 1.2} rotationIntensity={reducedMotion ? 0 : 0.4} floatIntensity={reducedMotion ? 0 : 0.9}>
      <group position={position} rotation={[0, Math.PI / 6, 0]}>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.04, 0.4]} />
          <meshStandardMaterial color="#1E1B4B" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.22, -0.18]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.03]} />
          <meshStandardMaterial color="#1E1B4B" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0.22, -0.165]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.54, 0.34, 0.001]} />
          <meshStandardMaterial color="#6C47FF" emissive="#6C47FF" emissiveIntensity={0.8} roughness={0} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Particle Field ───────────────────────────────────────────────────────────
function ParticleField({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6C47FF'),
      new THREE.Color('#38BDF8'),
      new THREE.Color('#A78BFA'),
      new THREE.Color('#F472B6'),
      new THREE.Color('#34D399'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ─── Ambient Energy Orb ───────────────────────────────────────────────────────
function EnergyOrb({ position, color }: { position: [number, number, number]; color: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <Float speed={reducedMotion ? 0 : 1} floatIntensity={reducedMotion ? 0 : 0.5}>
      <Sphere args={[0.5, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={reducedMotion ? 0 : 0.4}
          speed={reducedMotion ? 0 : 2}
          roughness={0}
          transparent
          opacity={0.12}
        />
      </Sphere>
      <pointLight position={position} color={color} intensity={reducedMotion ? 0.5 : 1.5} distance={4} decay={2} />
    </Float>
  );
}

// ─── Camera Drift ─────────────────────────────────────────────────────────────
function CameraDrift() {
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (reducedMotion) return;
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.4;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.06) * 0.25;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <CameraDrift />

      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#A78BFA" castShadow />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#38BDF8" />
      <pointLight position={[0, 5, 2]} color="#6C47FF" intensity={1.2} distance={8} decay={2} />

      {/* Stars background */}
      <Stars radius={30} depth={20} count={800} factor={2} saturation={0.5} fade speed={0.5} />

      {/* Particle field */}
      <ParticleField count={180} />

      {/* Energy orbs for ambient glow */}
      <EnergyOrb position={[-4, 2, -3]} color="#6C47FF" />
      <EnergyOrb position={[4, -2, -4]} color="#38BDF8" />
      <EnergyOrb position={[0, -3, -2]} color="#F472B6" />

      {/* Floating educational objects */}
      <FloatingBook position={[-3.5, 1.5, -1]} rotation={[0.2, 0.5, 0.1]} color="#6C47FF" />
      <FloatingBook position={[3.2, -1.2, -2]} rotation={[-0.1, -0.3, 0.15]} color="#38BDF8" />
      <FloatingBook position={[-2.8, -2, -1.5]} rotation={[0.3, 0.8, -0.1]} color="#34D399" />

      <GraduationCap position={[3.5, 2, -1.5]} />
      <GraduationCap position={[-3, -1.5, -2]} />

      <FloatingAtom position={[2.5, 1.8, -0.5]} />
      <FloatingAtom position={[-4, 0.5, -2]} />

      <FloatingBulb position={[1.5, -2.5, -1]} />
      <FloatingBulb position={[-1.8, 2.8, -1.5]} />

      <FloatingLaptop position={[4, 0.5, -1]} />
      <FloatingLaptop position={[-4.5, -0.5, -2.5]} />
    </>
  );
}

// ─── Exported Canvas Wrapper ──────────────────────────────────────────────────
export default function LoginScene3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        shadows={false}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
