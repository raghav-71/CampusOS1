'use client';

import React from 'react';

const adminKPIs = [
  {
    id: 'akpi-students',
    title: 'TOTAL STUDENTS',
    value: '2,418',
    status: '+34 this month',
    detail: 'Across 5 departments',
    progress: 88,
  },
  {
    id: 'akpi-teachers',
    title: 'FACULTY MEMBERS',
    value: '86',
    status: '+2 this semester',
    detail: '12 departments covered',
    progress: 72,
  },
  {
    id: 'akpi-subjects',
    title: 'ACTIVE SUBJECTS',
    value: '64',
    status: '8 new this semester',
    detail: 'Full curriculum active',
    progress: 95,
  },
  {
    id: 'akpi-notes',
    title: 'STUDY ASSETS',
    value: '8,247',
    status: '+142 this week',
    detail: 'Verified materials',
    progress: 84,
  },
  {
    id: 'akpi-events',
    title: 'UPCOMING EVENTS',
    value: '7',
    status: '3 this week',
    detail: 'Next: TechFest Aug 28',
    progress: 60,
  },
  {
    id: 'akpi-pending',
    title: 'FLAGGED ALERTS',
    value: '2',
    status: 'Attendance < 75%',
    detail: 'Review required',
    progress: 20,
    isAlert: true,
  },
];

export default function AdminKPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 mb-6">
      {adminKPIs.map((kpi) => (
        <div
          key={kpi.id}
          className="p-4 sm:p-5 border border-black/[0.06] bg-white rounded-[18px] flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-200"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-semibold tracking-wider text-[#8E8E93] uppercase">
                {kpi.title}
              </span>
              {kpi.isAlert && (
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              )}
            </div>

            <div className="flex items-baseline gap-1 my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {kpi.value}
              </span>
            </div>

            <p className={`text-xs font-semibold ${kpi.isAlert ? 'text-danger' : 'text-[#15803D]'}`}>
              {kpi.status}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-black/[0.04]">
            <div className="w-full h-1.5 bg-[#F0FDF4] rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  kpi.isAlert ? 'bg-danger' : 'bg-primary'
                }`}
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
            <p className="text-[10.5px] text-[#8E8E93] truncate">{kpi.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
