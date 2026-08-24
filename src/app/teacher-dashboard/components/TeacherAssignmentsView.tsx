'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockAssignments, mockSubmissions } from '@/repositories/mockData';
import { Assignment, Submission } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function TeacherAssignmentsView() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [evalSubm, setEvalSubm] = useState<Submission | null>(null);

  // Form State for new assignment
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Operating Systems');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('20');
  const [newDesc, setNewDesc] = useState('');

  // Form State for grading
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) {
      toast.error('Please complete the title and due date fields');
      return;
    }

    const created: Assignment = {
      id: `asg-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      department: 'BCA',
      semester: 'Sem 5',
      teacher: 'Dr. Priya Nair',
      dueDate: newDueDate,
      totalSubmissions: 0,
      gradedSubmissions: 0,
      maxScore: parseInt(newMaxMarks) || 20,
      description: newDesc,
      status: 'active',
    };

    setAssignments((prev) => [created, ...prev]);
    toast.success(`Published assignment: "${newTitle}"`);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDueDate('');
    setNewDesc('');
  };

  const handleSaveEvaluation = () => {
    if (!evalSubm) return;
    const scoreNum = parseFloat(scoreInput);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > evalSubm.maxScore) {
      toast.error(`Score must be between 0 and ${evalSubm.maxScore}`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === evalSubm.id
          ? { ...s, score: scoreNum, feedback: feedbackInput, status: 'graded' }
          : s
      )
    );
    toast.success(`Evaluated ${evalSubm.studentName}: ${scoreNum}/${evalSubm.maxScore}`);
    setEvalSubm(null);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">
              Assignments & Submissions Evaluation
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create homework assignments, lab assessments, and grade submissions
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Create New Assignment
          </Button>
        </div>

        {/* Assignments Table */}
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-600 text-foreground">
              Course Assignments ({assignments.length})
            </h3>
            <Badge variant="cyan">Fall 2026</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-3.5 px-4">Title & Subject</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4">Graded</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {assignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-600 text-foreground">{asg.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {asg.subject} · {asg.department} {asg.semester}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-foreground">{asg.dueDate}</td>
                    <td className="py-3.5 px-4 font-600 text-foreground">
                      {asg.totalSubmissions} received
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-primary font-600">
                        {asg.gradedSubmissions} / {asg.totalSubmissions || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-600 ${
                          asg.status === 'active'
                            ? 'badge-success'
                            : asg.status === 'grading'
                              ? 'badge-warning'
                              : 'badge-muted'
                        }`}
                      >
                        {asg.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submissions Queue */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-600 text-foreground">
                Recent Submissions Ready for Evaluation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any submission to review report and grade
              </p>
            </div>
            <Badge variant="violet">{submissions.length} Submissions</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((subm) => (
              <div
                key={subm.id}
                className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-700 ${
                        subm.status === 'graded' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {subm.status === 'graded'
                        ? `Graded: ${subm.score}/${subm.maxScore}`
                        : 'Needs Review'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono-data">
                      {subm.rollNumber}
                    </span>
                  </div>

                  <h4 className="text-sm font-700 text-foreground mb-0.5">{subm.studentName}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                    {subm.assignmentTitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{subm.submittedAt}</span>
                  <button
                    onClick={() => {
                      setEvalSubm(subm);
                      setScoreInput(subm.score ? String(subm.score) : '');
                      setFeedbackInput(subm.feedback || '');
                    }}
                    className="text-xs btn-primary px-3 py-1 cursor-pointer"
                  >
                    {subm.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Assignment"
          description="Publish a new homework or practical lab assessment for enrolled students"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateAssignment}>
                Publish Assignment
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Page Replacement Simulation in C"
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
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="input-field"
                >
                  <option value="Operating Systems">Operating Systems (CS501)</option>
                  <option value="OS Lab Practical">OS Lab Practical (CS501L)</option>
                  <option value="System Architecture">System Architecture (MCA302)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(e.target.value)}
                  className="input-field"
                  min="5"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Due Date & Time
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Instructions & Rubric
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Specify submission guidelines, file formats (.zip, .pdf), and scoring criteria..."
                className="input-field resize-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Grade Evaluation Modal */}
      {evalSubm && (
        <Modal
          isOpen={Boolean(evalSubm)}
          onClose={() => setEvalSubm(null)}
          title={`Evaluate: ${evalSubm.studentName}`}
          description={`${evalSubm.assignmentTitle} · Roll: ${evalSubm.rollNumber}`}
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEvalSubm(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEvaluation}>
                Save & Post Grade
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Awarded Score (Out of {evalSubm.maxScore})
              </label>
              <input
                type="number"
                min="0"
                max={evalSubm.maxScore}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="input-field"
                placeholder={`0 – ${evalSubm.maxScore}`}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Teacher Feedback
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="input-field resize-none"
                placeholder="Constructive remarks, code evaluation, areas of improvement..."
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
