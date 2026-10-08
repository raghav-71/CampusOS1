'use client';

import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Subtle Academic Dot Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Top Left Delicate Light Green Accent Glow */}
      <div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-40 filter blur-[90px] animate-float-slow pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(220, 252, 231, 0.75) 0%, rgba(240, 253, 244, 0) 70%)',
        }}
      />

      {/* Top Right Very Soft Warm Ambient Glow */}
      <div
        className="absolute -top-20 right-1/4 w-[450px] h-[350px] rounded-full opacity-25 filter blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(240, 253, 244, 0.9) 0%, transparent 70%)',
        }}
      />

      {/* Bottom Right Soft Emerald Hint */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-35 filter blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(220, 252, 231, 0.65) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
