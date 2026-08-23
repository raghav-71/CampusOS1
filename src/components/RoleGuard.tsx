'use client';

import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Role } from '@/types/campus';
import { Permission, hasPermission } from '@/lib/rbac';
import AccessDenied from './AccessDenied';
import Skeleton from './ui/Skeleton';

interface RoleGuardProps {
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  requiredPermission,
  fallback,
  children,
}: RoleGuardProps) {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton height={40} className="w-1/3" />
        <Skeleton height={200} className="w-full" />
      </div>
    );
  }

  const role = profile?.role;

  // Check role requirement
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDenied requiredRole={allowedRoles.join(' or ')} />
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDenied requiredPermission={requiredPermission} />
    );
  }

  return <>{children}</>;
}
