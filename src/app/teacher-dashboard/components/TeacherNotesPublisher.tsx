'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockNotes } from '@/repositories/mockData';
import { NoteDocument } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function TeacherNotesPublisher() {
  const [notes, setNotes] = useState<NoteDocument[]>(
    mockNotes.filter((n) => n.teacher.includes('Priya Nair'))
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [semester, setSemester] = useState('Sem 5');
  const [tagsInput, setTagsInput] = useState('');
  const [pagesInput, setPagesInput] = useState('18');
  const [fileName, setFileName] = useState('lecture_notes_ch8.pdf');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const newNote: NoteDocument = {
      id: `note-${Date.now()}`,
      title,
      subject,
      semester,
      teacher: 'Dr. Priya Nair',
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      uploadedAt: 'Just now',
      downloads: 0,
      pages: parseInt(pagesInput) || 18,
      size: '2.8 MB',
      fileSize: '2.8 MB',
      rating: 5.0,
      views: 1,
      isNew: true,
    };

    setNotes((prev) => [newNote, ...prev]);
    toast.success(`Published document: "${title}" for ${subject} ${semester}!`);
    setUploadModalOpen(false);
    setTitle('');
    setTagsInput('');
  };

  const handleDelete = (id: string, noteTitle: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success(`Removed note: "${noteTitle}"`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">Course Notes & Material Publishing</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload verified lecture slides, laboratory manuals, and revision cheat sheets
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            }
          >
            Upload New Material
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((n) => (
            <div
              key={n.id}
              className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="cyan">{n.subject}</Badge>
                  <span className="text-xs text-muted-foreground font-mono-data">{n.size}</span>
                </div>

                <h3 className="text-base font-700 text-foreground mb-1.5 line-clamp-1">
                  {n.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {n.semester} · {n.pages} pages · Uploaded {n.uploadedAt}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40 font-500"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>📥 {n.downloads} downloads</span>
                  <span>★ {n.rating || 4.9}</span>
                </div>
                <button
                  onClick={() => handleDelete(n.id, n.title)}
                  className="text-xs text-danger hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload Course Document"
          description="Add lecture notes, assignment guides, or formula reference sheets"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUploadSubmit}>
                Upload & Publish
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center transition-colors bg-muted/10 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <p className="text-xs font-600 text-foreground mb-0.5">Attached: {fileName}</p>
              <p className="text-[11px] text-muted-foreground">
                Supports PDF, DOCX, PPTX (up to 25MB)
              </p>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 8 — File Systems & Disk Scheduling"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                >
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="OS Lab Practical">OS Lab Practical</option>
                  <option value="System Architecture">System Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input-field"
                >
                  <option value="Sem 5">BCA Semester 5</option>
                  <option value="Sem 3">MCA Semester 3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="OS, Disk Scheduling, SSTF, SCAN"
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
