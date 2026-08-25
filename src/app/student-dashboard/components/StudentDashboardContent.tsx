'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentKPIGrid from './StudentKPIGrid';
import StudentTimetableWidget from './StudentTimetableWidget';
import StudentAnnouncementsFeed from './StudentAnnouncementsFeed';
import StudentNotesGrid from './StudentNotesGrid';
import StudentChartsRow from './StudentChartsRow';
import StudentDashboardHeader from './StudentDashboardHeader';
import StudentFlashcardsView from './StudentFlashcardsView';
import StudentNotesExplorer from './StudentNotesExplorer';
import StudentSubjectsView from './StudentSubjectsView';
import StudentTimetableFull from './StudentTimetableFull';
import StudentExamsView from './StudentExamsView';
import StudentEventsView from './StudentEventsView';
import StudentProfileView from './StudentProfileView';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';

function StudentTabRouter() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const openGlobalAI = () => {
    window.dispatchEvent(new CustomEvent('campusos:open-ai'));
  };

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
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 border border-primary/40 text-center space-y-5 animate-modal-pop">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center text-3xl mx-auto shadow-glow text-white animate-float-slow">
            ✨
          </div>
          <h2 className="text-2xl font-800 text-foreground tracking-tight">
            Campus OS AI Study Tutor & Mentor
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Get personalized 1-on-1 tutoring on OS, DBMS, Algorithms, code debugging, study plan
            generation, and instant exam revision.
          </p>
          <button
            onClick={openGlobalAI}
            className="btn-primary px-7 py-3.5 rounded-2xl text-sm font-800 shadow-glow cursor-pointer btn-press"
          >
            Launch Interactive AI Assistant →
          </button>
        </div>
      );
    case 'overview':
    default:
      return (
        <div className="space-y-6">
          <StaggerItem order={1}>
            <StudentKPIGrid />
          </StaggerItem>
          <StaggerItem order={2}>
            <StudentChartsRow />
          </StaggerItem>
          <StaggerItem order={3}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
              <div className="xl:col-span-2">
                <StudentTimetableWidget />
              </div>
              <div>
                <StudentAnnouncementsFeed />
              </div>
            </div>
          </StaggerItem>
          <StaggerItem order={4}>
            <StudentNotesGrid />
          </StaggerItem>
        </div>
      );
  }
}

export default function StudentDashboardContent() {
  return (
    <div className="min-h-screen px-4 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
      <StudentDashboardHeader />
      <PageTransition>
        <Suspense fallback={<div className="h-64 rounded-3xl glass-card animate-pulse" />}>
          <StudentTabRouter />
        </Suspense>
      </PageTransition>
    </div>
  );
}
