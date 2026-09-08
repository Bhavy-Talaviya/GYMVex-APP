// ═══════════════════════════════════════════════════════════════════════
// components/ui/chips.tsx — GYMVex FilterChips Component
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';

export interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  style?: ViewStyle;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onSelect,
  style,
}) => {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? colors.accent : colors.badgeBg,
                borderColor: isSelected ? colors.accent : colors.border,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? colors.accentText : colors.textPrimary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
  },
});
