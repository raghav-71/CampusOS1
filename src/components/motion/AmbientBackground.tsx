'use client';

import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep Cyber Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Top Left Electric Blue Light Nebula */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-35 filter blur-[100px] animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(30, 107, 255, 0.45) 0%, transparent 70%)',
        }}
      />

      {/* Bottom Right Cyan Hologram Aura */}
      <div
        className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full opacity-30 filter blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 216, 246, 0.35) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite reverse',
        }}
      />

      {/* Center Subtle Indigo Ambient Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 filter blur-[120px]"
        style={{
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.25) 0%, transparent 75%)',
        }}
      />
    </div>
  );
}
