'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { FeedbackCategory } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import PageTransition from '@/components/motion/PageTransition';

const facultyCategories: { id: FeedbackCategory; label: string; icon: string }[] = [
  { id: 'Teaching', label: 'Academic & Curriculum', icon: '📚' },
  { id: 'CampusOS', label: 'CampusOS Features', icon: '⚡' },
  { id: 'Technical Issue', label: 'Lab & AV Equipment', icon: '🔬' },
  { id: 'Suggestion', label: 'Department Suggestion', icon: '💡' },
  { id: 'Other', label: 'Institutional Feedback', icon: '🏛️' },
];

export default function TeacherFeedbackView() {
  const [category, setCategory] = useState<FeedbackCategory>('Teaching');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback text.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim(),
          role: 'teacher',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
        setMessage('');
        toast.success('Your faculty feedback was submitted anonymously.');
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📣</span> Faculty Anonymous Feedback & Suggestions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit confidential suggestions on curriculum, classroom AV/labs, or institutional policies
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-700">
            <span>🔒</span>
            <span>Anonymous Faculty Portal</span>
          </div>
        </div>

        <AnimatedCard className="p-4 sm:p-5 border-border/80 bg-gradient-to-r from-blue-950/40 via-[#0a1532]/60 to-purple-950/40 shadow-glass">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-800 text-foreground text-sm">Confidential & Protected</h4>
              <p className="text-muted-foreground leading-relaxed">
                Your feedback is decoupled from your teacher profile. The Dean, HOD, and administrators can review the submission without viewing faculty names or email addresses.
              </p>
            </div>
          </div>
        </AnimatedCard>

        {submittedSuccess ? (
          <AnimatedCard className="p-8 text-center space-y-4 border-emerald-500/40 bg-emerald-950/20 shadow-glow">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-800 text-foreground">Feedback Successfully Submitted</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Thank you for contributing to the academic and operational enhancement of CampusOS.
              </p>
            </div>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="btn-primary text-xs py-2 px-5 rounded-xl font-bold shadow-glow cursor-pointer inline-block"
            >
              Submit Additional Feedback
            </button>
          </AnimatedCard>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                1. Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {facultyCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      category === cat.id
                        ? 'bg-primary/20 border-primary text-foreground shadow-glow'
                        : 'glass-card border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-700">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                2. Experience Rating
              </label>
              <div className="flex items-center gap-2 bg-card/60 p-3 rounded-2xl border border-border/60 w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                      star <= rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-muted-foreground/40'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-3 text-xs font-mono-data text-accent font-bold">
                  {rating}/5
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                3. Confidential Remarks
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share constructive observations, infrastructure requirements, or curriculum feedback..."
                className="input-field resize-none text-xs leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">
                🔒 Anonymous Submission
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs py-2.5 px-6 rounded-xl font-800 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Faculty Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageTransition>
  );
}
