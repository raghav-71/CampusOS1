'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStoredProfile, clearProfile, UserProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  loading: boolean;
  signOut: () => void;
  refreshProfile: () => void;
}

export function useProfile(): UseProfileResult {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(() => {
    const stored = getStoredProfile();
    setProfile(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const signOut = () => {
    clearProfile();
    setProfile(null);
    router.push('/sign-up-login-screen');
  };

  return {
    profile,
    isLoading,
    loading: isLoading,
    signOut,
    refreshProfile: loadProfile,
  };
}
