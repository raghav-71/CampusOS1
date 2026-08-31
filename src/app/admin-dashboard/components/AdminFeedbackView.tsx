'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AnonymousFeedback, FeedbackCategory } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const categoryColors: Record<FeedbackCategory, string> = {
  Teaching: 'border-l-primary text-primary',
  Course: 'border-l-accent text-accent',
  CampusOS: 'border-l-cyan-400 text-cyan-400',
  Faculty: 'border-l-purple-400 text-purple-400',
  'Technical Issue': 'border-l-rose-500 text-rose-400',
  Suggestion: 'border-l-amber-400 text-amber-400',
  Other: 'border-l-slate-400 text-slate-400',
};

export default function AdminFeedbackView() {
  const [feedbacks, setFeedbacks] = useState<AnonymousFeedback[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch {
      toast.error('Failed to load feedback records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'reviewed' | 'addressed') => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
        toast.success(`Marked feedback as ${newStatus}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (filterRole !== 'all' && f.submittedRole !== filterRole) return false;
    return true;
  });

  const totalCount = feedbacks.length;
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1)
      : '5.0';
  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;
  const reviewedCount = feedbacks.filter((f) => f.status === 'reviewed').length;
  const addressedCount = feedbacks.filter((f) => f.status === 'addressed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📊</span> Institutional Anonymous Feedback & Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admin oversight with strict zero-identity preservation (Names and student/faculty IDs are anonymized)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchFeedbacks}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard className="p-4 border-border/80 bg-card/60">
          <div className="text-xs text-muted-foreground font-700 uppercase">Average Rating</div>
          <div className="text-2xl font-800 text-amber-400 mt-1 flex items-center gap-1.5">
            <span>⭐ {avgRating}</span>
            <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all submissions</p>
        </AnimatedCard>

        <AnimatedCard className="p-4 border-border/80 bg-card/60">
          <div className="text-xs text-muted-foreground font-700 uppercase">Total Submissions</div>
          <div className="text-2xl font-800 text-foreground mt-1">{totalCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Anonymous entries logged</p>
        </AnimatedCard>

        <AnimatedCard className="p-4 border-border/80 bg-card/60">
          <div className="text-xs text-muted-foreground font-700 uppercase">Pending Review</div>
          <div className="text-2xl font-800 text-primary mt-1">{pendingCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting administrative check</p>
        </AnimatedCard>

        <AnimatedCard className="p-4 border-border/80 bg-card/60">
          <div className="text-xs text-muted-foreground font-700 uppercase">Actioned / Addressed</div>
          <div className="text-2xl font-800 text-emerald-400 mt-1">{addressedCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Resolved operational feedback</p>
        </AnimatedCard>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3.5 rounded-2xl border border-border/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-700 text-muted-foreground mr-1">Filter:</span>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Teaching">Teaching Quality</option>
            <option value="Course">Course Curriculum</option>
            <option value="CampusOS">CampusOS Platform</option>
            <option value="Faculty">Faculty & Mentorship</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Suggestion">Suggestion</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="addressed">Addressed</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-field py-1.5 px-3 text-xs w-auto"
          >
            <option value="all">All Submitter Roles</option>
            <option value="student">Student Submissions</option>
            <option value="teacher">Faculty Submissions</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono-data">
          Showing <span className="text-foreground font-bold">{filtered.length}</span> feedback items
        </div>
      </div>

      {/* Feedbacks Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-xs font-mono-data animate-pulse">
          Loading anonymous submissions...
        </div>
      ) : filtered.length === 0 ? (
        <AnimatedCard className="p-12 text-center text-muted-foreground text-xs space-y-2">
          <div className="text-3xl">📭</div>
          <p className="font-700 text-foreground">No feedback matching the selected filters.</p>
        </AnimatedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <AnimatedCard
              key={item.id}
              className={`p-5 border-l-4 ${categoryColors[item.category] || 'border-l-border'} space-y-3.5 bg-card/80 shadow-glass relative`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-secondary text-foreground text-xs font-700 border border-border/60">
                    {item.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold">
                    {item.submittedRole === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono-data">
                  {'★'.repeat(item.rating || 5)}
                  <span className="text-muted-foreground ml-1">({item.rating || 5}/5)</span>
                </div>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                &ldquo;{item.message}&rdquo;
              </p>

              <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono-data">
                  Received: {new Date(item.submittedAt).toLocaleDateString()} at{' '}
                  {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold">Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                    className="bg-secondary/70 border border-border/80 text-[11px] text-foreground rounded-lg px-2 py-0.5 font-bold outline-none cursor-pointer"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="reviewed">👀 Reviewed</option>
                    <option value="addressed">✓ Addressed</option>
                  </select>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}
