// ═══════════════════════════════════════════════════════════════════════
// theme/lightTheme.ts — GYMVex Light Theme Object
// ═══════════════════════════════════════════════════════════════════════

import { lightColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { lightShadows } from './shadows';

export const lightTheme = {
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  radius,
  shadows: lightShadows,
};

export type AppTheme = typeof lightTheme;
