'use client';

import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`animate-fade-in-up space-y-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  order = 1,
  className = '',
}: {
  children: React.ReactNode;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const staggerClasses = {
    1: 'stagger-1',
    2: 'stagger-2',
    3: 'stagger-3',
    4: 'stagger-4',
    5: 'stagger-5',
    6: 'stagger-6',
  };

  return (
    <div className={`animate-fade-in-up ${staggerClasses[order]} ${className}`}>
      {children}
    </div>
  );
}
