'use client';

import React from 'react';
import { toast } from 'sonner';

type Role = 'student' | 'teacher' | 'admin';

interface Credentials {
  email: string;
  password: string;
}

interface CredentialsBoxProps {
  credentials: Record<Role, Credentials>;
  activeRole: Role;
  onAutofill: (role: Role) => void;
}

export default function CredentialsBox({
  credentials,
  activeRole,
  onAutofill,
}: CredentialsBoxProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const roles: Role[] = ['student', 'teacher', 'admin'];

  return (
    <div className="mt-4 glass-card rounded-2xl p-4 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-warning/20 flex items-center justify-center">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFB300"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <span className="text-xs font-600 text-warning">Demo Credentials</span>
        <span className="text-xs text-muted-foreground ml-auto">Click role to autofill</span>
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={`cred-${role}`}
            className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
              activeRole === role
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-muted/40 border border-transparent hover:border-border'
            }`}
            onClick={() => onAutofill(role)}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`section-label capitalize ${activeRole === role ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {role}
              </span>
              <span className="text-xs text-muted-foreground font-mono-data truncate max-w-[140px]">
                {credentials[role].email}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(credentials[role].email, 'Email');
                }}
                className="p-1 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                title="Copy email"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              <span
                className={`text-xs font-600 px-2 py-0.5 rounded-md transition-all ${
                  activeRole === role ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                Use
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
