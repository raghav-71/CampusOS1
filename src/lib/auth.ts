'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Role, UserProfile } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';

export type { Role, UserProfile };

const PROFILE_KEY = 'campusos_user_profile';
const TOKEN_KEY = 'campusos_token';
const ROLE_COOKIE = 'campusos_role';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('dummy')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

export const roleRoutes: Record<Role, string> = {
  student: '/student-dashboard',
  teacher: '/teacher-dashboard',
  admin: '/admin-dashboard',
};

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/** Fetch profile by email from Supabase `profiles` table with graceful fallback to repository. */
export async function fetchProfileByEmail(email: string): Promise<UserProfile | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();

      if (!error && data) {
        const profile: UserProfile = {
          id: data.id ?? data.user_id ?? '',
          email: data.email,
          role: (data.role as Role) ?? 'student',
          fullName: data.full_name ?? data.fullName ?? data.name ?? data.email,
          initials:
            data.initials ??
            (data.full_name
              ? data.full_name
                  .split(' ')
                  .map((s: string) => s[0])
                  .join('')
              : ''),
          department: data.department,
          semester: data.semester,
          rollNumber: data.roll_number ?? data.rollNumber,
          subjects: data.subjects ?? data.courses,
          avatarUrl: data.avatar_url ?? data.avatarUrl,
        };
        return profile;
      }
    } catch {
      // Fallback to local repository
    }
  }

  // Repository fallback for development & offline mode
  const localUser = await campusRepository.getUserByEmail(email);
  return localUser;
}

/** Sign in using Supabase auth (email + password) with local fallback. */
export async function signIn(email: string, password: string): Promise<UserProfile | null> {
  if (supabase) {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data?.user) {
      const profile = await fetchProfileByEmail(email);
      if (profile) saveProfile(profile);
      return profile;
    }
  }

  const profile = await fetchProfileByEmail(email);
  if (profile) saveProfile(profile);
  return profile;
}

/** Sign up a new user and upsert profile in `profiles` table */
export async function signUp(
  profileInput: Partial<UserProfile> & { password: string }
): Promise<UserProfile | null> {
  if (supabase) {
    const { email, password, fullName, role } = profileInput;
    if (email && password) {
      const res = await supabase.auth.signUp({ email, password });
      if (!res.error && res.data?.user) {
        const userId = res.data.user.id;
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            user_id: userId,
            email,
            full_name: fullName,
            role: role ?? 'student',
          });
        } catch {
          // ignore
        }
        const profile = await fetchProfileByEmail(email);
        if (profile) saveProfile(profile);
        return profile;
      }
    }
  }

  // Fallback profile
  if (profileInput.email) {
    const fallbackProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: profileInput.email,
      role: profileInput.role ?? 'student',
      fullName: profileInput.fullName ?? profileInput.email.split('@')[0],
      initials: profileInput.fullName
        ? profileInput.fullName
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'ST',
      department: profileInput.department ?? 'General',
      semester: profileInput.semester ?? 'Sem 1',
    };
    saveProfile(fallbackProfile);
    return fallbackProfile;
  }

  return null;
}

export async function signOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  clearProfile();
}

/** Persist profile to cookies and storage so middleware and client dashboards can read it */
export function saveProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    const profileJson = JSON.stringify(profile);
    localStorage.setItem(PROFILE_KEY, profileJson);
    sessionStorage.setItem(PROFILE_KEY, profileJson);

    // Sync cookies for Next.js Middleware edge route guarding
    setCookie(TOKEN_KEY, `campusos-sess-${profile.id}`);
    setCookie(ROLE_COOKIE, profile.role || 'student');
    setCookie('campusos_email', profile.email);
  }
}

/** Read persisted profile */
export function getStoredProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY) || sessionStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

/** Clear profile on logout */
export function clearProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);

    // Clean up cookies
    deleteCookie(TOKEN_KEY);
    deleteCookie(ROLE_COOKIE);
    deleteCookie('campusos_email');
  }
}
