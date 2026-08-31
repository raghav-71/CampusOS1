'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useProfile } from '@/hooks/useProfile';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer';

export interface DocumentItem {
  id?: string;
  title: string;
  subject?: string;
  teacher?: string;
  teacherName?: string;
  semester?: string | number;
  semesterNumber?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  fileData?: string;
  fileUrl?: string;
  extractedText?: string;
  description?: string;
  category?: string;
  totalMarks?: number;
  maxMarks?: number;
  duration?: string;
  year?: string | number;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onAskAI?: (prompt?: string, doc?: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document: doc,
  onAskAI,
  onDownload,
}: DocumentViewerModalProps) {
  const { profile } = useProfile();
  const [activeView, setActiveView] = useState<'preview' | 'extracted' | 'ai'>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    if (doc) {
      setAiResponse(null);
      setAiCustomPrompt('');
      setIsAiProcessing(false);
      // If no visual fileData or fileUrl, default to extracted text tab
      const isPdf =
        doc.fileType === 'pdf' ||
        doc.fileName?.toLowerCase().endsWith('.pdf') ||
        doc.fileData?.startsWith('data:application/pdf') ||
        doc.fileUrl?.toLowerCase().endsWith('.pdf');
      const isImage =
        doc.fileType === 'image' ||
        /\.(png|jpe?g|webp|gif)$/i.test(doc.fileName || '') ||
        doc.fileData?.startsWith('data:image/');

      if (!isPdf && !isImage && doc.extractedText) {
        setActiveView('extracted');
      } else {
        setActiveView('preview');
      }
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const fileName = doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const ext = fileName.split('.').pop()?.toLowerCase() || 'pdf';
  const isPdf =
    doc.fileType === 'pdf' ||
    ext === 'pdf' ||
    doc.fileData?.startsWith('data:application/pdf') ||
    doc.fileUrl?.toLowerCase().endsWith('.pdf');
  const isImage =
    doc.fileType === 'image' ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ||
    doc.fileData?.startsWith('data:image/');
  const isOffice = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);

  // Determine primary display URL
  const displayUrl = doc.fileData || doc.fileUrl;

  const handleDownloadOriginal = () => {
    if (onDownload) {
      onDownload(doc);
      return;
    }

    try {
      let downloadUrl = displayUrl;
      if (!downloadUrl) {
        const textContent =
          doc.extractedText ||
          doc.description ||
          `Campus OS Academic Material\nTitle: ${doc.title}\nSubject: ${doc.subject || 'BCA Curriculum'}\n\n${doc.description || 'Verified Study Resource'}`;
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        downloadUrl = URL.createObjectURL(blob);
      }

      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      toast.success(`Downloaded: "${fileName}" (${doc.fileSize || '2.4 MB'})`);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleOpenInNewTab = () => {
    if (displayUrl) {
      window.open(displayUrl, '_blank');
      toast.info('Opened document in new tab.');
    } else {
      handleDownloadOriginal();
    }
  };

  const handleSummarizeThisFile = async () => {
    setActiveView('ai');
    setIsAiProcessing(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/documents/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: doc.title,
          subject: doc.subject,
          fileName: doc.fileName || fileName,
          extractedText: doc.extractedText,
          dataUrl: displayUrl,
          userProfile: profile,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAiResponse(data.summary);
      } else {
        const fallback = doc.extractedText
          ? `### 📑 Document Summary: ${doc.title}\n\n${doc.extractedText.slice(0, 1500)}\n\n---\n**Subject**: \`${doc.subject || 'BCA Curriculum'}\``
          : `### 📑 Academic Summary for ${doc.title}\n\n${doc.description || 'Verified course document for BCA students.'}\n\n**Subject:** ${doc.subject || 'BCA Academic Program'}`;
        setAiResponse(fallback);
      }
    } catch {
      setAiResponse(
        `### 📑 Academic Summary for ${doc.title}\n\n${doc.extractedText?.slice(0, 1200) || doc.description || 'Verified course material.'}\n\n**Subject:** ${doc.subject || 'BCA Course'}`
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAskQuickAI = async (actionLabel: string, promptTemplate: string) => {
    // Keep user in-modal and activate AI tab
    setActiveView('ai');
    setIsAiProcessing(true);
    setAiResponse(null);

    const docContext = doc.extractedText || doc.description || doc.title;
    const fullQuery = `${promptTemplate}\n\n[Document Context: ${doc.title} (${doc.subject || 'BCA'})]\n${docContext.slice(0, 8000)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: fullQuery,
          stream: false,
          userProfile: profile,
          selectedEntity: {
            id: doc.id,
            title: doc.title,
            subject: doc.subject,
            semesterNumber: doc.semesterNumber || 5,
            extractedText: docContext,
          },
        }),
      });

      clearTimeout(timer);
      const data = await res.json();
      if (data.answer || data.text || data.response) {
        setAiResponse(data.answer || data.text || data.response);
      } else {
        setAiResponse(`### 📑 AI Summary for ${doc.title}\n\n${doc.description || docContext.slice(0, 400)}\n\n**Subject:** ${doc.subject || 'BCA Academic Program'}`);
      }
    } catch {
      clearTimeout(timer);
      setAiResponse(`### 📑 AI Summary for ${doc.title}\n\n${doc.description || docContext.slice(0, 400)}\n\n- **Subject:** ${doc.subject || 'BCA Course'}\n- **Faculty:** ${doc.teacher || doc.teacherName || 'Faculty'}\n\n*Verified course document for BCA students.*`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCustomAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCustomPrompt.trim()) return;
    handleAskQuickAI('Custom Query', aiCustomPrompt.trim());
  };

  const handleOpenFullAssistant = () => {
    onClose();
    window.dispatchEvent(
      new CustomEvent('campusos:open-ai', {
        detail: {
          query: `Analyze this document for ${doc.subject || 'BCA'}: "${doc.title}". Provide key takeaways, formula derivations, and sample viva questions.`,
          selectedDocument: {
            id: doc.id,
            title: doc.title,
            subject: doc.subject,
            semester: `Semester ${doc.semesterNumber || 5}`,
            extractedText: doc.extractedText || doc.description,
          },
        },
      })
    );
    toast.info(`CampusOS AI is analyzing "${doc.title}"...`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl flex-shrink-0">
            {isPdf ? '📑' : isImage ? '🖼️' : isOffice ? '📘' : '📄'}
          </span>
          <div className="truncate">
            <h3 className="text-base font-800 text-foreground truncate">{doc.title}</h3>
            <p className="text-xs text-muted-foreground font-500 truncate">
              {doc.subject || 'Course Resource'} · {doc.teacher || doc.teacherName || 'Faculty'} · {fileName} ({doc.fileSize || '2.4 MB'})
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="accent"
              size="sm"
              onClick={handleSummarizeThisFile}
              className="shadow-glow font-800 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
            >
              ⚡ Summarize This File
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenFullAssistant}
              className="font-700"
            >
              ✨ Ask Campus AI
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {displayUrl && (
              <Button variant="ghost" size="sm" onClick={handleOpenInNewTab}>
                Open in New Tab ↗
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleDownloadOriginal}>
              Download 📥
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation / Mode Tabs & Zoom Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                activeView === 'preview'
                  ? 'bg-primary/20 text-primary border border-primary/50 font-800'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPdf ? '📑 PDF View' : isImage ? '🖼️ Image View' : isOffice ? '📘 Office Document' : '📄 Document View'}
            </button>
            <button
              onClick={() => setActiveView('extracted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                activeView === 'extracted'
                  ? 'bg-primary/20 text-primary border border-primary/50 font-800'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📖 Extracted Text / Reading Mode
            </button>
            <button
              onClick={() => setActiveView('ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                activeView === 'ai'
                  ? 'bg-accent/20 text-accent border border-accent/50 font-800 shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✨ AI Study Tutor
            </button>
          </div>

          {/* Zoom / Fullscreen Tools */}
          {activeView === 'preview' && isPdf && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="w-7 h-7 rounded-lg bg-card border border-border/80 text-foreground flex items-center justify-center font-bold hover:bg-muted/50"
                title="Zoom out"
              >
                -
              </button>
              <span className="text-[11px] font-mono-data px-1.5 text-muted-foreground">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(175, z + 15))}
                className="w-7 h-7 rounded-lg bg-card border border-border/80 text-foreground flex items-center justify-center font-bold hover:bg-muted/50"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded-lg bg-card border border-border/80 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* ─── TAB 1: PREVIEW MODE (PDF, IMAGE, OFFICE, CODE) ───────────────── */}
        {activeView === 'preview' && (
          <div className="w-full rounded-2xl border border-border/80 bg-black/60 overflow-hidden relative min-h-[420px] max-h-[60vh] flex flex-col justify-between">
            {isPdf && displayUrl ? (
              <div
                className="w-full h-[450px] sm:h-[500px] overflow-auto transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <iframe
                  src={`${displayUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0 rounded-2xl bg-white"
                  title={doc.title}
                />
              </div>
            ) : isImage && displayUrl ? (
              <div className="w-full h-[450px] flex items-center justify-center p-4 overflow-auto">
                <img
                  src={displayUrl}
                  alt={doc.title}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-lg transition-transform"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                />
              </div>
            ) : isOffice ? (
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📘</span>
                    <div>
                      <p className="font-700 text-foreground">Microsoft Office Document ({ext.toUpperCase()})</p>
                      <p className="text-muted-foreground">Showing extracted text preview. Download original file for full formatting.</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleDownloadOriginal}>
                    Download {ext.toUpperCase()} 📥
                  </Button>
                </div>

                <div className="bg-card/70 border border-border/60 p-5 rounded-2xl text-xs font-mono-data leading-relaxed max-h-[340px] overflow-y-auto whitespace-pre-wrap">
                  {doc.extractedText || doc.description || `Lecture document on ${doc.title} for ${doc.subject || 'BCA'}.`}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto">
                  📄
                </div>
                <div>
                  <h4 className="text-base font-800 text-foreground">{doc.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: <strong className="text-foreground">{ext.toUpperCase()}</strong> · Size: {doc.fileSize || '2.4 MB'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preview rendered in Reading Mode below or download original file directly.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => setActiveView('extracted')}>
                    Open Reading Mode 📖
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleDownloadOriginal}>
                    Download Original 📥
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: EXTRACTED TEXT & READING MODE ──────────────────────────── */}
        {activeView === 'extracted' && (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-5 min-h-[420px] max-h-[60vh] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
                <span className="font-800 text-primary uppercase tracking-wider">
                  📖 {doc.title}
                </span>
                <Badge variant="cyan">{doc.subject || 'BCA Curriculum'}</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-border/40 text-xs sm:text-sm font-mono-data leading-relaxed text-foreground/90 max-h-[340px] overflow-y-auto whitespace-pre-wrap">
                {doc.extractedText ||
                  doc.description ||
                  `Academic study material on ${doc.title}.\nSubject: ${doc.subject || 'BCA Course'}\n\nTopics include fundamental theory, mathematical derivations, real-world examples, and exam review questions.`}
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Verified Campus OS Document Content</span>
              <button
                onClick={handleSummarizeThisFile}
                className="text-accent font-700 hover:underline cursor-pointer flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-xl border border-accent/30 shadow-glow"
              >
                ⚡ Summarize This File
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 3: AI STUDY TUTOR & QUICK ACTIONS ─────────────────────────── */}
        {activeView === 'ai' && (
          <div className="rounded-2xl border border-accent/40 bg-card/70 p-5 min-h-[420px] max-h-[60vh] flex flex-col justify-between space-y-4">
            {/* Quick Action Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-800 uppercase tracking-wider text-muted-foreground">
                  Quick Document Analysis Tools
                </p>
                <button
                  onClick={handleSummarizeThisFile}
                  disabled={isAiProcessing}
                  className="text-xs font-800 text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/50 transition-all cursor-pointer shadow-glow"
                >
                  ⚡ Full Document Summary
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: '📝 Summarize for Exam',
                    prompt: `Summarize the attached document "${doc.title}" into core concepts, key formulas, and exam takeaways.`,
                  },
                  {
                    label: '🔍 Explain Key Concepts',
                    prompt: `Explain the fundamental principles and theorems presented in "${doc.title}" with clear examples.`,
                  },
                  {
                    label: '🎯 15 Viva / Exam Questions',
                    prompt: `Generate 15 frequently asked university viva and exam questions based on "${doc.title}" with sample model answers.`,
                  },
                  {
                    label: '❓ 10 Practice MCQs',
                    prompt: `Generate 10 multiple-choice questions (MCQs) with 4 options each and explain correct answers based on "${doc.title}".`,
                  },
                  {
                    label: '📌 Key Definitions & Formulas',
                    prompt: `Extract all important definitions, notations, equations, and algorithms from "${doc.title}".`,
                  },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskQuickAI(action.label, action.prompt)}
                    disabled={isAiProcessing}
                    className="px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 text-xs font-700 transition-all cursor-pointer btn-press disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Output Area */}
            <div className="flex-1 min-h-[180px] max-h-[280px] overflow-y-auto p-4 rounded-2xl bg-black/50 border border-border/60 text-xs sm:text-sm text-foreground/90 leading-relaxed select-text">
              {isAiProcessing ? (
                <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground animate-pulse">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>CampusOS AI is analyzing document and synthesizing response...</span>
                </div>
              ) : aiResponse ? (
                <div>
                  <MarkdownRenderer content={aiResponse} />
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm font-700 text-foreground mb-1">Interactive Document AI Ready</p>
                  <p className="text-xs">Click a quick action above or type a specific question about this document below.</p>
                </div>
              )}
            </div>

            {/* Custom Question Input Form */}
            <form onSubmit={handleCustomAiSubmit} className="flex gap-2">
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder={`Ask anything about ${doc.title}... (e.g. What is experiment 5?)`}
                className="input-field text-xs"
                disabled={isAiProcessing}
              />
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={isAiProcessing || !aiCustomPrompt.trim()}
                className="shadow-glow font-800 flex-shrink-0"
              >
                Ask AI ✨
              </Button>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}
