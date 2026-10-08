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
    <div className="mt-4 bg-white rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-brand-50 border border-brand-100 flex items-center justify-center text-primary-dark">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <span className="text-xs font-bold text-slate-800">Demo Accounts</span>
        <span className="text-[11px] text-muted-foreground ml-auto font-medium">Click to auto-fill</span>
      </div>

      <div className="space-y-2">
        {roles.map((role) => {
          const isActive = activeRole === role;
          return (
            <div
              key={`cred-${role}`}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'bg-brand-50 border border-primary/40 shadow-sm'
                  : 'bg-slate-50 border border-border hover:border-primary/30 hover:bg-brand-50/50'
              }`}
              onClick={() => onAutofill(role)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-xs font-bold capitalize transition-colors ${
                    isActive ? 'text-primary-dark' : 'text-slate-700 group-hover:text-primary-dark'
                  }`}
                >
                  {role}
                </span>
                <span className="text-xs text-muted-foreground font-mono-data truncate max-w-[140px] sm:max-w-[180px]">
                  {credentials[role].email}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(credentials[role].email, 'Email');
                  }}
                  className="p-1 rounded-md hover:bg-white text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-border group-hover:border-primary group-hover:text-primary-dark'
                  }`}
                >
                  Use
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
