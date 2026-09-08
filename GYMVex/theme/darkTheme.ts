// ═══════════════════════════════════════════════════════════════════════
// theme/darkTheme.ts — GYMVex Dark Theme Object
// ═══════════════════════════════════════════════════════════════════════

import { darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { darkShadows } from './shadows';
import { AppTheme } from './lightTheme';

export const darkTheme: AppTheme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  radius,
  shadows: darkShadows,
};
