'use client';

import React from 'react';
import { TeacherFilterState } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';

interface TeacherFilterBarProps {
  filters: TeacherFilterState;
  onChange: (newFilters: TeacherFilterState) => void;
  totalFilteredStudents?: number;
}

export default function TeacherFilterBar({
  filters,
  onChange,
  totalFilteredStudents = 154,
}: TeacherFilterBarProps) {
  const handleFilterChange = (key: keyof TeacherFilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({
      gradeYear: 'all',
      semester: 'all',
      subject: 'all',
      section: 'all',
    });
  };

  const isFiltered =
    filters.gradeYear !== 'all' ||
    filters.semester !== 'all' ||
    filters.subject !== 'all' ||
    filters.section !== 'all';

  return (
    <AnimatedCard className="p-4 sm:p-5 border-primary/30 space-y-3 shadow-glass">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm animate-float-slow">🎯</span>
          <span className="text-xs font-800 uppercase tracking-wider text-foreground">
            BCA Academic Cohort & Subject Filter
          </span>
          <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-full font-800 shadow-sm">
            {totalFilteredStudents} Students In Scope
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="text-xs text-accent hover:underline font-700 self-start md:self-auto cursor-pointer btn-press"
          >
            Reset Filters ↺
          </button>
        )}
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Grade / Year */}
        <div>
          <label className="block text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
            BCA Academic Year
          </label>
          <select
            value={filters.gradeYear}
            onChange={(e) => handleFilterChange('gradeYear', e.target.value)}
            className="input-field py-1.5 text-xs font-700 cursor-pointer hover:border-accent transition-all btn-press"
          >
            <option value="all">All Years (1st, 2nd, 3rd)</option>
            <option value="1">1st Year (Sem 1 & 2)</option>
            <option value="2">2nd Year (Sem 3 & 4)</option>
            <option value="3">3rd Year (Sem 5 & 6)</option>
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
            BCA Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="input-field py-1.5 text-xs font-700 cursor-pointer hover:border-accent transition-all btn-press"
          >
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5 (Active)</option>
            <option value="6">Semester 6</option>
          </select>
        </div>

        {/* Course Subject */}
        <div>
          <label className="block text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
            Course Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="input-field py-1.5 text-xs font-700 cursor-pointer hover:border-accent transition-all btn-press"
          >
            <option value="all">All Assigned Subjects</option>
            <option value="Operating Systems">Operating Systems (CS501)</option>
            <option value="OS Lab Practical">OS Lab Practical (CS501L)</option>
            <option value="Data Structures">Data Structures (CS301)</option>
            <option value="Database Management Systems">DBMS (CS502)</option>
            <option value="Computer Networks">Computer Networks (CS503)</option>
            <option value="Java Programming">Java Programming (CS504)</option>
          </select>
        </div>

        {/* Section / Division */}
        <div>
          <label className="block text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
            Section / Batch
          </label>
          <select
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="input-field py-1.5 text-xs font-700 cursor-pointer hover:border-accent transition-all btn-press"
          >
            <option value="all">All Sections & Batches</option>
            <option value="A">Section A (Theory)</option>
            <option value="B">Section B (Theory)</option>
            <option value="Batch 1">Lab Batch 1</option>
            <option value="Batch 2">Lab Batch 2</option>
          </select>
        </div>
      </div>
    </AnimatedCard>
  );
}
