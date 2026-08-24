'use client';

import React, { Suspense, lazy } from 'react';

const LoginScene3D = lazy(() => import('./LoginScene3D'));

const stats = [
  { id: 'stat-students', value: '2,400+', label: 'Active Students' },
  { id: 'stat-notes', value: '8,200+', label: 'Study Documents' },
  { id: 'stat-ai', value: '50K+', label: 'AI Operations' },
];

export default function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-[52%] min-h-screen relative overflow-hidden bg-gradient-to-br from-[#060B18] via-[#0A142F] to-[#040813] flex-col items-center justify-center p-12">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="floating-orb orb-primary w-[500px] h-[500px] top-[-20%] left-[-10%] opacity-35" />
      <div className="floating-orb orb-accent w-[400px] h-[400px] bottom-[-15%] right-[-10%] opacity-30" />

      {/* 3D Canvas */}
      <Suspense fallback={null}>
        <LoginScene3D />
      </Suspense>

      {/* Central content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center glow-primary shadow-glow border border-white/20">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 3L27 9.5V20.5L15 27L3 20.5V9.5L15 3Z" fill="white" fillOpacity="0.9" />
              <path d="M15 8L22 12V18L15 22L8 18V12L15 8Z" fill="white" fillOpacity="0.4" />
              <circle cx="15" cy="15" r="3" fill="#00D8F6" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-2xl font-extrabold text-gradient-primary leading-none tracking-tight">
              CAMPUS OS
            </div>
            <div className="text-[11px] text-accent tracking-widest font-mono-data font-700 uppercase mt-0.5">
              3D Blue Academic Universe
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl font-800 text-foreground leading-tight mb-4">
          The Intelligent Operating System
          <br />
          <span className="text-gradient-primary">for Higher Education</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Real AI academic assistance, 3D spatial interface, timetable intelligence, lecture notes,
          and automated institutional management.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'feat-ai', label: '✨ Real AI Intelligence' },
            { id: 'feat-3d', label: '🌐 3D Spatial UI' },
            { id: 'feat-notes', label: '📄 Smart Notes Library' },
            { id: 'feat-exam', label: '📅 Exam Timetable' },
            { id: 'feat-events', label: '🏆 Campus Events' },
            { id: 'feat-search', label: '🔍 Unified Search' },
          ].map((feat) => (
            <span
              key={feat.id}
              className="px-3 py-1.5 rounded-full text-xs font-600 glass-card border border-primary/30 text-foreground/90 shadow-sm"
            >
              {feat.label}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3.5">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="glass-card rounded-2xl p-3.5 text-center border border-primary/25"
            >
              <div className="text-xl font-800 text-gradient-primary metric-value">
                {stat.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </div>
  );
}
