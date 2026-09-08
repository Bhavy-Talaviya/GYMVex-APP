// ═══════════════════════════════════════════════════════════════════════
// theme/colors.ts — GYMVex Master Design System Color Tokens
// ═══════════════════════════════════════════════════════════════════════

export const lightColors = {
  // Backgrounds
  backgroundPrimary: '#F8FAFC',    // Modern crisp off-white background
  backgroundSecondary: '#FFFFFF',  // Secondary white background
  card: '#FFFFFF',                 // Pure white card surface
  cardElevated: '#FFFFFF',         // Elevated surface
  
  // Typography
  textPrimary: '#0F172A',          // Deep crisp slate primary text
  textSecondary: '#64748B',        // Muted secondary text
  textMuted: '#94A3B8',            // Subtle caption text
  textDisabled: '#CBD5E1',         // Disabled text
  textInverted: '#FFFFFF',         // Text on accent fills

  // Borders
  border: '#E2E8F0',               // Clean modern border
  borderSubtle: '#F1F5F9',         // Soft border

  // Accent & Brand (Athletic Lime-Green with high contrast)
  accent: '#65A30D',               // Main athletic lime accent
  accentHover: '#4D7C0F',          // Pressed state accent
  accentLight: '#ECFCCB',          // Soft light tint
  accentText: '#FFFFFF',           // Text on accent fill

  // Status & Semantics
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Surfaces & Controls
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  badgeBg: '#F1F5F9',
  badgeText: '#0F172A',
  tabBg: '#FFFFFF',
  tabBorder: '#E2E8F0',
  tabInactive: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.4)',
  shadow: '#0F172A',
};

export const darkColors = {
  // Backgrounds
  backgroundPrimary: '#090A08',    // Deep dark graphite background
  backgroundSecondary: '#10120F',  // Secondary dark background
  card: '#151814',                 // Graphite card surface
  cardElevated: '#1B1E18',         // Elevated graphite surface

  // Typography
  textPrimary: '#F4F3ED',          // Crisp warm white primary text
  textSecondary: '#B4B6AC',        // Secondary slate text
  textMuted: '#777B72',            // Muted text
  textDisabled: '#4A4D46',         // Disabled text
  textInverted: '#090A08',         // Inverted text on accent fills

  // Borders
  border: '#292D25',               // Subtle dark graphite border
  borderSubtle: '#1E211A',         // Soft border

  // Accent & Brand (Sophisticated Muted Lime #B7D94C)
  accent: '#B7D94C',               // Main muted lime accent
  accentHover: '#A0C238',          // Pressed state accent
  accentLight: '#242D11',          // Dark background accent tint
  accentText: '#090A08',           // Text on muted lime fill

  // Status & Semantics
  success: '#22A06B',
  successLight: '#064E3B',
  warning: '#D99000',
  warningLight: '#78350F',
  danger: '#D64545',
  dangerLight: '#7F1D1D',
  info: '#3B82F6',
  infoLight: '#1E3A8A',

  // Surfaces & Controls
  inputBg: '#151814',
  inputBorder: '#292D25',
  badgeBg: '#1B1E18',
  badgeText: '#F4F3ED',
  tabBg: '#10120F',
  tabBorder: '#292D25',
  tabInactive: '#777B72',
  overlay: 'rgba(0, 0, 0, 0.75)',
  shadow: '#000000',
};

export type ThemeColors = typeof lightColors;
