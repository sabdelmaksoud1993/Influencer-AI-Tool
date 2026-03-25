// Always use the live Vercel API — same backend for web and mobile
export const API_BASE_URL = 'https://www.myglowpass.com';

export const COLORS = {
  primary: '#EC4899',       // Pink (matches web)
  primaryDark: '#DB2777',
  primaryLight: '#F472B6',
  secondary: '#1a1a2e',     // Dark purple
  background: '#0f0a1a',    // Deep dark purple
  surface: '#1a1230',
  surfaceLight: '#251e3f',
  surfaceLighter: '#2d2650',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  border: '#2d2545',
  borderLight: '#3d3565',
  card: '#1e1535',
  gold: '#FFD700',
  goldDark: '#B8860B',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  cyan: '#06B6D4',
};

export const GRADIENTS = {
  primary: ['#EC4899', '#DB2777'] as const,
  pink: ['#EC4899', '#e91e8c'] as const,
  pinkPurple: ['#EC4899', '#8B5CF6'] as const,
  purplePink: ['#8B5CF6', '#EC4899'] as const,
  gold: ['#FFD700', '#F59E0B'] as const,
  goldShimmer: ['#FFD700', '#FFA500', '#FFD700'] as const,
  glass: ['rgba(30, 21, 53, 0.8)', 'rgba(15, 10, 26, 0.9)'] as const,
  glassLight: ['rgba(45, 37, 69, 0.6)', 'rgba(30, 21, 53, 0.8)'] as const,
  surface: ['#1a1230', '#0f0a1a'] as const,
  ambient: ['rgba(236, 72, 153, 0.15)', 'rgba(139, 92, 246, 0.1)', 'transparent'] as const,
  success: ['#10B981', '#059669'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
  xp: ['#06B6D4', '#8B5CF6', '#EC4899'] as const,
  streak: ['#F59E0B', '#EF4444'] as const,
};

export const GLASS = {
  background: 'rgba(30, 21, 53, 0.6)',
  backgroundLight: 'rgba(45, 37, 69, 0.4)',
  border: 'rgba(236, 72, 153, 0.15)',
  borderActive: 'rgba(236, 72, 153, 0.3)',
  overlay: 'rgba(15, 10, 26, 0.7)',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  gold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const GAMIFICATION = {
  tiers: {
    new: { label: 'New', icon: '○', color: '#9CA3AF', xpRequired: 0 },
    innerCircle: { label: 'Inner Circle', icon: '◆', color: '#8B5CF6', xpRequired: 500 },
    muse: { label: 'Muse', icon: '✦', color: '#FFD700', xpRequired: 1500 },
  },
  xpValues: {
    eventAttended: 50,
    contentSubmitted: 30,
    contentVerified: 20,
    streakDay: 10,
    firstEvent: 100,
  },
  streakMilestones: [3, 7, 14, 30, 60, 90],
  achievements: [
    { id: 'first_event', label: 'First Event', icon: '🎪', description: 'Attend your first event' },
    { id: 'content_creator', label: 'Content Creator', icon: '📸', description: 'Submit 5 content proofs' },
    { id: 'streak_7', label: 'Week Warrior', icon: '🔥', description: '7-day streak' },
    { id: 'streak_30', label: 'Monthly Maven', icon: '⚡', description: '30-day streak' },
    { id: 'inner_circle', label: 'Inner Circle', icon: '◆', description: 'Reach Inner Circle tier' },
    { id: 'muse', label: 'Muse Status', icon: '✦', description: 'Reach Muse tier' },
    { id: 'five_stars', label: 'Five Star', icon: '⭐', description: 'Get 5-star reliability' },
    { id: 'social_butterfly', label: 'Social Butterfly', icon: '🦋', description: 'Attend 10 events' },
    { id: 'vip', label: 'VIP Access', icon: '👑', description: 'Get accepted to 3 exclusive events' },
    { id: 'globe_trotter', label: 'Globe Trotter', icon: '🌍', description: 'Events in 3+ cities' },
  ],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
