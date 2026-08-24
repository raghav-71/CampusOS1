'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockAnnouncements } from '@/repositories/mockData';
import { Announcement } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const priorityConfig = {
  high: { badge: 'badge-danger', dot: 'bg-danger' },
  medium: { badge: 'badge-warning', dot: 'bg-warning' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

export default function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState<'General' | 'Exam' | 'Event' | 'Academic' | 'Emergency'>(
    'General'
  );
  const [targetAudience, setTargetAudience] = useState('all');

  const handleBroadcast = (e: React.FormEvent) => {
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
      time: 'Just now',
      author: 'College Admin',
      read: false,
    };

    setAnnouncements((prev) => [newNotice, ...prev]);
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
            <h2 className="text-xl font-700 text-foreground">
              Institutional Announcement Broadcaster
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish official notices, exam updates, and emergency campus alerts
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setBroadcastModalOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
                <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
              </svg>
            }
          >
            Broadcast Announcement
          </Button>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {announcements.map((item) => {
            const config = priorityConfig[item.priority] || priorityConfig.low;
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${config.dot} mt-1.5 flex-shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-600 ${config.badge}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className="badge-muted text-xs px-2 py-0.5 rounded-md font-500">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono-data">
                        {item.time}
                      </span>
                    </div>

                    <h3 className="text-base font-700 text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {item.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Posted by: {item.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="btn-danger text-xs px-3 py-1.5 cursor-pointer"
                  >
                    Delete Notice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <Modal
          isOpen={broadcastModalOpen}
          onClose={() => setBroadcastModalOpen(false)}
          title="Broadcast Campus Announcement"
          description="Send high-priority notifications to students and faculty members"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setBroadcastModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleBroadcast}>
                Broadcast Now
              </Button>
            </div>
          }
        >
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End-Semester Examination Hall Allotments Released"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="input-field"
                >
                  <option value="high">High (Alert)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="low">Low (FYI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input-field"
                >
                  <option value="General">General</option>
                  <option value="Exam">Exam</option>
                  <option value="Event">Event</option>
                  <option value="Academic">Academic</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Notice Content / Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Full announcement text, affected batches, and instructions..."
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
