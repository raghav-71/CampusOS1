'use client';

import React, { Suspense, lazy } from 'react';

const LoginScene3D = lazy(() => import('./LoginScene3D'));

const stats = [
  { id: 'stat-students', value: '2,400+', label: 'Active Students' },
  { id: 'stat-notes', value: '8,200+', label: 'Study Notes' },
  { id: 'stat-ai', value: '50K+', label: 'AI Queries' },
];

export default function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-[52%] min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0D0B1F] via-[#130F2E] to-[#0A1020] flex-col items-center justify-center p-12">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Gradient orbs (CSS layer beneath 3D) */}
      <div className="floating-orb orb-primary w-[500px] h-[500px] top-[-20%] left-[-10%] opacity-30" />
      <div className="floating-orb orb-accent w-[400px] h-[400px] bottom-[-15%] right-[-10%] opacity-25" />

      {/* ── 3D Canvas ── */}
      <Suspense fallback={null}>
        <LoginScene3D />
      </Suspense>

      {/* Central content — sits above the 3D canvas */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary shadow-glow">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 3L27 9.5V20.5L15 27L3 20.5V9.5L15 3Z" fill="white" fillOpacity="0.9" />
              <path d="M15 8L22 12V18L15 22L8 18V12L15 8Z" fill="white" fillOpacity="0.4" />
              <circle cx="15" cy="15" r="3" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-2xl font-800 text-gradient-primary leading-none">CAMPUS OS</div>
            <div className="text-xs text-muted-foreground tracking-widest font-500 uppercase mt-0.5">Your College Universe</div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl font-800 text-foreground leading-tight mb-4">
          Everything you need
          <br />
          <span className="text-gradient-primary">for college life</span>
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed mb-10">
          Notes, timetables, events, exams, and an AI study assistant — all in one platform built for modern students.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { id: 'feat-ai', label: '🤖 AI Study Assistant' },
            { id: 'feat-notes', label: '📄 Smart Notes' },
            { id: 'feat-exam', label: '📅 Exam Timetable' },
            { id: 'feat-events', label: '🎉 Campus Events' },
            { id: 'feat-search', label: '🔍 Global Search' },
            { id: 'feat-realtime', label: '⚡ Realtime Updates' },
          ]?.map((feat) => (
            <span
              key={feat?.id}
              className="px-3 py-1.5 rounded-full text-xs font-500 glass-card border border-white/10 text-foreground/80"
            >
              {feat?.label}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats?.map((stat) => (
            <div key={stat?.id} className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-800 text-gradient-primary metric-value">{stat?.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-500">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}