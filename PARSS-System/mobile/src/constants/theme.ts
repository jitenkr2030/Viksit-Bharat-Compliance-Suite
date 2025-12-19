// Color Constants
export const COLORS = {
  // Primary Colors
  primary: '#2563EB', // Blue-600
  primaryLight: '#3B82F6', // Blue-500
  primaryDark: '#1D4ED8', // Blue-700
  primaryGradient: ['#3B82F6', '#1D4ED8'],

  // Secondary Colors
  secondary: '#64748B', // Slate-500
  secondaryLight: '#94A3B8', // Slate-400
  secondaryDark: '#475569', // Slate-600

  // Accent Colors
  accent: '#10B981', // Emerald-500
  accentLight: '#34D399', // Emerald-400
  accentDark: '#059669', // Emerald-600

  // Status Colors
  success: '#10B981', // Green-500
  successLight: '#A7F3D0', // Green-200
  successDark: '#047857', // Green-700

  warning: '#F59E0B', // Amber-500
  warningLight: '#FDE68A', // Amber-200
  warningDark: '#D97706', // Amber-600

  error: '#EF4444', // Red-500
  errorLight: '#FECACA', // Red-200
  errorDark: '#DC2626', // Red-600

  info: '#3B82F6', // Blue-500
  infoLight: '#BFDBFE', // Blue-200
  infoDark: '#1D4ED8', // Blue-700

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Gray Scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Surface Colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  surfaceTertiary: '#F3F4F6',

  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Text Colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Council Colors
  regulatory: '#3B82F6', // Blue
  standards: '#8B5CF6', // Purple
  accreditation: '#F59E0B', // Amber
  alerts: '#EF4444', // Red

  // Compliance Colors
  compliant: '#10B981',
  needsImprovement: '#F59E0B',
  nonCompliant: '#EF4444',
  pending: '#6B7280',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  overlayDark: 'rgba(0, 0, 0, 0.75)',
};

// Font Sizes
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

// Font Weights
export const FONT_WEIGHT = {
  thin: '100',
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Font Families
export const FONT_FAMILY = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  light: 'System',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Opacity
export const OPACITY = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

// Z-Index
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  slowest: 1000,
};

// Animation Easing
export const ANIMATION_EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
};

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Device Sizes
export const DEVICE = {
  width: '100%',
  height: '100%',
};

// Status Bar
export const STATUS_BAR = {
  height: 24,
  backgroundColor: COLORS.primary,
  barStyle: 'light-content' as const,
};

// Tab Bar
export const TAB_BAR = {
  height: 60,
  backgroundColor: COLORS.white,
  activeTintColor: COLORS.primary,
  inactiveTintColor: COLORS.gray500,
};

// Header
export const HEADER = {
  height: 56,
  backgroundColor: COLORS.primary,
  titleColor: COLORS.white,
  backButtonColor: COLORS.white,
};

// Drawer
export const DRAWER = {
  width: 280,
  backgroundColor: COLORS.white,
};

// Form
export const FORM = {
  inputHeight: 48,
  inputBorderRadius: BORDER_RADIUS.base,
  labelFontSize: FONT_SIZE.sm,
  errorFontSize: FONT_SIZE.xs,
  helpFontSize: FONT_SIZE.xs,
};

// Button
export const BUTTON = {
  height: 48,
  borderRadius: BORDER_RADIUS.base,
  fontSize: FONT_SIZE.base,
  fontWeight: FONT_WEIGHT.medium,
};

// Card
export const CARD = {
  borderRadius: BORDER_RADIUS.lg,
  padding: SPACING.base,
  margin: SPACING.sm,
  backgroundColor: COLORS.white,
};

// List
export const LIST = {
  itemHeight: 60,
  separatorHeight: 1,
  separatorColor: COLORS.border,
};

// Avatar
export const AVATAR = {
  size: {
    xs: 24,
    sm: 32,
    base: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
};

// Icon
export const ICON = {
  size: {
    xs: 12,
    sm: 16,
    base: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
};

// Badge
export const BADGE = {
  height: 20,
  paddingHorizontal: 8,
  fontSize: FONT_SIZE.xs,
  borderRadius: BORDER_RADIUS.full,
};

// Progress
export const PROGRESS = {
  height: 8,
  borderRadius: BORDER_RADIUS.full,
  backgroundColor: COLORS.gray200,
};

// Divider
export const DIVIDER = {
  height: 1,
  backgroundColor: COLORS.border,
};

// Modal
export const MODAL = {
  overlayOpacity: OPACITY[50],
  borderRadius: BORDER_RADIUS.lg,
};

// Toast
export const TOAST = {
  height: 50,
  borderRadius: BORDER_RADIUS.base,
  fontSize: FONT_SIZE.base,
  backgroundColor: COLORS.gray800,
  color: COLORS.white,
};