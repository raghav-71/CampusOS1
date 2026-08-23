'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentKPIGrid from './StudentKPIGrid';
import StudentTimetableWidget from './StudentTimetableWidget';
import StudentAnnouncementsFeed from './StudentAnnouncementsFeed';
import StudentNotesGrid from './StudentNotesGrid';
import StudentChartsRow from './StudentChartsRow';
import StudentDashboardHeader from './StudentDashboardHeader';
import AIFloatingButton from './AIFloatingButton';
import StudentFlashcardsView from './StudentFlashcardsView';
import StudentNotesExplorer from './StudentNotesExplorer';
import StudentSubjectsView from './StudentSubjectsView';
import StudentTimetableFull from './StudentTimetableFull';
import StudentExamsView from './StudentExamsView';
import StudentEventsView from './StudentEventsView';
import StudentProfileView from './StudentProfileView';
import StudentAIDrawer from '@/components/ai/StudentAIDrawer';

function StudentTabRouter({ onOpenAI }: { onOpenAI: () => void }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  switch (currentTab) {
    case 'flashcards':
      return <StudentFlashcardsView />;
    case 'notes':
      return <StudentNotesExplorer />;
    case 'subjects':
      return <StudentSubjectsView />;
    case 'timetable':
      return <StudentTimetableFull />;
    case 'exams':
      return <StudentExamsView />;
    case 'events':
      return <StudentEventsView />;
    case 'profile':
      return <StudentProfileView />;
    case 'announcements':
      return (
        <div className="max-w-3xl mx-auto">
          <StudentAnnouncementsFeed />
        </div>
      );
    case 'ai':
      return (
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 border border-primary/40 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl mx-auto shadow-glow text-white">
            ✨
          </div>
          <h2 className="text-2xl font-800 text-foreground">CampusOS AI Study Tutor & Mentor</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Get 1-on-1 tutoring on OS, DBMS, Algorithms, code debugging, and instant exam revision.
          </p>
          <button
            onClick={onOpenAI}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-700 shadow-glow cursor-pointer"
          >
            Launch Interactive AI Assistant →
          </button>
        </div>
      );
    case 'overview':
    default:
      return (
        <>
          <StudentKPIGrid />
          <StudentChartsRow />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
            <div className="xl:col-span-2">
              <StudentTimetableWidget />
            </div>
            <div>
              <StudentAnnouncementsFeed />
            </div>
          </div>
          <StudentNotesGrid />
        </>
      );
  }
}

export default function StudentDashboardContent() {
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen px-4 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
      <StudentDashboardHeader />
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse" />}>
        <StudentTabRouter onOpenAI={() => setAiDrawerOpen(true)} />
      </Suspense>
      <AIFloatingButton onClick={() => setAiDrawerOpen(true)} />
      <StudentAIDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </div>
  );
}