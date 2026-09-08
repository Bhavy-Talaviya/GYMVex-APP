// ═══════════════════════════════════════════════════════════════════════
// theme/typography.ts — GYMVex Typography Hierarchy
// ═══════════════════════════════════════════════════════════════════════

import { TextStyle } from 'react-native';

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  heavy: '800' as TextStyle['fontWeight'],
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: fontWeights.heavy,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.2,
  },
};

export type Typography = typeof typography;
