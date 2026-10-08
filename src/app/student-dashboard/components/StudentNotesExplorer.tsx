'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const resourceId = searchParams.get('resourceId');
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

  useEffect(() => {
    if (resourceId && notesList.length > 0) {
      const match = notesList.find((n) => n.id === resourceId);
      if (match) {
        setSelectedNote(match);
      }
    }
  }, [resourceId, notesList]);

  useEffect(() => {
    const handleOpenDoc = (e: any) => {
      const docId = e.detail?.id;
      if (docId && notesList.length > 0) {
        const match = notesList.find((n) => n.id === docId);
        if (match) setSelectedNote(match);
      }
    };
    window.addEventListener('campusos:open-document', handleOpenDoc);
    return () => window.removeEventListener('campusos:open-document', handleOpenDoc);
  }, [notesList]);

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
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 w-56 sm:w-64 border border-border focus-within:border-primary">
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
              className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-600 outline-none cursor-pointer focus:border-primary"
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

        {/* Notes Grid in Apple Document Library Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isBookmarked = bookmarkedNotes.includes(note.id);
            return (
              <div
                key={note.id}
                onClick={() => handleOpenReader(note)}
                className="bg-white rounded-[18px] p-5 border border-black/[0.06] hover:border-black/[0.12] transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-card hover:shadow-card-hover"
              >
                <div>
                  {/* Top file type icon & subject tag */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-primary-dark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                          {note.subject}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskAIAboutNote(note, e);
                        }}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-[#15803D] bg-[#DCFCE7]/60 hover:bg-[#DCFCE7] transition-colors"
                        title="AI Study Assistant"
                      >
                        ✨ Study
                      </button>
                      <button
                        onClick={(e) => toggleBookmark(note.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500'
                            : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
                      >
                        <svg
                          width="14"
                          height="14"
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

                  <h3 className="text-sm font-bold text-[#1D1D1F] group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-[#6E6E73] mb-3">
                    {note.teacher} &nbsp;·&nbsp; {note.pages} pages &nbsp;·&nbsp; {note.fileSize || note.size || '3.5 MB'}
                  </p>
                </div>

                {/* Minimal actions footer */}
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] text-xs">
                  <span className="text-[#8E8E93] text-[11px]">
                    Verified Syllabus Document
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(note);
                      }}
                      className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-colors font-medium"
                    >
                      Download
                    </button>
                    <span className="text-[#8E8E93]">·</span>
                    <span className="text-primary font-semibold group-hover:underline">
                      Read →
                    </span>
                  </div>
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
