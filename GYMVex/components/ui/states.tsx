// ═══════════════════════════════════════════════════════════════════════
// components/ui/states.tsx — GYMVex Feedback & State Components
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { PrimaryButton } from './buttons';

export interface LoadingViewProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading...',
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.centeredContainer, style]}>
      <ActivityIndicator size="large" color={colors.accent} />
      {message && (
        <Text style={[styles.stateMessage, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export interface EmptyViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionText,
  onActionPress,
  style,
}) => {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View style={[styles.centeredContainer, { padding: spacing.xl }, style]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.badgeBg, borderRadius: radius.pill }]}>
        <Ionicons name={icon} size={36} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      )}
      {actionText && onActionPress && (
        <PrimaryButton
          title={actionText}
          onPress={onActionPress}
          style={{ marginTop: spacing.lg }}
        />
      )}
    </View>
  );
};

export interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  style,
}) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.centeredContainer, { padding: spacing.xl }, style]}>
      <Ionicons name="alert-circle-outline" size={44} color={colors.danger} />
      <Text style={[styles.title, { color: colors.textPrimary, marginTop: spacing.md }]}>
        Unable to Load
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <PrimaryButton
          title="Try Again"
          icon="refresh"
          onPress={onRetry}
          style={{ marginTop: spacing.lg }}
        />
      )}
    </View>
  );
};

// Standard ConfirmationModal Component
export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.border,
            borderRadius: radius.modal,
            padding: spacing.xl,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
          {message}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <PrimaryButton
            title={cancelText}
            onPress={onCancel}
            style={{ flex: 1, backgroundColor: colors.badgeBg }}
            textStyle={{ color: colors.textPrimary }}
          />
          <PrimaryButton
            title={confirmText}
            onPress={onConfirm}
            style={{
              flex: 1,
              backgroundColor: isDanger ? colors.danger : colors.accent,
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  stateMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
});
