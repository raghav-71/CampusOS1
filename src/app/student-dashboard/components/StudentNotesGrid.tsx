'use client';

import React, { useState } from 'react';

const notes = [
  {
    id: 'note-001',
    title: 'Memory Management — Virtual Memory & Paging',
    subject: 'Operating Systems',
    semester: 'Sem 5',
    teacher: 'Dr. Priya Nair',
    tags: ['OS', 'Memory', 'Paging'],
    uploadedAt: 'Aug 21, 2026',
    downloads: 142,
    pages: 24,
    size: '3.2 MB',
    isNew: true,
  },
  {
    id: 'note-002',
    title: 'SQL Advanced Queries & Stored Procedures',
    subject: 'DBMS',
    semester: 'Sem 5',
    teacher: 'Prof. Rajan Mehta',
    tags: ['SQL', 'Procedures', 'DBMS'],
    uploadedAt: 'Aug 20, 2026',
    downloads: 98,
    pages: 18,
    size: '2.1 MB',
    isNew: true,
  },
  {
    id: 'note-003',
    title: 'TCP/IP Stack Deep Dive',
    subject: 'Computer Networks',
    semester: 'Sem 5',
    teacher: 'Dr. Kavitha Rao',
    tags: ['TCP', 'Networking', 'Protocols'],
    uploadedAt: 'Aug 19, 2026',
    downloads: 211,
    pages: 32,
    size: '4.8 MB',
    isNew: false,
  },
  {
    id: 'note-004',
    title: 'Graph Algorithms — Dijkstra & Bellman-Ford',
    subject: 'DAA',
    semester: 'Sem 5',
    teacher: 'Dr. Suresh Pillai',
    tags: ['Graphs', 'Algorithms', 'DAA'],
    uploadedAt: 'Aug 18, 2026',
    downloads: 176,
    pages: 28,
    size: '3.9 MB',
    isNew: false,
  },
  {
    id: 'note-005',
    title: 'Java Collections Framework Complete Guide',
    subject: 'Java Programming',
    semester: 'Sem 5',
    teacher: 'Prof. Anil Kumar',
    tags: ['Java', 'Collections', 'OOP'],
    uploadedAt: 'Aug 17, 2026',
    downloads: 324,
    pages: 40,
    size: '5.6 MB',
    isNew: false,
  },
  {
    id: 'note-006',
    title: 'Process Scheduling Algorithms — Round Robin, FCFS',
    subject: 'Operating Systems',
    semester: 'Sem 5',
    teacher: 'Dr. Priya Nair',
    tags: ['OS', 'Scheduling', 'CPU'],
    uploadedAt: 'Aug 15, 2026',
    downloads: 189,
    pages: 22,
    size: '2.8 MB',
    isNew: false,
  },
];

const subjectColors: Record<string, string> = {
  'Operating Systems': 'badge-violet',
  DBMS: 'badge-cyan',
  'Computer Networks': 'badge-success',
  'Java Programming': 'badge-warning',
  DAA: 'badge-muted',
};

const filters = [
  'All Subjects',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Java Programming',
  'DAA',
];

export default function StudentNotesGrid() {
  const [activeFilter, setActiveFilter] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notes.filter((note) => {
    const matchesFilter = activeFilter === 'All Subjects' || note.subject === activeFilter;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-600 text-foreground">Recent Notes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest uploads from your teachers</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 w-48">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          <button className="btn-secondary text-xs px-3 py-2">View All Notes →</button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {filters.map((filter) => (
          <button
            key={`filter-${filter.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-500 transition-all duration-150 ${
              activeFilter === filter
                ? 'bg-primary text-white shadow-glow'
                : 'glass-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-border text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center text-muted-foreground">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h4 className="text-base font-600 text-foreground mb-1">No notes found</h4>
          <p className="text-sm text-muted-foreground">
            Try changing the subject filter or search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: (typeof notes)[0];
}

function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-border glass-card-hover cursor-pointer relative overflow-hidden group">
      {note.isNew && (
        <span className="absolute top-3 right-3 badge-success text-xs px-2 py-0.5 rounded-md font-600">
          New
        </span>
      )}
      {/* File icon */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.8"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <p className="text-sm font-600 text-foreground leading-snug line-clamp-2">{note.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{note.teacher}</p>
        </div>
      </div>

      {/* Subject badge + tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-md font-500 ${subjectColors[note.subject] || 'badge-muted'}`}
        >
          {note.subject}
        </span>
        <span className="badge-muted text-xs px-2 py-0.5 rounded-md font-500">{note.semester}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-border/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span className="metric-value">{note.downloads}</span>
          </span>
          <span>{note.pages}p</span>
          <span>{note.size}</span>
        </div>
        <span>{note.uploadedAt}</span>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card/95 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex gap-2">
        <button className="flex-1 btn-primary text-xs py-1.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
        <button className="flex-1 btn-secondary text-xs py-1.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}
