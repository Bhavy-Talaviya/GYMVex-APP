// ═══════════════════════════════════════════════════════════════════════
// config.js — API Configuration for GYMVex Mobile App
// ═══════════════════════════════════════════════════════════════════════
// This file stores the base URL for the backend API.
// Change the IP address to your computer's local IP when testing
// on a real device (not localhost).
//
// How to find your local IP:
// - Windows: run "ipconfig" in Command Prompt
// - Mac/Linux: run "ifconfig" in Terminal
// ═══════════════════════════════════════════════════════════════════════

// ─── For Android Emulator: use 10.0.2.2 instead of localhost ────────
// ─── For iOS Simulator: localhost works fine ─────────────────────────
// ─── For real device: use your computer's local IP (e.g., 192.168.1.5)

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── Auto-detect PC IP address based on Expo host ─────────────────────
// Automatically gets your computer's IP (e.g. http://192.168.x.x:5000/api)
// so Expo Go on physical phones, Android emulator, iOS simulator, and Web all work!

const getBaseUrl = () => {
  // 1. Check environment variable override if defined
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
  }

  // 3. Mobile / Expo Go environment (resolves host computer IP)
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants.manifest2?.extra?.expoClient?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5000/api`;
      }
    }
  } catch (e) {
    // fallback if Constants fails
  }

  // 4. Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 5. iOS simulator & localhost fallback
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();
export default API_BASE_URL;



