'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { FeedbackCategory } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';

const categories: { id: FeedbackCategory; label: string; icon: string }[] = [
  { id: 'Teaching', label: 'Teaching Quality', icon: '👨‍🏫' },
  { id: 'Course', label: 'Course Curriculum', icon: '📖' },
  { id: 'CampusOS', label: 'CampusOS Platform', icon: '⚡' },
  { id: 'Faculty', label: 'Faculty & Mentorship', icon: '🤝' },
  { id: 'Technical Issue', label: 'Technical / Lab Issue', icon: '🛠️' },
  { id: 'Suggestion', label: 'Campus Suggestion', icon: '💡' },
  { id: 'Other', label: 'General Feedback', icon: '💬' },
];

export default function StudentFeedbackView() {
  const [category, setCategory] = useState<FeedbackCategory>('Teaching');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write your feedback message before submitting.');
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
          role: 'student',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
        setMessage('');
        toast.success('Your anonymous feedback was submitted successfully!');
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
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📣</span> Anonymous Student Feedback
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share honest feedback about courses, teaching, infrastructure, or CampusOS
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-700">
            <span>🔒</span>
            <span>100% Anonymous Guaranteed</span>
          </div>
        </div>

        {/* Anonymity Shield Banner */}
        <AnimatedCard className="p-4 sm:p-5 border-border/80 bg-gradient-to-r from-blue-950/40 via-[#0a1532]/60 to-purple-950/40 shadow-glass">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-800 text-foreground text-sm">Your Privacy is Protected</h4>
              <p className="text-muted-foreground leading-relaxed">
                CampusOS strips all personal identifiers. Administrators and faculty will see your category, rating, and feedback text, but your name, email, roll number, and student ID are <span className="text-emerald-400 font-bold">never stored or displayed</span>.
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
              <h3 className="text-lg font-800 text-foreground">Thank You for Your Feedback!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your feedback has been anonymously registered with the academic administration for review.
              </p>
            </div>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="btn-primary text-xs py-2 px-5 rounded-xl font-bold shadow-glow cursor-pointer inline-block"
            >
              Submit Another Feedback
            </button>
          </AnimatedCard>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                1. Select Feedback Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((cat) => (
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

            {/* Rating Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                2. Experience Rating (1 to 5 Stars)
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
                  {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Good (4/5)' : rating === 3 ? 'Average (3/5)' : rating === 2 ? 'Needs Improvement (2/5)' : 'Poor (1/5)'}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-2.5">
              <label className="block text-xs font-700 text-muted-foreground uppercase tracking-wider">
                3. Your Anonymous Feedback
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your constructive thoughts, suggestions, or concerns clearly. Please do not include your personal contact details here to maintain total anonymity..."
                className="input-field resize-none text-xs leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">
                🔒 Anonymous Submission · No Identity Logged
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs py-2.5 px-6 rounded-xl font-800 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting Anonymously...' : '✓ Submit Anonymous Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageTransition>
  );
}
