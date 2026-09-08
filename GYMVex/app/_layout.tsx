// ═══════════════════════════════════════════════════════════════════════
// _layout.tsx — Root Layout with Global Theme Provider (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Wraps all app screens with ThemeProvider so light/dark mode applies everywhere.
// Default theme is LIGHT mode (crisp white background).
// ═══════════════════════════════════════════════════════════════════════

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Import global theme context and custom hook
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Inner Root component that subscribes to global theme state
function RootLayoutContent() {
  const { isDark } = useAppTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StackScreenNavigator isDark={isDark} />
      {/* Set status bar text: 'dark' icons on light bg, 'light' icons on dark bg */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

// Stack navigator containing all app routes
function StackScreenNavigator({ isDark }: { isDark: boolean }) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercise-details" options={{ headerShown: false }} />
      <Stack.Screen name="plan-details" options={{ headerShown: false }} />
      <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
      <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

// Root export wrapping the app with ThemeProvider
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
