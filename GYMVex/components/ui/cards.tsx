// ═══════════════════════════════════════════════════════════════════════
// components/ui/cards.tsx — GYMVex Standard Card System
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { Image } from './AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

export interface AppCardProps extends PressableProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  elevated = false,
  style,
  onPress,
  ...rest
}) => {
  const { colors, radius, shadows } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.cardElevated : colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 16,
    ...(elevated ? shadows.card : shadows.soft),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.88 : 1 }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

// Specialized ExerciseCard
export interface ExerciseCardProps {
  title: string;
  muscle: string;
  difficulty: string;
  calories?: number;
  sets?: number;
  image?: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  muscle,
  difficulty,
  calories = 120,
  sets = 4,
  image,
  isFavorite = false,
  onPress,
  onFavoriteToggle,
}) => {
  const { colors, radius, spacing, isDark } = useAppTheme();

  return (
    <AppCard onPress={onPress} style={{ padding: 0, overflow: 'hidden' }}>
      <View style={{ height: 130, width: '100%', position: 'relative' }}>
        <Image
          source={{
            uri:
              image ||
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
          }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.35)' },
          ]}
        />

        {/* Favorite Icon */}
        <Pressable
          onPress={onFavoriteToggle}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: radius.pill,
            padding: 6,
          }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#FF4D4D' : '#FFFFFF'}
          />
        </Pressable>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {muscle} • {difficulty}
        </Text>

        <View style={styles.cardFooterRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="flame" size={13} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.textPrimary }]}>
              {calories} kcal
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="barbell" size={13} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.textPrimary }]}>
              {sets} sets
            </Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

// Specialized StatCard
export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  style,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <AppCard style={[{ flex: 1, padding: spacing.md }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <View style={[styles.iconWrap, { backgroundColor: colors.badgeBg }]}>
          <Ionicons name={icon} size={18} color={colors.accent} />
        </View>
        {trend && (
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
            {trend}
          </Text>
        )}
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>
        {value} {unit ? <Text style={{ fontSize: 13, color: colors.textSecondary }}>{unit}</Text> : null}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </AppCard>
  );
};

// Specialized WorkoutCard
export interface WorkoutCardProps {
  title: string;
  level: string;
  duration: string;
  exercisesCount: number;
  progress: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  level,
  duration,
  exercisesCount,
  progress,
  onPress,
  style,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <AppCard onPress={onPress} style={style}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
        {level} • {duration} • {exercisesCount} exercises
      </Text>

      <View style={{ marginTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>Progress</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>{progress}%</Text>
        </View>
        <View style={{ height: 6, width: '100%', backgroundColor: colors.badgeBg, borderRadius: radius.pill, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: colors.accent, borderRadius: radius.pill }} />
        </View>
      </View>
    </AppCard>
  );
};

// Specialized ProgressCard
export interface ProgressCardProps {
  title: string;
  value: string;
  change?: string;
  period?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  change,
  period = 'This month',
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <AppCard style={[{ flex: 1, padding: spacing.md }, style]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.statValue, { color: colors.textPrimary, marginTop: 4 }]}>{value}</Text>
      {change && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent, marginTop: 4 }}>
          {change} {period ? `• ${period}` : ''}
        </Text>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
