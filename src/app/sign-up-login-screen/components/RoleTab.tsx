import React from 'react';

type Role = 'student' | 'teacher' | 'admin';

interface RoleTabProps {
  role: Role;
  isActive: boolean;
  onClick: () => void;
}

const roleConfig: Record<Role, { label: string; icon: React.ReactNode; color: string }> = {
  student: {
    label: 'Student',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    color: 'text-primary',
  },
  teacher: {
    label: 'Teacher',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    color: 'text-accent',
  },
  admin: {
    label: 'Admin',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: 'text-warning',
  },
};

export default function RoleTab({ role, isActive, onClick }: RoleTabProps) {
  const config = roleConfig[role];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-600 transition-all duration-200 ${
        isActive
          ? `glass-card border ${role === 'student' ? 'border-primary/40 text-primary bg-primary/10' : role === 'teacher' ? 'border-accent/40 text-accent bg-accent/10' : 'border-warning/40 text-warning bg-warning/10'}`
          : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-border'
      }`}
    >
      <span className={isActive ? config.color : ''}>{config.icon}</span>
      {config.label}
    </button>
  );
}