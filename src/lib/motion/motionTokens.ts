/**
 * Campus OS Global Motion System Tokens
 * Standardized durations, easings, and stagger delays for consistent 3D animations.
 */

export const MOTION_DURATIONS = {
  INSTANT: 0,
  FAST: 150, // Micro-interactions (clicks, active states)
  NORMAL: 280, // Hover transitions, dropdowns, tabs
  SMOOTH: 420, // Modals, drawers, card tilts
  SLOW: 650, // Staggered page entrances, chart draws
  AMBIENT: 12000, // Background breathing orbs
} as const;

export const MOTION_EASINGS = {
  // Snappy spring with pleasant overshoot for interactive elements
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Ultra-smooth decelerate for page entrances & drawers
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Snappy response for button press & toggles
  snappy: 'cubic-bezier(0.2, 0, 0, 1)',
  // Soft ease for ambient background glows
  soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const STAGGER_DELAYS = {
  1: '0.05s',
  2: '0.10s',
  3: '0.15s',
  4: '0.20s',
  5: '0.25s',
  6: '0.30s',
} as const;
