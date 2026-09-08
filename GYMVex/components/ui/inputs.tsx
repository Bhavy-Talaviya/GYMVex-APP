// ═══════════════════════════════════════════════════════════════════════
// components/ui/inputs.tsx — GYMVex Standard Input Components
// ═══════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors, radius, spacing } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.accent
              : colors.inputBorder,
            borderRadius: radius.input,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? colors.accent : colors.textSecondary}
            style={{ marginRight: spacing.xs }}
          />
        )}

        <TextInput
          style={[
            styles.textInput,
            { color: colors.textPrimary },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          {...rest}
        />

        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Ionicons name={rightIcon} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  containerStyle,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.inputWrapper,
        {
          backgroundColor: colors.inputBg,
          borderColor: colors.inputBorder,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          height: 44,
        },
        containerStyle,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.textSecondary}
        style={{ marginRight: spacing.xs }}
      />
      <TextInput
        style={[styles.textInput, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear && onClear();
          }}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
