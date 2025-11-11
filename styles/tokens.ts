// Design System Tokens
// These tokens extend Tailwind's default configuration

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
} as const;

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

// Animation Durations (ms)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
} as const;

// Transition Timings
export const transitions = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Performance Targets (P95)
export const performanceTargets = {
  // Time to Interactive (ms)
  tti: 3500,
  // First Contentful Paint (ms)
  fcp: 1800,
  // Largest Contentful Paint (ms)
  lcp: 2500,
  // Cumulative Layout Shift
  cls: 0.1,
  // First Input Delay (ms)
  fid: 100,
  // Total Blocking Time (ms)
  tbt: 200,
} as const;

// Network Timeouts (ms)
export const timeouts = {
  debounce: 300,
  throttle: 100,
  autosave: 3000,
  request: 30000,
  longRequest: 60000,
  retry: 1000,
  retryMax: 5000,
} as const;

// Retry/Backoff Configuration
export const retry = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  multiplier: 2,
  jitter: 0.1,
} as const;
