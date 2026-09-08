// ═══════════════════════════════════════════════════════════════════════
// notificationService.js — Notification Helper & API Service (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Handles Android notification permission requests, Firebase Cloud Messaging (FCM)
// token simulation, backend preference persistence, & offline fallback.
// ═══════════════════════════════════════════════════════════════════════

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { API_BASE_URL } from './config';

// ─── Local In-Memory Preference Fallback for Offline Mode ────────────────
let localNotificationSettings = {
  notificationsEnabled: true,
  reminderTime: '08:00',
  fcmToken: 'fcm_mock_token_gymvex_device_123',
  workoutReminder: true,
  dailyFitnessReminder: true,
  restReminder: true,
  planReminder: true,
  streakReminder: true,
  inactivityReminder: true,
  workoutDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  restDayNotifications: true,
};

// ═══════════════════════════════════════════════════════════════════════
// 1. REQUEST ANDROID NOTIFICATION PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════
export const requestAndroidNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'GYMVex Workout Notification Permission',
          message: 'Enable notifications to receive daily workout reminders, streak alerts, and rest day guidance.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  }
  return true; // Granted by default on older Android versions or iOS
};

// ═══════════════════════════════════════════════════════════════════════
// 2. FETCH NOTIFICATION PREFERENCES (GET /api/notifications/settings)
// ═══════════════════════════════════════════════════════════════════════
export const getNotificationSettings = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    // Graceful offline fallback
  }

  return localNotificationSettings;
};

// ═══════════════════════════════════════════════════════════════════════
// 3. SAVE NOTIFICATION PREFERENCES (POST /api/notifications/settings)
// ═══════════════════════════════════════════════════════════════════════
export const saveNotificationSettings = async (newSettings) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data) {
      localNotificationSettings = { ...localNotificationSettings, ...data.data };
      return data.data;
    }
  } catch (err) {
    // Graceful offline fallback
  }

  localNotificationSettings = { ...localNotificationSettings, ...newSettings };
  return localNotificationSettings;
};

// ═══════════════════════════════════════════════════════════════════════
// 4. TRIGGER FCM / TEST PUSH NOTIFICATION (POST /api/notifications/send-test)
// ═══════════════════════════════════════════════════════════════════════
export const sendTestNotification = async (type = 'workout') => {
  const titles = {
    workout: "🏋️ Time for Today's Workout!",
    daily: '🔥 Daily Fitness Goal Reminder',
    rest: '🌙 Rest & Active Recovery Day',
    plan: '📋 Weekly Plan Progress Check',
    streak: "⚡ Don't Lose Your 5-Day Streak!",
    inactivity: '💪 We Miss You! Get Moving Today',
  };

  const bodies = {
    workout: 'Your Day 1 session is ready! Open GYMVex to begin.',
    daily: 'Stay on track! Check off your workout and stay hydrated.',
    rest: 'Today is a rest day. Focus on 3L water and 8h sleep.',
    plan: 'You are 45% through your Beginner Fat Burner plan!',
    streak: 'Log a workout today to keep your streak burning hot.',
    inactivity: 'It has been 2 days since your last session. Jump back in!',
  };

  const title = titles[type] || titles.workout;
  const body = bodies[type] || bodies.workout;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/notifications/send-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, body }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data && data.success) {
      Alert.alert(title, body, [{ text: 'OK', style: 'default' }]);
      return data;
    }
  } catch (err) {
    // Graceful local delivery fallback
  }

  Alert.alert(title, body, [{ text: 'OK', style: 'default' }]);
  return { success: true, title, body };
};
