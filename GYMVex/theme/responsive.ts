// ═══════════════════════════════════════════════════════════════════════
// theme/responsive.ts — GYMVex Responsive Scaling System
// ═══════════════════════════════════════════════════════════════════════
// Provides mathematical responsive scaling across mobile devices (small 320px
// phones to large phablets and tablets/iPads up to 1024px+).
// Uses a standard mobile baseline: 375 x 812 (iPhone standard / modern Android).
// ═══════════════════════════════════════════════════════════════════════

import { Dimensions, PixelRatio, Platform } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Standard horizontal scale according to current screen width.
 */
export const scale = (size: number): number => {
  const { width } = Dimensions.get('window');
  return Math.round(PixelRatio.roundToNearestPixel((width / BASE_WIDTH) * size));
};

/**
 * Standard vertical scale according to current screen height.
 */
export const verticalScale = (size: number): number => {
  const { height } = Dimensions.get('window');
  return Math.round(PixelRatio.roundToNearestPixel((height / BASE_HEIGHT) * size));
};

/**
 * Moderate scale with configurable damping factor (default 0.5).
 * Ideal for fonts, paddings, margins, and icons so they don't grow too large on tablets
 * or shrink too small on narrow screens.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const { width } = Dimensions.get('window');
  const scaled = size + (((width / BASE_WIDTH) * size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Moderate vertical scale with damping factor.
 */
export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  const { height } = Dimensions.get('window');
  const scaled = size + (((height / BASE_HEIGHT) * size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Device categorization helpers
 */
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  const aspectRatio = maxDimension / minDimension;
  return minDimension >= 600 && aspectRatio < 1.6;
};

export const isSmallDevice = (): boolean => {
  const { width } = Dimensions.get('window');
  return width < 360;
};

export const isLargeDevice = (): boolean => {
  const { width } = Dimensions.get('window');
  return width >= 414;
};

/**
 * Clamped font scaler so fonts stay readable without breaking layouts
 */
export const fontScale = (size: number, minScale = 0.85, maxScale = 1.25): number => {
  const { width } = Dimensions.get('window');
  const rawScale = width / BASE_WIDTH;
  const clampedScale = Math.min(Math.max(rawScale, minScale), maxScale);
  return Math.round(PixelRatio.roundToNearestPixel(size * clampedScale));
};

export const responsive = {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  fontScale,
  isTablet,
  isSmallDevice,
  isLargeDevice,
};

export default responsive;
