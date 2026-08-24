'use client';

import React from 'react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { getRoleHomeRoute } from '@/lib/rbac';
import Button from '@/components/ui/Button';

interface AccessDeniedProps {
  requiredRole?: string;
  requiredPermission?: string;
  className?: string;
}

export default function AccessDenied({
  requiredRole,
  requiredPermission,
  className = '',
}: AccessDeniedProps) {
  const { profile } = useProfile();
  const homeRoute = getRoleHomeRoute(profile?.role);

  return (
    <div className={`flex items-center justify-center min-h-[60vh] p-4 ${className}`}>
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-danger/30 max-w-md w-full text-center shadow-glow animate-fade-in-up">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center mx-auto mb-5 text-danger animate-pulse">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 className="text-xl font-800 text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You do not have the required permissions to view this resource.
        </p>

        {(requiredRole || requiredPermission) && (
          <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground mb-6 font-mono-data">
            {requiredRole && (
              <div>
                Required Role:{' '}
                <span className="text-warning font-600 uppercase">{requiredRole}</span>
              </div>
            )}
            {requiredPermission && (
              <div>
                Required Permission:{' '}
                <span className="text-danger font-600">{requiredPermission}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={homeRoute} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full">
              Return to My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
