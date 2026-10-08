import React from 'react';

type Role = 'student' | 'teacher' | 'admin';

interface RoleTabProps {
  role: Role;
  isActive: boolean;
  onClick: () => void;
}

const roleConfig: Record<Role, { label: string; icon: React.ReactNode }> = {
  student: {
    label: 'Student',
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  teacher: {
    label: 'Teacher',
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  admin: {
    label: 'Admin',
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
};

export default function RoleTab({ role, isActive, onClick }: RoleTabProps) {
  const config = roleConfig[role];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
        isActive
          ? 'bg-[#DCFCE7] text-[#15803D] shadow-subtle'
          : 'bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06] hover:bg-black/[0.02]'
      }`}
    >
      <span className={isActive ? 'text-[#15803D]' : 'text-[#8E8E93]'}>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  );
}
