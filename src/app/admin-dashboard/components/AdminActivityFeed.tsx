'use client';

import React, { useState } from 'react';
import { mockActivities } from '@/repositories/mockData';

const iconMap: Record<string, React.ReactNode> = {
  upload: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  registration: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  announcement: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
      <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
    </svg>
  ),
  flag: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  event: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  login: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  suspension: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
};

export default function AdminActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const activities = mockActivities;
  const visible = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="glass-card rounded-2xl p-5 border border-border h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Activity Feed</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Recent platform events</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-500">Live</span>
        </div>
      </div>

      <div className="space-y-0">
        {visible.map((activity, idx) => (
          <div key={activity.id} className="flex gap-3 group">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.iconColor}`}>
                {iconMap[activity.type] || iconMap.upload}
              </div>
              {idx < visible.length - 1 && (
                <div className="w-px flex-1 bg-border/50 my-1.5" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${idx < visible.length - 1 ? 'pb-4' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-600 text-foreground leading-snug">{activity.title}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activity.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {activities.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2.5 rounded-xl border border-border text-xs font-500 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
        >
          {showAll ? 'Show less' : `Show ${activities.length - 5} more events`}
        </button>
      )}
    </div>
  );
}