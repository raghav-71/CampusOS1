'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockNotes } from '@/repositories/mockData';
import { NoteDocument } from '@/types/campus';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function StudentNotesExplorer() {
  const [notesList, setNotesList] = useState<NoteDocument[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedNote, setSelectedNote] = useState<NoteDocument | null>(null);
  const [readerPage, setReaderPage] = useState(1);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);

  const filteredNotes = notesList.filter((note) => {
    const matchSubject =
      selectedSubject === 'all' ||
      note.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubject && matchSearch;
  });

  const handleOpenReader = (note: NoteDocument) => {
    setSelectedNote(note);
    setReaderPage(1);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkedNotes.includes(id)) {
      setBookmarkedNotes((prev) => prev.filter((n) => n !== id));
      toast.info('Removed from saved bookmarks');
    } else {
      setBookmarkedNotes((prev) => [...prev, id]);
      toast.success('Added note to your saved bookmarks');
    }
  };

  const handleDownload = (note: NoteDocument) => {
    toast.success(`Downloading "${note.title}.pdf" (${note.fileSize || '3.4 MB'})`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">Lecture Notes & Documents Library</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified syllabus chapters, laboratory manuals, and cheat sheets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 w-56 sm:w-64">
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
                placeholder="Search notes, chapters, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>

            {/* Subject filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database">Database Management (DBMS)</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Java">Java Programming</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const isBookmarked = bookmarkedNotes.includes(note.id);
            return (
              <div
                key={note.id}
                onClick={() => handleOpenReader(note)}
                className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-glow"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="badge-cyan text-[11px] px-2 py-0.5 rounded-lg font-600">
                      {note.subject}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(note.id, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-warning bg-warning/10'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Save bookmark'}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="text-base font-700 text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Uploaded by <span className="text-foreground font-500">{note.teacher}</span>{' '}
                    &nbsp;·&nbsp; {note.pages} pages
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40 font-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom stats & action */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-warning font-600">
                      ★ {note.rating}
                    </span>
                    <span>👁 {note.views || 412}</span>
                  </div>
                  <span className="text-primary font-600 group-hover:underline flex items-center gap-1">
                    Read Document →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Document Reader Modal */}
      {selectedNote && (
        <Modal
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl">📄</span>
              <div>
                <h3 className="text-base font-700 text-foreground">{selectedNote.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedNote.subject} · By {selectedNote.teacher}
                </p>
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={readerPage <= 1}
                  onClick={() => setReaderPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev Page
                </Button>
                <span className="text-xs text-muted-foreground font-mono-data">
                  Page {readerPage} of {selectedNote.pages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={readerPage >= selectedNote.pages}
                  onClick={() => setReaderPage((p) => Math.min(selectedNote.pages, p + 1))}
                >
                  Next Page →
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleDownload(selectedNote)}>
                  Download PDF
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedNote(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          {/* Mock PDF Viewer Canvas */}
          <div className="rounded-xl border border-border/80 bg-black/40 p-6 min-h-[380px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs text-muted-foreground">
                <span className="font-600 text-foreground">
                  SECTION {readerPage}: Core Concepts & Theorems
                </span>
                <span>CampusOS Academic Publishing</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-mono-data bg-card/60 p-4 rounded-xl border border-border/40">
                <p className="font-700 text-primary uppercase text-[11px] tracking-wider">
                  Chapter {readerPage} Summary — {selectedNote.title}
                </p>
                <p>
                  1. Comprehensive overview of theoretical foundations and practical applications in
                  modern computing architectures.
                </p>
                <p>
                  2. Algorithm performance benchmarks, time complexities, memory overhead bounds,
                  and distributed fault tolerances.
                </p>
                <p>
                  3. Key Examination Problems and Step-by-step Mathematical Derivations for Mid-term
                  Evaluation.
                </p>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
              Verified by Faculty of Computer Applications · CampusOS Digital Repository
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
