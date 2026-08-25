'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockEvents } from '@/repositories/mockData';
import { EventItem } from '@/types/campus';
import Button from '@/components/ui/Button';
import AnimatedCard from '@/components/motion/AnimatedCard';
import MagneticButton from '@/components/motion/MagneticButton';

export default function StudentEventsView() {
  const [eventsList] = useState<EventItem[]>(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rsvpList, setRsvpList] = useState<string[]>(['evt-001']);

  const filtered = eventsList.filter((e: EventItem) =>
    selectedCategory === 'all' ? true : e.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const toggleRSVP = (id: string, title: string) => {
    if (rsvpList.includes(id)) {
      setRsvpList((prev) => prev.filter((item) => item !== id));
      toast.info(`Cancelled registration for ${title}`);
    } else {
      setRsvpList((prev) => [...prev, id]);
      toast.success(`RSVP confirmed for ${title}! Ticket saved to your profile.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>🏆</span> Campus Events & Tech Workshops
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover hackathons, guest lectures, sports tournaments, and tech symposiums
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field py-1.5 text-xs font-700 cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            <option value="technical">Technical & Coding</option>
            <option value="cultural">Cultural & Arts</option>
            <option value="sports">Sports & Athletics</option>
            <option value="academic">Academic & Seminars</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((evt: EventItem) => {
          const isRegistered = rsvpList.includes(evt.id);
          return (
            <AnimatedCard
              key={evt.id}
              className={`p-6 border transition-all flex flex-col justify-between shadow-sm ${
                isRegistered
                  ? 'border-accent shadow-glow-accent'
                  : 'border-border/80 hover:border-primary/50 hover:shadow-glow'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-violet text-[11px] px-2.5 py-0.5 rounded-full font-800">
                    {evt.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono-data font-600">{evt.date}</span>
                </div>

                <h3 className="text-base font-800 text-foreground mb-1.5 line-clamp-1">
                  {evt.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2 font-500">
                  {evt.description}
                </p>

                <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-500">Location</span>
                    <span className="text-foreground font-700">{evt.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-500">Time</span>
                    <span className="text-foreground font-mono-data font-700">{evt.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-500">Organizer</span>
                    <span className="text-accent font-700">{evt.organizer}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40">
                <MagneticButton
                  variant={isRegistered ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleRSVP(evt.id, evt.title)}
                  className="w-full text-xs font-800 shadow-glow"
                >
                  {isRegistered ? '✓ Registered (Cancel Ticket)' : 'RSVP / Register Free'}
                </MagneticButton>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
