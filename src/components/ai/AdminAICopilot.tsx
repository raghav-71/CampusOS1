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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-700 text-foreground">Admin AI Institutional Copilot</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated anomaly detection across student attendance compliance, grade distributions, and syllabus health
          </p>
        </div>
        <Badge variant="cyan">Real-Time Surveillance Active</Badge>
      </div>

      {isLoading ? (
        <div className="p-8 glass-card rounded-3xl animate-pulse text-center text-xs text-muted-foreground">
          Scanning academic records across 5 departments...
        </div>
      ) : (
        insights && (
          <>
            {/* At-Risk Students Card */}
            <div className="glass-card rounded-3xl p-6 border border-danger/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping" />
                  <h3 className="text-base font-700 text-foreground">At-Risk Students (Attendance &lt; 75%)</h3>
                </div>
                <span className="badge-danger text-xs px-2.5 py-0.5 rounded-lg font-700">
                  {insights.atRiskStudents.length} Students Flagged
                </span>
              </div>

              <div className="space-y-3">
                {insights.atRiskStudents.map((std: any) => (
                  <div
                    key={std.id}
                    className="p-4 rounded-2xl bg-danger/5 border border-danger/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-700 text-foreground text-sm">{std.name}</span>
                        <span className="text-muted-foreground font-mono-data">({std.rollNumber})</span>
                        <Badge variant="warning">{std.department}</Badge>
                      </div>
                      <p className="text-danger font-600 mb-1">Attendance: {std.attendancePct}% — {std.reason}</p>
                      <p className="text-muted-foreground">Recommendation: {std.recommendedAction}</p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleTriggerAction(std.name, std.recommendedAction)}
                      className="self-end md:self-center"
                    >
                      Execute Action
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Anomalies */}
            <div className="glass-card rounded-3xl p-6 border border-warning/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <h3 className="text-base font-700 text-foreground">Curriculum Velocity Warnings</h3>
                </div>
                <Badge variant="warning">Pacing Warning</Badge>
              </div>

              <div className="space-y-3">
                {insights.curriculumAnomalies.map((curr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-700 text-foreground text-sm mb-1">{curr.subject} ({curr.department})</p>
                      <p className="text-warning font-600 mb-0.5">{curr.issue}</p>
                      <p className="text-muted-foreground">Action: {curr.recommendedAction}</p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast.info(`Extra lecture hours approved for ${curr.subject}`)}
                      className="self-end md:self-center"
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
