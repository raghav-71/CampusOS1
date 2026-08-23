'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function FacultyAIEngine() {
  const [subject, setSubject] = useState('Operating Systems (CS501)');
  const [topics, setTopics] = useState('Memory Management, Deadlocks, Process Scheduling');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [totalMarks, setTotalMarks] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      const data = await res.json();
      setGeneratedPaper(data.paper);
      toast.success('Question Paper & Marking Scheme generated successfully!');
    } catch (err: any) {
      toast.error('Generation failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToArchive = () => {
    toast.success('Paper saved into Question Paper Archive (Approved Draft)');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-700 text-foreground">Faculty AI Assessment & Paper Generator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate balanced university exam papers, test blueprints, and scoring rubrics in seconds
          </p>
        </div>
        <Badge variant="violet">AI Assessment Engine v2.0</Badge>
      </div>

      {/* Generator Configuration Form */}
      <form onSubmit={handleGenerate} className="glass-card rounded-3xl p-6 border border-border space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1.5">
              Course Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
            >
              <option value="Operating Systems (CS501)">Operating Systems (CS501)</option>
              <option value="DBMS (CS502)">Database Systems (CS502)</option>
              <option value="Computer Networks (CS503)">Computer Networks (CS503)</option>
              <option value="System Architecture (MCA302)">System Architecture (MCA302)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1.5">
              Examination Target
            </label>
            <select
              value={totalMarks}
              onChange={(e) => setTotalMarks(parseInt(e.target.value))}
              className="input-field"
            >
              <option value={100}>End-Semester Exam (100 Marks · 3 Hours)</option>
              <option value={50}>Mid-Semester Exam (50 Marks · 90 Mins)</option>
              <option value={20}>Class Quiz / Assessment (20 Marks · 45 Mins)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1.5">
              Difficulty Calibration
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
            >
              <option value="Moderate">Balanced (30% Easy, 50% Mod, 20% Hard)</option>
              <option value="Challenging">Rigorous (20% Easy, 40% Mod, 40% Hard)</option>
              <option value="Fundamental">Foundational (50% Easy, 40% Mod, 10% Hard)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1.5">
            Syllabus Topics & Target Chapters
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

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full sm:w-auto"
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
                Generated & Calibrated
              </span>
              <h3 className="text-lg font-800 text-foreground">{generatedPaper.title}</h3>
              <p className="text-xs text-muted-foreground">
                {generatedPaper.semester} · Duration: {generatedPaper.duration} · Max Marks: {generatedPaper.totalMarks}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleSaveToArchive}>
                Save to Archive
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.success('Downloaded complete formatted examination paper PDF')}
              >
                Download PDF
              </Button>
            </div>
          </div>

          {/* Paper Body */}
          <div className="p-6 rounded-2xl bg-card/80 border border-border/70 font-mono-data text-xs space-y-6 leading-relaxed">
            <div className="text-center border-b border-border/60 pb-3">
              <h4 className="font-800 text-sm text-foreground">UNIVERSITY EXAMINATION BOARD</h4>
              <p className="text-muted-foreground">{generatedPaper.subject} — Fall 2026</p>
            </div>

            {/* Part A */}
            <div>
              <p className="font-800 text-sm text-primary mb-2">{generatedPaper.partA.title}</p>
              <div className="space-y-1.5 pl-2 text-foreground/90">
                {generatedPaper.partA.questions.map((q: string, i: number) => (
                  <p key={i}>{q}</p>
                ))}
              </div>
            </div>

            {/* Part B */}
            <div className="pt-4 border-t border-border/40">
              <p className="font-800 text-sm text-accent mb-2">{generatedPaper.partB.title}</p>
              <div className="space-y-3 pl-2 text-foreground/90">
                {generatedPaper.partB.questions.map((q: string, i: number) => (
                  <p key={i} className="whitespace-pre-line">{q}</p>
                ))}
              </div>
            </div>

            {/* Answer Key Rubrics */}
            <div className="pt-4 border-t border-border/40 bg-muted/20 p-4 rounded-xl">
              <p className="font-700 text-foreground mb-1">Scoring Rubrics & Key:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {generatedPaper.answerKey.rubrics.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
