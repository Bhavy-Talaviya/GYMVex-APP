// ═══════════════════════════════════════════════════════════════════════
// components/ui/buttons.tsx — GYMVex Standard Button System
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

export interface ButtonProps extends PressableProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: disabled
            ? colors.badgeBg
            : pressed
            ? colors.accentHover
            : colors.accent,
          borderRadius: radius.button,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.accentText} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={disabled ? colors.textMuted : colors.accentText}
              style={{ marginRight: spacing.xs }}
            />
          )}
          {title && (
            <Text
              style={[
                styles.buttonText,
                { color: disabled ? colors.textMuted : colors.accentText },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={disabled ? colors.textMuted : colors.accentText}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </>
      )}
    </Pressable>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: colors.badgeBg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.medium,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={disabled ? colors.textMuted : colors.textPrimary}
              style={{ marginRight: spacing.xs }}
            />
          )}
          {title && (
            <Text
              style={[
                styles.buttonText,
                { color: disabled ? colors.textMuted : colors.textPrimary },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={disabled ? colors.textMuted : colors.textPrimary}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </>
      )}
    </Pressable>
  );
};

export const OutlineButton: React.FC<ButtonProps> = ({
  title,
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.medium,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={colors.textPrimary}
              style={{ marginRight: spacing.xs }}
            />
          )}
          {title && (
            <Text style={[styles.buttonText, { color: colors.textPrimary }, textStyle]}>
              {title}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
};

export const GhostButton: React.FC<ButtonProps> = ({
  title,
  icon,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: 'transparent',
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={colors.accent}
          style={{ marginRight: spacing.xs }}
        />
      )}
      {title && (
        <Text style={[styles.buttonText, { color: colors.accent }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export interface IconButtonProps extends PressableProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 20,
  color,
  backgroundColor,
  style,
  onPress,
  ...rest
}) => {
  const { colors, radius } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: backgroundColor || colors.badgeBg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.pill,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Ionicons name={icon} size={size} color={color || colors.textPrimary} />
    </Pressable>
  );
};

export const DangerButton: React.FC<ButtonProps> = ({
  title,
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: colors.danger,
          borderRadius: radius.medium,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: spacing.xs }}
            />
          )}
          {title && <Text style={[styles.buttonText, { color: '#FFFFFF' }, textStyle]}>{title}</Text>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
