'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockSubjects, mockNotes, mockUsers } from '@/repositories/mockData';
import { Role } from '@/types/campus';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: Role;
}

interface SearchResultItem {
  id: string;
  category: 'Page' | 'Subject' | 'Note' | 'Person';
  title: string;
  subtitle: string;
  href: string;
  badgeColor?: string;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  userRole = 'student',
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal handled via custom event or props
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const defaultPages = useMemo<SearchResultItem[]>(() => {
    const pages: SearchResultItem[] = [
      { id: 'p-std-dash', category: 'Page', title: 'Student Dashboard', subtitle: 'Study overview & progress', href: '/student-dashboard?tab=overview' },
      { id: 'p-std-notes', category: 'Page', title: 'Notes & Study Materials', subtitle: 'Lecture notes library', href: '/student-dashboard?tab=notes' },
      { id: 'p-std-tt', category: 'Page', title: 'Class Timetable', subtitle: 'Weekly schedules & lecture rooms', href: '/student-dashboard?tab=timetable' },
      { id: 'p-tch-dash', category: 'Page', title: 'Faculty Dashboard', subtitle: 'Teacher overview & schedule', href: '/teacher-dashboard?tab=overview' },
      { id: 'p-tch-att', category: 'Page', title: 'Attendance Register', subtitle: 'Mark student attendance', href: '/teacher-dashboard?tab=attendance' },
      { id: 'p-tch-asg', category: 'Page', title: 'Assignments & Grading', subtitle: 'Evaluate student submissions', href: '/teacher-dashboard?tab=assignments' },
      { id: 'p-adm-dash', category: 'Page', title: 'Admin Central Dashboard', subtitle: 'Institutional overview', href: '/admin-dashboard?tab=overview' },
      { id: 'p-adm-usr', category: 'Page', title: 'User Management', subtitle: 'Student & faculty directory', href: '/admin-dashboard?tab=students' },
    ];
    return pages;
  }, []);

  const results = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) {
      return defaultPages.slice(0, 6);
    }
    const q = query.toLowerCase();

    const pageMatches: SearchResultItem[] = defaultPages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    );

    const subjectMatches: SearchResultItem[] = mockSubjects
      .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
      .map((s) => ({
        id: `sub-${s.id}`,
        category: 'Subject',
        title: `${s.name} (${s.code})`,
        subtitle: `${s.department} · ${s.semester} · Instructor: ${s.instructor}`,
        href: userRole === 'teacher' ? `/teacher-dashboard?tab=classes` : `/student-dashboard?tab=subjects`,
        badgeColor: s.colorBadge,
      }));

    const noteMatches: SearchResultItem[] = mockNotes
      .filter((n) => n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)))
      .map((n) => ({
        id: `note-${n.id}`,
        category: 'Note',
        title: n.title,
        subtitle: `${n.subject} · By ${n.teacher} · ${n.pages} pages`,
        href: `/student-dashboard?tab=notes`,
        badgeColor: 'badge-violet',
      }));

    const userMatches: SearchResultItem[] = mockUsers
      .filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department && u.department.toLowerCase().includes(q)))
      .map((u) => ({
        id: `usr-${u.id}`,
        category: 'Person',
        title: u.fullName,
        subtitle: `${u.role.toUpperCase()} · ${u.email} · ${u.department || ''}`,
        href: userRole === 'admin' ? `/admin-dashboard?tab=students` : `/student-dashboard?tab=profile`,
        badgeColor: u.role === 'teacher' ? 'badge-cyan' : u.role === 'admin' ? 'badge-warning' : 'badge-violet',
      }));

    return [...pageMatches, ...subjectMatches, ...noteMatches, ...userMatches];
  }, [query, defaultPages, userRole]);

  const handleSelect = (item: SearchResultItem) => {
    router.push(item.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* Palette Card */}
      <div className="relative glass-card rounded-2xl border border-primary/30 shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in-up">
        {/* Search input header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/80 bg-card/40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search pages, subjects, lecture notes, users... (↑↓ to navigate)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            autoFocus
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono-data px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No matching pages, subjects, or notes found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'bg-primary/15 border border-primary/30 text-foreground' : 'hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-md font-600 badge-muted flex-shrink-0">
                      {item.category}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-600 truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">↵ Select</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>CampusOS Quick Navigation</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
