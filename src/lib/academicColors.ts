/**
 * Centralized Subject Color Management for Campus OS
 *
 * Enforces strict color consistency across Study Progress, Subject Coverage,
 * course cards, charts, legends, and AI responses.
 * All colors are tailored for high contrast and harmony with the 3D Blue Futuristic theme.
 */

export interface SubjectColorDefinition {
  hex: string;
  cssVar?: string;
  gradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
}

// Canonical palette designed for dark background readability and visual distinction
export const SUBJECT_COLOR_PALETTE: Record<string, SubjectColorDefinition> = {
  // Semester 5 core
  'operating systems': {
    hex: '#0066FF',
    cssVar: 'var(--primary)',
    gradient: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/35',
    badgeText: 'text-blue-400',
    dotColor: '#0066FF',
  },
  'os': {
    hex: '#0066FF',
    cssVar: 'var(--primary)',
    gradient: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/35',
    badgeText: 'text-blue-400',
    dotColor: '#0066FF',
  },
  'database management systems': {
    hex: '#00D4FF',
    cssVar: 'var(--accent)',
    gradient: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/35',
    badgeText: 'text-cyan-400',
    dotColor: '#00D4FF',
  },
  'dbms': {
    hex: '#00D4FF',
    cssVar: 'var(--accent)',
    gradient: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/35',
    badgeText: 'text-cyan-400',
    dotColor: '#00D4FF',
  },
  'computer networks': {
    hex: '#00E096',
    cssVar: 'var(--success)',
    gradient: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/35',
    badgeText: 'text-emerald-400',
    dotColor: '#00E096',
  },
  'cn': {
    hex: '#00E096',
    cssVar: 'var(--success)',
    gradient: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/35',
    badgeText: 'text-emerald-400',
    dotColor: '#00E096',
  },
  'java programming': {
    hex: '#A855F7',
    cssVar: 'var(--violet)',
    gradient: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/35',
    badgeText: 'text-purple-400',
    dotColor: '#A855F7',
  },
  'java': {
    hex: '#A855F7',
    cssVar: 'var(--violet)',
    gradient: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/35',
    badgeText: 'text-purple-400',
    dotColor: '#A855F7',
  },
  'design & analysis of algorithms': {
    hex: '#FFB300',
    cssVar: 'var(--warning)',
    gradient: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/35',
    badgeText: 'text-amber-400',
    dotColor: '#FFB300',
  },
  'daa': {
    hex: '#FFB300',
    cssVar: 'var(--warning)',
    gradient: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/35',
    badgeText: 'text-amber-400',
    dotColor: '#FFB300',
  },

  // Semester 3 & 4 core
  'data structures': {
    hex: '#38BDF8',
    gradient: 'from-sky-500 to-cyan-500',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/35',
    badgeText: 'text-sky-400',
    dotColor: '#38BDF8',
  },
  'dsa': {
    hex: '#38BDF8',
    gradient: 'from-sky-500 to-cyan-500',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/35',
    badgeText: 'text-sky-400',
    dotColor: '#38BDF8',
  },
  'discrete mathematics': {
    hex: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/15',
    badgeBorder: 'border-pink-500/35',
    badgeText: 'text-pink-400',
    dotColor: '#EC4899',
  },
  'maths': {
    hex: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/15',
    badgeBorder: 'border-pink-500/35',
    badgeText: 'text-pink-400',
    dotColor: '#EC4899',
  },
  'computer organization & architecture': {
    hex: '#F97316',
    gradient: 'from-orange-500 to-amber-500',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/35',
    badgeText: 'text-orange-400',
    dotColor: '#F97316',
  },
  'coa': {
    hex: '#F97316',
    gradient: 'from-orange-500 to-amber-500',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/35',
    badgeText: 'text-orange-400',
    dotColor: '#F97316',
  },
  'system architecture': {
    hex: '#F43F5E',
    gradient: 'from-rose-500 to-red-500',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/35',
    badgeText: 'text-rose-400',
    dotColor: '#F43F5E',
  },
  'software engineering': {
    hex: '#14B8A6',
    gradient: 'from-teal-500 to-emerald-500',
    badgeBg: 'bg-teal-500/15',
    badgeBorder: 'border-teal-500/35',
    badgeText: 'text-teal-400',
    dotColor: '#14B8A6',
  },
  'web technologies': {
    hex: '#8B5CF6',
    gradient: 'from-violet-500 to-indigo-500',
    badgeBg: 'bg-violet-500/15',
    badgeBorder: 'border-violet-500/35',
    badgeText: 'text-violet-400',
    dotColor: '#8B5CF6',
  },

  // Semester 1 & 2 foundational
  'c programming': {
    hex: '#06B6D4',
    gradient: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/35',
    badgeText: 'text-cyan-400',
    dotColor: '#06B6D4',
  },
  'digital logic': {
    hex: '#84CC16',
    gradient: 'from-lime-500 to-green-500',
    badgeBg: 'bg-lime-500/15',
    badgeBorder: 'border-lime-500/35',
    badgeText: 'text-lime-400',
    dotColor: '#84CC16',
  },
  'cloud computing': {
    hex: '#60A5FA',
    gradient: 'from-blue-400 to-cyan-400',
    badgeBg: 'bg-blue-400/15',
    badgeBorder: 'border-blue-400/35',
    badgeText: 'text-blue-400',
    dotColor: '#60A5FA',
  },
  'artificial intelligence': {
    hex: '#C084FC',
    gradient: 'from-purple-400 to-indigo-400',
    badgeBg: 'bg-purple-400/15',
    badgeBorder: 'border-purple-400/35',
    badgeText: 'text-purple-300',
    dotColor: '#C084FC',
  },
};

// Fallback pool of neon/cyber colors for dynamic subject names
const FALLBACK_COLOR_POOL: SubjectColorDefinition[] = [
  {
    hex: '#0066FF',
    gradient: 'from-blue-600 to-cyan-600',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/35',
    badgeText: 'text-blue-400',
    dotColor: '#0066FF',
  },
  {
    hex: '#00D4FF',
    gradient: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/35',
    badgeText: 'text-cyan-400',
    dotColor: '#00D4FF',
  },
  {
    hex: '#00E096',
    gradient: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/35',
    badgeText: 'text-emerald-400',
    dotColor: '#00E096',
  },
  {
    hex: '#A855F7',
    gradient: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/35',
    badgeText: 'text-purple-400',
    dotColor: '#A855F7',
  },
  {
    hex: '#FFB300',
    gradient: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/35',
    badgeText: 'text-amber-400',
    dotColor: '#FFB300',
  },
  {
    hex: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/15',
    badgeBorder: 'border-pink-500/35',
    badgeText: 'text-pink-400',
    dotColor: '#EC4899',
  },
  {
    hex: '#38BDF8',
    gradient: 'from-sky-500 to-cyan-500',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/35',
    badgeText: 'text-sky-400',
    dotColor: '#38BDF8',
  },
];

/**
 * Normalizes subject names for key lookup (e.g. "Operating Systems (CS501)" -> "operating systems")
 */
function normalizeKey(subject: string): string {
  return subject
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // remove (CS501)
    .replace(/\s*lab\b/g, '') // remove lab suffix for base matching
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Retrieves the canonical color definition for any subject.
 * Guarantees that the same subject ALWAYS returns the exact same color.
 */
export function getSubjectColor(subjectNameOrCode?: string): SubjectColorDefinition {
  if (!subjectNameOrCode) {
    return FALLBACK_COLOR_POOL[0];
  }

  const raw = subjectNameOrCode.trim().toLowerCase();

  // 1. Direct key match
  if (SUBJECT_COLOR_PALETTE[raw]) {
    return SUBJECT_COLOR_PALETTE[raw];
  }

  // 2. Normalized key match
  const normalized = normalizeKey(subjectNameOrCode);
  if (SUBJECT_COLOR_PALETTE[normalized]) {
    return SUBJECT_COLOR_PALETTE[normalized];
  }

  // 3. Partial substring match
  for (const [key, color] of Object.entries(SUBJECT_COLOR_PALETTE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return color;
    }
  }

  // 4. Deterministic hash index fallback
  let hash = 0;
  for (let i = 0; i < subjectNameOrCode.length; i++) {
    hash = (hash << 5) - hash + subjectNameOrCode.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_COLOR_POOL.length;
  return FALLBACK_COLOR_POOL[index];
}

/**
 * Returns hex color string for charts
 */
export function getSubjectHexColor(subjectNameOrCode?: string): string {
  return getSubjectColor(subjectNameOrCode).hex;
}
