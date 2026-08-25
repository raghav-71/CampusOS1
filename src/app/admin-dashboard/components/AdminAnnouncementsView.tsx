'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Announcement } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { notificationService } from '@/services/notificationService';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import AnimatedCard from '@/components/motion/AnimatedCard';
import MagneticButton from '@/components/motion/MagneticButton';

const priorityConfig = {
  high: { badge: 'badge-danger', dot: 'bg-danger' },
  medium: { badge: 'badge-warning', dot: 'bg-warning' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

export default function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState<'General' | 'Exam' | 'Event' | 'Academic' | 'Emergency'>(
    'General'
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');

  const loadData = async () => {
    const list = await campusRepository.getAnnouncements();
    setAnnouncements(list);
  };

  useEffect(() => {
    loadData();
    const unsub = notificationService.subscribe((list) => {
      setAnnouncements(list);
    });
    return () => unsub();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter announcement title and body');
      return;
    }

    const newNotice: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      body,
      priority,
      category,
      type: 'ANNOUNCEMENT',
      time: 'Just now',
      createdAt: new Date().toISOString(),
      author: 'Office of Controller of Examinations (BCA)',
      read: false,
      targetDepartment: 'BCA',
      targetRole: targetAudience,
    };

    await notificationService.sendNotification(newNotice);
    toast.success(`Announcement broadcasted to ${targetAudience.toUpperCase()}!`);
    setBroadcastModalOpen(false);
    setTitle('');
    setBody('');
  };

  const handleDelete = (id: string, noticeTitle: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Removed notice: "${noticeTitle}"`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📢</span> Institutional Announcement & Circular Broadcaster
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish official BCA notices, exam schedules, and emergency campus alerts in real-time
            </p>
          </div>

          <MagneticButton
            variant="primary"
            size="sm"
            onClick={() => setBroadcastModalOpen(true)}
            className="text-xs font-800 shadow-glow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
              <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
            </svg>
            Broadcast Announcement
          </MagneticButton>
        </div>

        {/* Announcements List */}
        <div className="space-y-3.5">
          {announcements.map((item) => {
            const config = priorityConfig[item.priority] || priorityConfig.low;
            const isLiveClass = item.type === 'CLASS_STARTED';

            return (
              <AnimatedCard
                key={item.id}
                className={`p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
                  isLiveClass
                    ? 'border-accent shadow-glow-accent'
                    : 'border-border/80 hover:border-primary/40 hover:shadow-glow'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full ${isLiveClass ? 'bg-accent animate-ping' : config.dot} mt-1.5 flex-shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-800 ${config.badge}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className="badge-muted text-xs px-2.5 py-0.5 rounded-full font-700">
                        {item.category}
                      </span>
                      {item.targetDepartment && (
                        <span className="badge-cyan text-xs px-2 py-0.5 rounded-full font-800">
                          {item.targetDepartment}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono-data font-600">
                        {item.time}
                      </span>
                    </div>

                    <h3 className="text-base font-800 text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-500">
                      {item.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2 font-600">
                      Posted by: <span className="text-foreground font-700">{item.author}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="btn-press text-xs px-3 py-1.5 rounded-xl text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 cursor-pointer font-700 transition-all"
                  >
                    Delete Notice
                  </button>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <Modal
          isOpen={broadcastModalOpen}
          onClose={() => setBroadcastModalOpen(false)}
          title="Broadcast BCA Announcement"
          description="Send high-priority notifications to students and faculty members in real time"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setBroadcastModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleBroadcast} className="shadow-glow font-800">
                Broadcast Now
              </Button>
            </div>
          }
        >
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End-Semester Examination Hall Allotments Released for BCA"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="input-field cursor-pointer font-700"
                >
                  <option value="high">High (Alert)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="low">Low (FYI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input-field cursor-pointer font-700"
                >
                  <option value="General">General</option>
                  <option value="Exam">Exam</option>
                  <option value="Event">Event</option>
                  <option value="Academic">Academic</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="input-field cursor-pointer font-700"
                >
                  <option value="all">Everyone (BCA)</option>
                  <option value="student">BCA Students Only</option>
                  <option value="teacher">BCA Faculty Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Notice Content / Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Full announcement text, affected batches, room allocations, and instructions..."
                className="input-field resize-none"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
