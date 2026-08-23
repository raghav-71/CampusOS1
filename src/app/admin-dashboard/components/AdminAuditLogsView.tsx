'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface AuditLogEntry {
  id: string;
  action: string;
  category: 'Auth' | 'Grade' | 'Curriculum' | 'Security' | 'User';
  severity: 'info' | 'warning' | 'critical';
  actor: string;
  role: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-001',
    action: 'Student Role Elevated',
    category: 'Security',
    severity: 'critical',
    actor: 'admin@campusos.edu',
    role: 'Admin',
    ipAddress: '192.168.1.10',
    timestamp: '10 min ago',
    details: 'User ID usr-008 elevated to Staff role pending clearance',
  },
  {
    id: 'aud-002',
    action: 'Bulk Grade Modification',
    category: 'Grade',
    severity: 'warning',
    actor: 'dr.priya.nair@campusos.edu',
    role: 'Teacher',
    ipAddress: '192.168.1.45',
    timestamp: '42 min ago',
    details: 'Graded 14 submissions for Virtual Memory Lab Report (CS501)',
  },
  {
    id: 'aud-003',
    action: 'Course Blueprint Published',
    category: 'Curriculum',
    severity: 'info',
    actor: 'admin@campusos.edu',
    role: 'Admin',
    ipAddress: '192.168.1.10',
    timestamp: '2 hours ago',
    details: 'End-term syllabus approved for BCA Semester 5',
  },
  {
    id: 'aud-004',
    action: 'Failed Login Spike Detected',
    category: 'Auth',
    severity: 'warning',
    actor: 'system-firewall',
    role: 'System',
    ipAddress: '142.250.190.46',
    timestamp: '5 hours ago',
    details: '6 repeated failed password attempts on account rohit.verma@campusos.edu',
  },
  {
    id: 'aud-005',
    action: 'New Student Enrollment',
    category: 'User',
    severity: 'info',
    actor: 'arjun.sharma@campusos.edu',
    role: 'Student',
    ipAddress: '192.168.1.88',
    timestamp: '1 day ago',
    details: 'Student registered into Fall 2026 term successfully',
  },
];

const severityStyles = {
  info: 'badge-cyan',
  warning: 'badge-warning',
  critical: 'badge-danger',
};

export default function AdminAuditLogsView() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = logs.filter((l) =>
    filterSeverity === 'all' ? true : l.severity === filterSeverity
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log trail of administrative operations, authentication events, and grade alterations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.success('Audit trail exported as encrypted JSON')}
          >
            Export Logs
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3.5 px-4">Event ID</th>
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">Actor / Role</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono-data text-muted-foreground">{log.id}</td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-600 text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{log.details}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-500 text-foreground">{log.actor}</p>
                    <p className="text-[10px] text-muted-foreground">{log.role}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono-data text-muted-foreground">{log.ipAddress}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{log.timestamp}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-700 ${severityStyles[log.severity]}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
