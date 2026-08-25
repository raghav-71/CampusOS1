'use client';

import React, { useState } from 'react';
import { CodingQuestionDraft, DifficultyLevel } from '@/types/facultyCodelab';
import { TestCase } from '@/types/codelab';
import { facultyCodeRepo } from '@/repositories/facultyCodeRepository';
import {
  FileCode,
  X,
  Sparkles,
  Save,
  Check,
  Code2,
  Plus,
  Trash2,
  ListCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuestionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  languageId?: string;
  initialTestCases?: TestCase[];
}

export default function QuestionBuilderModal({
  isOpen,
  onClose,
  initialCode = '',
  languageId = 'python',
  initialTestCases = [],
}: QuestionBuilderModalProps) {
  const [title, setTitle] = useState('Array Maximum Subarray Sum');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [semester, setSemester] = useState('Semester 3');
  const [topic, setTopic] = useState('Dynamic Programming / Kadane Algorithm');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [marks, setMarks] = useState(10);
  const [problemStatement, setProblemStatement] = useState(
    'Given an integer array nums, find the subarray with the largest sum, and return its sum.'
  );
  const [inputFormat, setInputFormat] = useState('Line 1: Integer N\nLine 2: N space-separated integers');
  const [outputFormat, setOutputFormat] = useState('Single integer: Maximum subarray sum');
  const [constraints, setConstraints] = useState('1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4');
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>(
    initialTestCases.length > 0
      ? initialTestCases
      : [
          { id: 'stc-1', input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', status: 'PASSED' },
          { id: 'stc-2', input: '1\n1', expectedOutput: '1', status: 'PASSED' },
        ]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    toast.loading('AI is formulating test cases and question format...', { id: 'q-gen' });

    try {
      const response = await fetch('/api/code/faculty-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_QUESTION',
          mode: 'exam',
          context: {
            language: languageId,
            fileName: 'solution.py',
            sourceCode: initialCode,
          },
          params: {
            subject,
            semester,
            topic,
            difficulty,
            marks,
          },
        }),
      });

      const data = await response.json();
      toast.dismiss('q-gen');

      if (data.success && data.response) {
        setProblemStatement(data.response);
        toast.success('Question drafted from active workspace code!');
      } else {
        toast.error(data.error || 'Failed to generate question.');
      }
    } catch (err: any) {
      toast.dismiss('q-gen');
      toast.error('AI error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestion = async () => {
    const newQuestion: CodingQuestionDraft = {
      id: `q-${Date.now()}`,
      title,
      subject,
      semester,
      topic,
      difficulty,
      marks,
      problemStatement,
      inputFormat,
      outputFormat,
      constraints: constraints.split('\n').filter((c) => c.trim().length > 0),
      allowedLanguages: ['python', 'cpp', 'java', 'c', 'javascript'],
      sampleTestCases,
      hiddenTestCases: [
        { id: 'htc-1', input: '5\n-1 -2 -3 -4 -5', expectedOutput: '-1' },
        { id: 'htc-2', input: '3\n100 200 300', expectedOutput: '600' },
      ],
      referenceSolution: {
        [languageId]: initialCode,
      },
      status: 'SAVED',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await facultyCodeRepo.saveQuestion(newQuestion);
    toast.success(`Question "${title}" saved to Faculty Question Bank!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#0a142f] border border-primary/40 rounded-3xl shadow-glow flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0b1736] to-[#060b18] border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-800 text-foreground tracking-tight">
                Author & Save Question
              </h3>
              <p className="text-xs text-muted-foreground">
                Save active workspace problem & reference solution to Question Bank
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
                Question Title
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
                Subject & Semester
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-2/3 bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-1/3 bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Difficulty Level & Marks
              </label>
              <div className="flex gap-2">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-2/3 bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
                <div className="w-1/3 flex items-center bg-[#060b18] border border-border rounded-xl px-2.5">
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-transparent text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">pts</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Topic / Unit
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* AI Helper Bar */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-900/20 to-accent/20 border border-accent/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-bold text-xs">Formulate from Editor Code</span>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-glow cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? 'Synthesizing...' : 'Generate Format with AI'}
            </button>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
              Problem Statement
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={4}
              className="w-full bg-[#060b18] text-foreground text-xs p-3 rounded-2xl border border-border focus:outline-none focus:border-primary font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Formats & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Input Format & Constraints
              </label>
              <textarea
                value={inputFormat + '\n\nConstraints:\n' + constraints}
                onChange={(e) => setInputFormat(e.target.value)}
                rows={3}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary font-mono resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Output Format
              </label>
              <textarea
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                rows={3}
                className="w-full bg-[#060b18] text-foreground text-xs p-2.5 rounded-xl border border-border focus:outline-none focus:border-primary font-mono resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070e22] border-t border-border/80 flex items-center justify-between select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuestion}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all cursor-pointer btn-press"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Question to Bank</span>
          </button>
        </div>
      </div>
    </div>
  );
}
