// ═══════════════════════════════════════════════════════════════════════
// ThemeContext.tsx — Global App Theme Provider (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Standardized Theme Provider exposing design tokens from the theme/ directory.
// Provides reactive updates for colors, typography, spacing, radius, shadows, and actions.
// ═══════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getUserProfileData, updateUserProfileData } from '../services/userProfileApi';
import {
  lightColors,
  darkColors,
  typography,
  spacing,
  radius,
  lightShadows,
  darkShadows,
  lightTheme,
  darkTheme,
  AppTheme,
  ThemeColors,
} from '../theme';

// Backwards-compatible themeColors alias linking directly to centralized theme tokens
export const themeColors = {
  light: {
    ...lightColors,
    bg: lightColors.backgroundPrimary,
    cardBg: lightColors.card,
    cardBorder: lightColors.border,
    textPrimary: lightColors.textPrimary,
    textSecondary: lightColors.textSecondary,
    textSubtle: lightColors.textMuted,
    accent: lightColors.accent,
    accentDark: lightColors.accentHover,
    accentText: lightColors.accentText,
    inputBg: lightColors.inputBg,
    inputBorder: lightColors.inputBorder,
    navBg: lightColors.backgroundSecondary,
    navBorder: lightColors.border,
    iconColor: lightColors.textSecondary,
    iconBg: lightColors.badgeBg,
    badgeBg: lightColors.badgeBg,
    badgeBorder: lightColors.border,
    badgeText: lightColors.badgeText,
    tabBg: lightColors.tabBg,
    tabBorder: lightColors.tabBorder,
    tabInactive: lightColors.tabInactive,
    statCardBg: lightColors.card,
    drawerBg: lightColors.backgroundSecondary,
    shadowColor: lightColors.shadow,
  },
  dark: {
    ...darkColors,
    bg: darkColors.backgroundPrimary,
    cardBg: darkColors.card,
    cardBorder: darkColors.border,
    textPrimary: darkColors.textPrimary,
    textSecondary: darkColors.textSecondary,
    textSubtle: darkColors.textMuted,
    accent: darkColors.accent,
    accentDark: darkColors.accentHover,
    accentText: darkColors.accentText,
    inputBg: darkColors.inputBg,
    inputBorder: darkColors.inputBorder,
    navBg: darkColors.backgroundSecondary,
    navBorder: darkColors.border,
    iconColor: darkColors.textSecondary,
    iconBg: darkColors.badgeBg,
    badgeBg: darkColors.badgeBg,
    badgeBorder: darkColors.border,
    badgeText: darkColors.badgeText,
    tabBg: darkColors.tabBg,
    tabBorder: darkColors.tabBorder,
    tabInactive: darkColors.tabInactive,
    statCardBg: darkColors.card,
    drawerBg: darkColors.backgroundSecondary,
    shadowColor: darkColors.shadow,
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof themeColors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof lightShadows;
  themeTokens: AppTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// 1. Create Theme Context with default light theme values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: themeColors.light,
  typography,
  spacing,
  radius,
  shadows: lightShadows,
  themeTokens: lightTheme,
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

// 2. Global ThemeProvider Component to wrap application root layout
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  // App is set to Light mode by default, syncs with saved user profile preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const profile = await getUserProfileData();
        if (profile && (profile.theme === 'dark' || profile.theme === 'light')) {
          setTheme(profile.theme);
        }
      } catch (e) {}
    };
    loadThemePreference();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setTheme(mode);
    try {
      await updateUserProfileData({ theme: mode });
    } catch (e) {}
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;
  const shadows = isDark ? darkShadows : lightShadows;
  const themeTokens = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        typography,
        spacing,
        radius,
        shadows,
        themeTokens,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Custom hook for easy access to theme tokens in all screens & components
export const useAppTheme = () => useContext(ThemeContext);
