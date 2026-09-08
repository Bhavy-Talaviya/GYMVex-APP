// ═══════════════════════════════════════════════════════════════════════
// components/ui/progress.tsx — GYMVex Progress Components
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  trackColor,
  fillColor,
  style,
}) => {
  const { colors, radius } = useAppTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor || colors.badgeBg,
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: fillColor || colors.accent,
            borderRadius: radius.pill,
          },
        ]}
      />
    </View>
  );
};

export interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  title,
  subtitle,
  style,
}) => {
  const { colors, radius } = useAppTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.circularWrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.badgeBg,
          borderColor: colors.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <View style={styles.centerContent}>
        <Text style={[styles.progressPercentText, { color: colors.textPrimary }]}>
          {Math.round(clampedProgress)}%
        </Text>
        {title && (
          <Text style={[styles.progressTitleText, { color: colors.accent }]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.progressSubText, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  circularWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentText: {
    fontSize: 22,
    fontWeight: '800',
  },
  progressTitleText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  progressSubText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
