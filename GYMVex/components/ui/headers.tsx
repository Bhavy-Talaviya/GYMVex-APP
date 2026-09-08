// ═══════════════════════════════════════════════════════════════════════
// components/ui/headers.tsx — GYMVex Header System
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.headerRow, { paddingHorizontal: spacing.screenPaddingHorizontal }, style]}>
      {showBack && (
        <Pressable
          onPress={onBackPress || (() => router.back())}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.badgeBg, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>

      {rightAction}
    </View>
  );
};

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.sectionHeaderRow, { marginBottom: spacing.md }, style]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {actionText && (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={[styles.actionText, { color: colors.accent }]}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
