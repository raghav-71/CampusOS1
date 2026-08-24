'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminAICopilot() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/analytics')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.insights);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleTriggerAction = (studentName: string, action: string) => {
    toast.success(`Action dispatched for ${studentName}: "${action}"`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              Admin AI Institutional Copilot
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated anomaly detection across student attendance compliance, grade distributions,
            and syllabus health
          </p>
        </div>
        <Badge variant="cyan">Real-Time Surveillance Active</Badge>
      </div>

      {isLoading ? (
        <div className="p-10 glass-card rounded-3xl animate-pulse text-center text-xs text-muted-foreground shadow-glass">
          Scanning academic records across 5 university departments...
        </div>
      ) : (
        insights && (
          <>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-4.5 border border-primary/30">
                <p className="text-[11px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Total Enrolled
                </p>
                <p className="text-2xl font-800 text-foreground">
                  {insights.totalStudentsEnrolled}
                </p>
                <p className="text-[11px] text-accent mt-0.5">
                  Across All Undergraduate & PG Depts
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4.5 border border-danger/30">
                <p className="text-[11px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  At-Risk Students
                </p>
                <p className="text-2xl font-800 text-danger">{insights.atRiskStudents.length}</p>
                <p className="text-[11px] text-danger/80 mt-0.5">Attendance &lt; 75% cutoff</p>
              </div>
              <div className="glass-card rounded-2xl p-4.5 border border-warning/30">
                <p className="text-[11px] font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Syllabus Anomalies
                </p>
                <p className="text-2xl font-800 text-warning">
                  {insights.curriculumAnomalies.length}
                </p>
                <p className="text-[11px] text-warning/80 mt-0.5">Coverage pace below 60%</p>
              </div>
            </div>

            {/* At-Risk Students Card */}
            <div className="glass-card rounded-3xl p-6 border border-danger/35 space-y-4 shadow-glass">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping" />
                  <h3 className="text-base font-800 text-foreground">
                    At-Risk Students (Attendance &lt; 75%)
                  </h3>
                </div>
                <span className="badge-danger text-xs px-2.5 py-0.5 rounded-lg font-700">
                  {insights.atRiskStudents.length} Students Flagged
                </span>
              </div>

              <div className="space-y-3">
                {insights.atRiskStudents.map((std: any) => (
                  <div
                    key={std.id}
                    className="p-4 rounded-2xl bg-danger/10 border border-danger/25 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-700 text-foreground text-sm">{std.name}</span>
                        <span className="text-muted-foreground font-mono-data">
                          ({std.rollNumber})
                        </span>
                        <Badge variant="warning">{std.department}</Badge>
                      </div>
                      <p className="text-danger font-700 mb-1">
                        Attendance: {std.attendancePct}% — {std.reason}
                      </p>
                      <p className="text-muted-foreground">
                        Recommendation: {std.recommendedAction}
                      </p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleTriggerAction(std.name, std.recommendedAction)}
                      className="self-end md:self-center shadow-glow font-700"
                    >
                      Execute Action
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Anomalies */}
            <div className="glass-card rounded-3xl p-6 border border-warning/35 space-y-4 shadow-glass">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <h3 className="text-base font-800 text-foreground">
                    Curriculum Velocity Warnings
                  </h3>
                </div>
                <Badge variant="warning">Pacing Warning</Badge>
              </div>

              <div className="space-y-3">
                {insights.curriculumAnomalies.map((curr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-warning/10 border border-warning/25 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-800 text-foreground text-sm mb-1">
                        {curr.subject} ({curr.department})
                      </p>
                      <p className="text-warning font-700 mb-0.5">{curr.issue}</p>
                      <p className="text-muted-foreground">Action: {curr.recommendedAction}</p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast.info(`Extra lecture hours approved for ${curr.subject}`)}
                      className="self-end md:self-center font-600"
                    >
                      Approve Extra Hours
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
