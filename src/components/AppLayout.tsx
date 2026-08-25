'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AIFloatingButton from '@/app/student-dashboard/components/AIFloatingButton';
import CampusAIAssistantModal from '@/components/ai/CampusAIAssistantModal';
import AmbientBackground from '@/components/motion/AmbientBackground';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'admin';
  activePath?: string;
}

export default function AppLayout({ children, role, activePath }: AppLayoutProps) {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Global listener for custom AI open events and shortcut Cmd+I / Ctrl+I
  useEffect(() => {
    const handleOpenAI = () => setAiModalOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'j')) {
        e.preventDefault();
        setAiModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('campusos:open-ai', handleOpenAI);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('campusos:open-ai', handleOpenAI);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background relative selection:bg-accent selection:text-black">
      {/* 3D Ambient Lighting Depth Background */}
      <AmbientBackground />

      <Sidebar role={role} activePath={activePath} />
      <main className="flex-1 min-w-0 overflow-x-hidden relative z-10">{children}</main>

      {/* Global 3D Floating AI Orb & Assistant */}
      <AIFloatingButton onClick={() => setAiModalOpen(true)} role={role} />
      <CampusAIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}
