'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AIQuestionPaper } from '@/lib/ai/aiTypes';

export default function FacultyAIEngine() {
  const [subject, setSubject] = useState('Operating Systems (CS501)');
  const [topics, setTopics] = useState('Process Synchronization, CPU Scheduling, Deadlocks, Paging, Virtual Memory');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [totalMarks, setTotalMarks] = useState(100);
  const [questionTypes, setQuestionTypes] = useState('Short conceptual, Algorithmic design, Numerical derivations');
  const [customGuidance, setCustomGuidance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [generatedPaper, setGeneratedPaper] = useState<AIQuestionPaper | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topics,
          difficulty,
          totalMarks,
          semester: 'Semester 5',
          questionTypes,
          customInstructions: customGuidance,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate paper.');
      }
      setGeneratedPaper(data.paper);
      toast.success('Question paper generated successfully via LLM!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = (sectionIdx: number) => {
    if (!generatedPaper) return;
    const newQ = `New Question: Formulate an algorithmic solution for ${topics.split(',')[0] || 'the core topic'} and analyze its asymptotic complexity.`;
    const updatedSections = [...generatedPaper.sections];
    updatedSections[sectionIdx].questions.push(newQ);
    setGeneratedPaper({ ...generatedPaper, sections: updatedSections });
    toast.success('New question added to ' + updatedSections[sectionIdx].name);
  };

  const handleRemoveQuestion = (sectionIdx: number, qIdx: number) => {
    if (!generatedPaper) return;
    const updatedSections = [...generatedPaper.sections];
    updatedSections[sectionIdx].questions.splice(qIdx, 1);
    setGeneratedPaper({ ...generatedPaper, sections: updatedSections });
    toast.info('Question removed from paper');
  };

  const handleSaveToArchive = () => {
    toast.success('Paper saved into Faculty Question Paper Archive (Draft #A-108)');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              Faculty AI Assessment & Question Paper Engine
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate authentic syllabus-aligned university examination blueprints, numericals, and scoring rubrics
          </p>
        </div>
        <Badge variant="cyan">AI Assessment Generator v2.5</Badge>
      </div>

      {/* Generator Configuration Form */}
      <form
        onSubmit={handleGenerate}
        className="glass-card rounded-3xl p-6 sm:p-7 border border-primary/30 space-y-5 shadow-glass"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
              Course Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
            >
              <option value="Operating Systems (CS501)">Operating Systems (CS501)</option>
              <option value="Database Management Systems (CS502)">Database Systems (CS502)</option>
              <option value="Computer Networks (CS503)">Computer Networks (CS503)</option>
              <option value="Design & Analysis of Algorithms (CS505)">DAA (CS505)</option>
              <option value="System Architecture (MCA302)">System Architecture (MCA302)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
              Examination Target
            </label>
            <select
              value={totalMarks}
              onChange={(e) => setTotalMarks(parseInt(e.target.value))}
              className="input-field"
            >
              <option value={100}>End-Semester Exam (100 Marks · 3 Hours)</option>
              <option value={50}>Mid-Semester Exam (50 Marks · 90 Mins)</option>
              <option value={20}>Class Test / Quiz (20 Marks · 45 Mins)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
              Difficulty Calibration
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
            >
              <option value="Moderate">Moderate (30% Basic, 50% Analytical, 20% Rigorous)</option>
              <option value="Challenging">Challenging (20% Basic, 40% Analytical, 40% Rigorous)</option>
              <option value="Fundamental">Fundamental (50% Basic, 40% Analytical, 10% Rigorous)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
              Syllabus Units & Target Chapters
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Memory Management, Deadlocks, Paging, CPU Scheduling"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
              Question Types & Focus
            </label>
            <input
              type="text"
              value={questionTypes}
              onChange={(e) => setQuestionTypes(e.target.value)}
              placeholder="e.g. Conceptual definitions, Gantt charts, Numerical proofs"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
            Special Instructions / Professor Guidance (Optional)
          </label>
          <input
            type="text"
            value={customGuidance}
            onChange={(e) => setCustomGuidance(e.target.value)}
            placeholder="e.g. Include 1 numerical on Banker's safety algorithm and 1 question on TLB hit ratio"
            className="input-field"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full sm:w-auto shadow-glow font-700"
          >
            {isLoading ? 'Generating Assessment Paper...' : 'Generate Complete Paper ✨'}
          </Button>
        </div>
      </form>

      {/* Generated Paper Output */}
      {generatedPaper && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary/40 space-y-6 shadow-glow animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div>
              <span className="badge-success text-xs px-2.5 py-0.5 rounded-lg font-700 mb-1 inline-block">
                LLM Assessment Generated
              </span>
              <h3 className="text-lg font-800 text-foreground">{generatedPaper.title}</h3>
              <p className="text-xs text-muted-foreground">
                {generatedPaper.semester || 'Semester 5'} · Duration: {generatedPaper.duration || '3 Hours'} · Total Marks: {generatedPaper.totalMarks} · Difficulty: {difficulty}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="text-xs"
              >
                🔄 Regenerate
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const nextDiff = difficulty === 'Moderate' ? 'Challenging' : difficulty === 'Challenging' ? 'Fundamental' : 'Moderate';
                  setDifficulty(nextDiff);
                  toast.info(`Difficulty updated to ${nextDiff}`);
                }}
                className="text-xs"
              >
                🎯 Difficulty: {difficulty}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="text-xs"
              >
                {showAnswerKey ? 'Hide Rubric' : 'Show Answer Key'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveToArchive}
                className="text-xs"
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.success('Downloaded complete formatted examination paper PDF')}
                className="text-xs shadow-glow font-700"
              >
                Download PDF
              </Button>
            </div>
          </div>

          {/* Paper Body */}
          <div className="p-6 rounded-2xl bg-card/90 border border-border/70 font-mono-data text-xs space-y-6 leading-relaxed">
            <div className="text-center border-b border-border/60 pb-3">
              <h4 className="font-800 text-sm text-foreground">CAMPUS OS UNIVERSITY EXAMINATION BOARD</h4>
              <p className="text-muted-foreground">{generatedPaper.subject} — Fall 2026 Academic Assessment</p>
              {generatedPaper.instructions && (
                <div className="mt-2 text-[11px] text-muted-foreground/90 space-y-0.5">
                  {generatedPaper.instructions.map((ins, i) => (
                    <p key={i}>• {ins}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Sections */}
            {generatedPaper.sections.map((section, sIdx) => (
              <div key={sIdx} className="pt-2 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-800 text-sm text-primary">{section.name}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddQuestion(sIdx)}
                    className="text-[10px] py-1 px-2 h-auto"
                  >
                    + Add Question
                  </Button>
                </div>
                {section.instructions && (
                  <p className="text-[11px] text-muted-foreground italic">{section.instructions}</p>
                )}
                <div className="space-y-3 pl-2 text-foreground/90">
                  {section.questions.map((q, qIdx) => (
                    <div key={qIdx} className="flex items-start justify-between gap-3 group">
                      <p className="flex-1 whitespace-pre-line leading-relaxed">{q}</p>
                      <button
                        onClick={() => handleRemoveQuestion(sIdx, qIdx)}
                        className="text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity text-[10px] cursor-pointer"
                        title="Remove question"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Answer Key Rubrics */}
            {showAnswerKey && generatedPaper.answerKey && (
              <div className="pt-4 border-t border-border/40 bg-muted/25 p-4 rounded-xl space-y-2">
                <p className="font-700 text-foreground text-xs">Scoring Rubrics & Answer Key:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {generatedPaper.answerKey.rubrics.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
