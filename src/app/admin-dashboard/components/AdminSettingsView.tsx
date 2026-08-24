'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminSettingsView() {
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');
  const [minAttendance, setMinAttendance] = useState('75');
  const [autoHallTickets, setAutoHallTickets] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Institutional platform settings updated successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-xl font-700 text-foreground">
          Platform Configuration & System Governance
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Academic terms, attendance compliance rules, and database integration status
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Academic Rules */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-base font-600 text-foreground">Academic Governance</h3>
            <Badge variant="cyan">Active Rules</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Active Academic Term
              </label>
              <select
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="input-field"
              >
                <option value="Fall 2026">Fall Semester 2026 (Active)</option>
                <option value="Spring 2027">Spring Semester 2027 (Upcoming)</option>
                <option value="Summer 2026">Summer Term 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                Minimum Mandatory Attendance (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                className="input-field"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Students below this threshold are flagged for re-eval
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-600 text-foreground">Automatic Hall Ticket Generation</p>
              <p className="text-xs text-muted-foreground">
                Issue admit cards automatically if student meets attendance threshold
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoHallTickets}
              onChange={(e) => setAutoHallTickets(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/40">
            <div>
              <p className="text-sm font-600 text-foreground">
                AI Study Assistant & Paper Generation Engine
              </p>
              <p className="text-xs text-muted-foreground">
                Allow students and faculty to access AI tools across all portals
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </div>
        </div>

        {/* Database & Infrastructure Status */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-base font-600 text-foreground">
              Database & Security Infrastructure
            </h3>
            <span className="badge-success text-xs px-2.5 py-1 rounded-lg font-600">
              Healthy & Synchronized
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
              <div>
                <p className="font-600 text-foreground">Data Repository Architecture</p>
                <p className="text-muted-foreground">
                  In-Memory Singleton with Supabase Edge Repository Ready
                </p>
              </div>
              <Badge variant="cyan">Mock + Supabase Hybrid</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
              <div>
                <p className="font-600 text-foreground">Next.js Edge Middleware Security</p>
                <p className="text-muted-foreground">
                  Role-isolated cookies & route guarding enabled
                </p>
              </div>
              <span className="badge-success text-[10px] px-2 py-0.5 rounded font-600">
                Active Shield
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/40">
            <div>
              <p className="text-sm font-600 text-danger">Platform Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">
                Lock non-admin access for scheduled institutional upgrades
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 accent-danger"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md">
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
