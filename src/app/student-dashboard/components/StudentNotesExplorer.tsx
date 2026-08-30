'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { campusRepository } from '@/repositories/campusRepository';
import { NoteDocument } from '@/types/campus';
import { useProfile } from '@/hooks/useProfile';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

export default function StudentNotesExplorer() {
  const { profile } = useProfile();
  const [notesList, setNotesList] = useState<NoteDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedNote, setSelectedNote] = useState<NoteDocument | null>(null);
  const [readerPage, setReaderPage] = useState(1);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const studentSem = profile?.semesterNumber || 5;
      const notes = await campusRepository.getNotes(selectedSubject, searchQuery, studentSem);
      setNotesList(notes);
    } catch {
      toast.error('Failed to load notes library');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, searchQuery, profile?.semesterNumber]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = notesList;

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

  const handleDownload = async (note: NoteDocument) => {
    try {
      const fileName = note.fileName || `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${note.fileType || 'pdf'}`;
      let downloadUrl = note.fileData || note.fileUrl;

      if (!downloadUrl) {
        const textContent =
          note.extractedText ||
          `CampusOS Verified Study Material\nTitle: ${note.title}\nSubject: ${note.subject}\nInstructor: ${note.teacher}\nSemester: ${note.semester}\n\n${note.description || 'Full chapter syllabus notes and revision guide.'}`;
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        downloadUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Downloaded: "${fileName}" (${note.fileSize || note.size || '3.4 MB'})`);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleAskAIAboutNote = (note: NoteDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNote(null);
    window.dispatchEvent(
      new CustomEvent('campusos:open-ai', {
        detail: {
          query: `Summarize the key points, core concepts, and potential exam questions from the lecture note: "${note.title}" (${note.subject}).`,
          selectedDocument: {
            id: note.id,
            title: note.title,
            subject: note.subject,
            semester: note.semester,
            extractedText: note.extractedText || note.description,
          },
        },
      })
    );
    toast.info(`Campus AI is analyzing "${note.title}"...`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📚</span> Lecture Notes & Academic Documents Library
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified syllabus chapters, laboratory manuals, and faculty uploads for Semester {profile?.semesterNumber || 5}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 w-56 sm:w-64 border border-border/70">
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
              className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-600 outline-none cursor-pointer"
            >
              <option value="all">All Enrolled Subjects</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database Management Systems">Database Management (DBMS)</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Java">Java Programming</option>
              <option value="Design & Analysis of Algorithms">Algorithms (DAA)</option>
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
                className="glass-card rounded-3xl p-5 border border-border/80 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-glow"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="badge-cyan text-[11px] px-2.5 py-0.5 rounded-lg font-700">
                      {note.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAskAIAboutNote(note, e)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="Ask Campus AI about this note"
                      >
                        <span className="text-xs">✨ AI</span>
                      </button>
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
                  </div>

                  <h3 className="text-base font-800 text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 font-500">
                    Uploaded by <span className="text-foreground font-700">{note.teacher}</span>{' '}
                    &nbsp;·&nbsp; {note.pages} pages &nbsp;·&nbsp; {note.fileSize || note.size || '3.5 MB'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40 font-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom stats & actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-warning font-700">
                      ★ {note.rating || 5.0}
                    </span>
                    <span>👁 {note.views || 412}</span>
                  </div>
                  <span className="text-primary font-700 group-hover:underline flex items-center gap-1">
                    Read & Study →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Universal Document Viewer & AI Study Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedNote)}
        onClose={() => setSelectedNote(null)}
        document={selectedNote}
        onAskAI={(prompt, doc) => handleAskAIAboutNote(doc as NoteDocument || selectedNote!)}
        onDownload={(doc) => handleDownload(doc as NoteDocument || selectedNote!)}
      />
    </>
  );
}
