'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockEvents } from '@/repositories/mockData';
import { EventItem } from '@/types/campus';
import Button from '@/components/ui/Button';

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
          <h2 className="text-xl font-700 text-foreground">Campus Events & Workshops</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover hackathons, seminars, sports, and cultural meetups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((evt: EventItem) => {
          const isRegistered = rsvpList.includes(evt.id);
          return (
            <div
              key={evt.id}
              className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-violet text-[11px] px-2.5 py-0.5 rounded-lg font-600">
                    {evt.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground font-500">{evt.date}</span>
                </div>

                <h3 className="text-base font-700 text-foreground mb-1.5 line-clamp-1">
                  {evt.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-border/40 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-foreground font-500">{evt.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground font-mono-data">{evt.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organizer</span>
                    <span className="text-accent font-500">{evt.organizer}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40">
                <Button
                  variant={isRegistered ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleRSVP(evt.id, evt.title)}
                  className="w-full text-xs"
                >
                  {isRegistered ? '✓ Registered (Cancel)' : 'RSVP / Register Free'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
