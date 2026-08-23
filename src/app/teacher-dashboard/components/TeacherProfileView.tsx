'use client';

import React from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const publications = [
  {
    title: 'Adaptive Memory Allocation Heuristics in Cloud Micro-virtualization',
    journal: 'IEEE Transactions on Cloud Computing, 2025',
    citations: 42,
  },
  {
    title: 'Fault-Tolerant Distributed Consensus in Edge Compute Clusters',
    journal: 'ACM Journal on Distributed Systems, 2024',
    citations: 78,
  },
  {
    title: 'Pedagogical Frameworks for Hands-on Operating Systems Laboratories',
    journal: 'International Journal of CS Education, 2023',
    citations: 29,
  },
];

export default function TeacherProfileView() {
  const { profile } = useProfile();

  const fullName = profile?.fullName ?? 'Dr. Priya Nair';
  const email = profile?.email ?? 'dr.priya.nair@campusos.edu';
  const department = profile?.department ?? 'Department of Computer Applications (BCA)';
  const initials = profile?.initials ?? 'PN';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Profile Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl font-800 text-white shadow-glow">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-800 text-foreground">{fullName}</h2>
              <Badge variant="violet">Professor & HOD</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono-data mb-1">{email}</p>
            <p className="text-xs text-muted-foreground">
              {department} &nbsp;·&nbsp; Cabin: <span className="text-foreground font-600">Block A-312</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info('Faculty profile settings')}
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success('Downloaded complete faculty CV & dossier')}
          >
            Download CV
          </Button>
        </div>
      </div>

      {/* Faculty KPI Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Teaching Experience</p>
          <p className="text-2xl font-800 text-foreground metric-value">12+ <span className="text-xs font-normal text-muted-foreground">Years</span></p>
          <p className="text-[11px] text-accent font-600 mt-1">Senior Faculty</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Student Course Rating</p>
          <p className="text-2xl font-800 text-success metric-value">4.9 <span className="text-xs font-normal text-muted-foreground">/ 5.0</span></p>
          <p className="text-[11px] text-success font-600 mt-1">★ Top Rated Teacher</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Research Publications</p>
          <p className="text-2xl font-800 text-primary metric-value">18</p>
          <p className="text-[11px] text-muted-foreground mt-1">149 Citations</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Students Mentored</p>
          <p className="text-2xl font-800 text-accent metric-value">1,400+</p>
          <p className="text-[11px] text-muted-foreground mt-1">Alumni Network</p>
        </div>
      </div>

      {/* Publications List */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-700 text-foreground">Peer-Reviewed Research Publications</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Key contributions in distributed computing and systems research</p>
          </div>
          <Badge variant="cyan">IEEE / ACM</Badge>
        </div>

        <div className="space-y-3">
          {publications.map((pub, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-muted/20 border border-border/40 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-600 text-foreground mb-0.5">{pub.title}</h4>
                <p className="text-xs text-muted-foreground">{pub.journal}</p>
              </div>
              <span className="badge-violet text-[11px] px-2 py-0.5 rounded font-600 flex-shrink-0">
                {pub.citations} Citations
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
