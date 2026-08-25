'use client';

import React, { Suspense, lazy, useState } from 'react';
import AnimatedCard from '@/components/motion/AnimatedCard';
import AnimatedNumber from '@/components/motion/AnimatedNumber';

const LoginScene3D = lazy(() => import('./LoginScene3D'));

const stats = [
  { id: 'stat-students', value: 2400, suffix: '+', label: 'Active Students' },
  { id: 'stat-notes', value: 8200, suffix: '+', label: 'Study Documents' },
  { id: 'stat-ai', value: 50, suffix: 'K+', label: 'AI Operations' },
];

export default function AuthLeftPanel() {
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  return (
    <div className="hidden lg:flex w-[52%] min-h-screen relative overflow-hidden bg-gradient-to-br from-[#060B18] via-[#0A142F] to-[#040813] flex-col items-center justify-center p-12 selection:bg-accent selection:text-black">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Atmospheric Ambient Floating Glowing Orbs with Slow Drift */}
      <div
        className="floating-orb orb-primary w-[550px] h-[550px] top-[-15%] left-[-15%] opacity-35 filter blur-[100px] animate-float-slow pointer-events-none"
      />
      <div
        className="floating-orb orb-accent w-[450px] h-[450px] bottom-[-15%] right-[-10%] opacity-30 filter blur-[110px] pointer-events-none"
        style={{ animation: 'float 7s ease-in-out infinite reverse' }}
      />
      <div
        className="floating-orb orb-warm w-[350px] h-[350px] top-1/2 left-1/4 opacity-20 filter blur-[120px] pointer-events-none"
      />

      {/* 3D Canvas Centerpiece */}
      <Suspense fallback={null}>
        <LoginScene3D />
      </Suspense>

      {/* Central Content with Staggered Entrance */}
      <div className="relative z-10 text-center max-w-md animate-fade-in-up">
        {/* Logo with breathing glow & 3D hover lift */}
        <div className="inline-flex items-center justify-center gap-3.5 mb-8 group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center shadow-glow border border-white/30 animate-pulse-glow group-hover:shadow-glow-accent transition-all duration-300">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="transition-transform duration-300 group-hover:scale-110">
              <path d="M15 3L27 9.5V20.5L15 27L3 20.5V9.5L15 3Z" fill="white" fillOpacity="0.9" />
              <path d="M15 8L22 12V18L15 22L8 18V12L15 8Z" fill="white" fillOpacity="0.4" />
              <circle cx="15" cy="15" r="3" fill="#00D8F6" className="animate-ping" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-2xl font-black text-gradient-primary leading-none tracking-tight">
              CAMPUS OS
            </div>
            <div className="text-[10px] text-accent tracking-widest font-mono-data font-800 uppercase mt-1">
              3D Blue Academic Universe
            </div>
          </div>
        </div>

        {/* Headline with Staggered Fade & Blur */}
        <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-4 tracking-tight">
          The Intelligent Operating System
          <br />
          <span className="text-gradient-primary">for Higher Education</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-500">
          Real AI academic assistance, 3D spatial interface, timetable intelligence, lecture notes,
          and automated institutional management.
        </p>

        {/* Feature pills with 3-5px hover lift, border illumination & scale */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-8">
          {[
            { id: 'feat-ai', label: '✨ Real AI Intelligence' },
            { id: 'feat-3d', label: '🌐 3D Spatial UI' },
            { id: 'feat-notes', label: '📄 Smart Notes Library' },
            { id: 'feat-exam', label: '📅 Exam Timetable' },
            { id: 'feat-events', label: '🏆 Campus Events' },
            { id: 'feat-search', label: '🔍 Unified Search' },
          ].map((feat) => {
            const isHovered = hoveredPill === feat.id;
            return (
              <span
                key={feat.id}
                onMouseEnter={() => setHoveredPill(feat.id)}
                onMouseLeave={() => setHoveredPill(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-700 glass-card border transition-all duration-200 cursor-default shadow-sm ${
                  isHovered
                    ? 'border-accent bg-accent/20 text-white -translate-y-1 scale-105 shadow-glow-accent'
                    : 'border-primary/30 text-foreground/90 hover:border-primary/60'
                }`}
              >
                {feat.label}
              </span>
            );
          })}
        </div>

        {/* 3D Animated Stat Cards */}
        <div className="grid grid-cols-3 gap-3.5">
          {stats.map((stat) => (
            <AnimatedCard
              key={stat.id}
              maxTilt={4}
              className="p-3.5 text-center border-primary/30 hover:border-accent/60 transition-all"
            >
              <div className="text-xl font-900 text-gradient-primary">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-700">{stat.label}</div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </div>
  );
}
