// ═══════════════════════════════════════════════════════════════════════
// config.js — API Configuration for GYMVex Mobile App
// ═══════════════════════════════════════════════════════════════════════

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── Live Production Backend (Render) ───────────────────────────────────
const PRODUCTION_API_URL = 'https://gymvex-app.onrender.com/api';

const getBaseUrl = () => {
  // 1. Check environment variable override if defined (.env -> EXPO_PUBLIC_API_URL)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Default to live Render backend
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getBaseUrl();
export default API_BASE_URL;
