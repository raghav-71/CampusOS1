'use client';

import React, { useState } from 'react';
import { ProgrammingAssignmentDraft, DifficultyLevel } from '@/types/facultyCodelab';
import { facultyCodeRepo } from '@/repositories/facultyCodeRepository';
import {
  BookOpen,
  X,
  Sparkles,
  Save,
  Check,
  Clock,
  Code2,
  FileCode,
  Layers,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  languageId?: string;
}

export default function AssignmentBuilderModal({
  isOpen,
  onClose,
  initialCode = '',
  languageId = 'python',
}: AssignmentBuilderModalProps) {
  const [title, setTitle] = useState('Data Structures Lab Assignment 1');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [semester, setSemester] = useState('Semester 3');
  const [topic, setTopic] = useState('Arrays, Two-Pointer, and Sorting');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [numQuestions, setNumQuestions] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(90);
  const [allowedLanguages, setAllowedLanguages] = useState(['Python', 'C++', 'Java']);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    toast.loading('Faculty AI is drafting the assignment...', { id: 'asgn-gen' });

    try {
      const response = await fetch('/api/code/faculty-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_ASSIGNMENT',
          mode: 'teaching',
          context: {
            language: languageId,
            fileName: 'main.py',
            sourceCode: initialCode,
          },
          params: {
            subject,
            semester,
            topic,
            difficulty,
            numQuestions,
            marks: numQuestions * 10,
          },
        }),
      });

      const data = await response.json();
      toast.dismiss('asgn-gen');

      if (data.success && data.response) {
        setGeneratedDraft(data.response);
        toast.success('Assignment draft generated with AI!');
      } else {
        toast.error(data.error || 'Failed to generate assignment.');
      }
    } catch (err: any) {
      toast.dismiss('asgn-gen');
      toast.error('AI error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    const newAssignment: ProgrammingAssignmentDraft = {
      id: `asgn-${Date.now()}`,
      title,
      subject,
      semester,
      topic,
      difficulty,
      numQuestions,
      timeLimitMinutes,
      allowedLanguages,
      questions: [],
      totalMarks: numQuestions * 10,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await facultyCodeRepo.saveAssignment(newAssignment);
    toast.success(
      status === 'PUBLISHED'
        ? 'Assignment published to student dashboard!'
        : 'Assignment saved as Draft in Question Bank.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#0a142f] border border-primary/40 rounded-3xl shadow-glow flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0b1736] to-[#060b18] border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-800 text-foreground tracking-tight">
                Programming Assignment Builder
              </h3>
              <p className="text-xs text-muted-foreground">
                Author and configure practical coding assignments for your classes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Subject & Course
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Topic / Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy (Beginner)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Advanced)</option>
                <option value="Expert">Expert (Competitive)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Number of Questions & Time Limit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 1)}
                  className="w-1/2 bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
                />
                <div className="flex items-center gap-1 w-1/2 bg-[#060b18] text-foreground text-xs px-2.5 rounded-xl border border-border">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10) || 60)}
                    className="w-full bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">min</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Generator Action Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-900/20 to-accent/20 border border-accent/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <div>
                <div className="font-bold text-foreground text-xs">AI Assignment Synthesizer</div>
                <div className="text-[11px] text-muted-foreground">
                  Generates problem statements, test cases, and rubrics automatically.
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-50 btn-press"
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate Assignment Questions</span>
            </button>
          </div>

          {/* Draft Preview / Editor */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
              Assignment Content / Questions Preview
            </label>
            <textarea
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              placeholder="Click 'Generate Assignment Questions' or write your custom assignment specification here..."
              rows={8}
              className="w-full bg-[#060b18] text-foreground text-xs p-3 rounded-2xl border border-border focus:outline-none focus:border-primary font-mono resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#070e22] border-t border-border/80 flex items-center justify-between select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveDraft('DRAFT')}
              className="px-4 py-2 rounded-xl bg-secondary border border-border hover:border-primary/40 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-primary" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSaveDraft('PUBLISHED')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all cursor-pointer btn-press"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
