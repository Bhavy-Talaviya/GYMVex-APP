// ═══════════════════════════════════════════════════════════════════════
// notification-settings.tsx — Notification & Workout Reminder Settings (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Allows users to configure master notification toggle, reminder time,
// workout reminder days, rest day alerts, and 6 individual reminder types.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  requestAndroidNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  sendTestNotification,
} from '../services/notificationService';
import { useAppTheme } from '@/context/ThemeContext';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_PRESETS = ['07:00', '08:00', '18:00', '20:00'];

export default function NotificationSettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  // State variables with explicit basic types
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Settings states
  const [enabled, setEnabled] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [workoutReminder, setWorkoutReminder] = useState<boolean>(true);
  const [dailyFitnessReminder, setDailyFitnessReminder] = useState<boolean>(true);
  const [restReminder, setRestReminder] = useState<boolean>(true);
  const [planReminder, setPlanReminder] = useState<boolean>(true);
  const [streakReminder, setStreakReminder] = useState<boolean>(true);
  const [inactivityReminder, setInactivityReminder] = useState<boolean>(true);
  const [restDayNotifications, setRestDayNotifications] = useState<boolean>(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  useEffect(() => {
    initNotifications();
  }, []);

  const initNotifications = async () => {
    setLoading(true);
    try {
      // 1. Request Android Permissions
      await requestAndroidNotificationPermission();

      // 2. Load Notification Preferences from Backend
      const settings = await getNotificationSettings();
      if (settings) {
        setEnabled(settings.notificationsEnabled ?? true);
        setReminderTime(settings.reminderTime || '08:00');
        setWorkoutReminder(settings.workoutReminder ?? true);
        setDailyFitnessReminder(settings.dailyFitnessReminder ?? true);
        setRestReminder(settings.restReminder ?? true);
        setPlanReminder(settings.planReminder ?? true);
        setStreakReminder(settings.streakReminder ?? true);
        setInactivityReminder(settings.inactivityReminder ?? true);
        setRestDayNotifications(settings.restDayNotifications ?? true);
        if (settings.workoutDays) setSelectedDays(settings.workoutDays);
      }
    } catch (err) {
      console.error('Error initializing notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle day in workoutDays array
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        Alert.alert('Warning', 'Please select at least one workout reminder day.');
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Sanitize time input to allow ONLY 4 numeric digits (strictly 1 to 24 hours format HH:MM)
  const handleTimeInput = (text: string) => {
    let digits = text.replace(/[^0-9]/g, '').slice(0, 4);

    // Validate hours (01 to 24)
    if (digits.length >= 2) {
      let hh = parseInt(digits.slice(0, 2), 10);
      if (hh > 24) hh = 24;
      const hhStr = hh < 10 ? `0${hh}` : `${hh}`;
      digits = hhStr + digits.slice(2);
    }

    // Validate minutes (00 to 59)
    if (digits.length === 4) {
      let mm = parseInt(digits.slice(2, 4), 10);
      if (mm > 59) mm = 59;
      const mmStr = mm < 10 ? `0${mm}` : `${mm}`;
      digits = digits.slice(0, 2) + mmStr;
    }

    if (digits.length <= 2) {
      setReminderTime(digits);
    } else {
      setReminderTime(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    }
  };

  // Save settings to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNotificationSettings({
        notificationsEnabled: enabled,
        reminderTime,
        workoutReminder,
        dailyFitnessReminder,
        restReminder,
        planReminder,
        streakReminder,
        inactivityReminder,
        restDayNotifications,
        workoutDays: selectedDays,
      });

      Alert.alert(
        'Notification Settings Saved',
        enabled
          ? `✅ Reminders active!\nDaily workout alert scheduled for ${reminderTime} on ${selectedDays.join(', ')}.`
          : '🔕 All workout notifications have been paused.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Failed to save notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const themeColors = {
    bg: colors.backgroundPrimary || colors.bg,
    cardBg: colors.card,
    cardBorder: colors.border,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    subText: colors.textMuted,
    iconBg: isDark ? '#14532D30' : '#DCFCE7',
    iconColor: '#22C55E',
    navBorder: colors.border,
    navBtnBg: isDark ? '#1B1E18' : '#F1F5F9',
    navBtnIcon: colors.textPrimary,
    inputBg: isDark ? '#1B1E18' : '#F8FAFC',
    inputBorder: colors.border,
    inputText: colors.textPrimary,
    chipBg: isDark ? '#1B1E18' : '#F1F5F9',
    chipBorder: colors.border,
    chipText: colors.textSecondary,
    chipActiveBg: '#22C55E',
    chipActiveText: '#FFFFFF',
    masterCardBg: isDark ? '#131F08' : '#F0FDF4',
    masterCardBorder: isDark ? '#29400D' : '#BBF7D0',
    masterIconBg: isDark ? '#263D0C' : '#DCFCE7',
    switchTrackFalse: isDark ? '#2B2B2B' : '#E2E8F0',
    switchTrackTrue: '#22C55E',
    switchThumb: '#FFFFFF',
    btnPrimaryBg: '#22C55E',
    btnPrimaryText: '#FFFFFF',
    testBtnBg: isDark ? '#14532D30' : '#DCFCE7',
    testBtnBorder: isDark ? '#166534' : '#BBF7D0',
    testBtnText: '#22C55E',
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.bg }]}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading Notification Preferences...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: themeColors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: themeColors.navBorder }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: themeColors.navBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={themeColors.navBtnIcon} />
        </Pressable>
        <Text style={[styles.navTitle, { color: themeColors.textPrimary }]}>Notification Settings</Text>
        <Pressable style={[styles.saveHeaderBtn, { backgroundColor: themeColors.btnPrimaryBg }]} onPress={handleSave}>
          <Text style={[styles.saveHeaderBtnText, { color: themeColors.btnPrimaryText }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* ─── 1. Master Toggle Card ────────────────────────────────────── */}
        <View style={[styles.masterCard, { backgroundColor: themeColors.masterCardBg, borderColor: themeColors.masterCardBorder }]}>
          <View style={[styles.masterIconCircle3D, { backgroundColor: isDark ? '#14532D60' : '#DCFCE7', borderColor: isDark ? '#22C55E' : '#86EFAC' }]}>
            <Ionicons name="notifications" size={24} color={isDark ? '#4ADE80' : '#16A34A'} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.masterTitle, { color: themeColors.textPrimary }]}>Allow Notifications</Text>
            <Text style={[styles.masterSub, { color: themeColors.textSecondary }]}>Receive daily reminders & streak updates</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
            thumbColor={themeColors.switchThumb}
          />
        </View>

        {enabled && (
          <>
            {/* ─── 2. Daily Reminder Time Input Card ────────────────────── */}
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon3D, { backgroundColor: isDark ? '#0C4A6E40' : '#E0F2FE', borderColor: isDark ? '#0284C7' : '#BAE6FD' }]}>
                  <Ionicons name="time" size={18} color={isDark ? '#38BDF8' : '#0284C7'} />
                </View>
                <Text style={[styles.cardHeaderTitle, { color: themeColors.textPrimary }]}>Daily Reminder Time</Text>
              </View>
              <Text style={[styles.cardHeaderSub, { color: themeColors.textSecondary }]}>Type 4 digits in 24-hour format (1 to 24 hours, e.g. 0800 or 1830)</Text>

              <TextInput
                style={[
                  styles.timeInputOnly,
                  {
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.textPrimary,
                  },
                ]}
                value={reminderTime}
                onChangeText={handleTimeInput}
                placeholder="08:00"
                placeholderTextColor={themeColors.subText}
                keyboardType="number-pad"
                maxLength={5}
                selectionColor={themeColors.iconColor}
              />
            </View>

            {/* ─── 3. Workout Reminder Days Selector ────────────────────── */}
            <View style={[styles.sectionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon3D, { backgroundColor: isDark ? '#4C1D9540' : '#EDE9FE', borderColor: isDark ? '#8B5CF6' : '#DDD6FE' }]}>
                  <Ionicons name="calendar" size={18} color={isDark ? '#A78BFA' : '#7C3AED'} />
                </View>
                <Text style={[styles.cardHeaderTitle, { color: themeColors.textPrimary }]}>Workout Reminder Days</Text>
              </View>
              <Text style={[styles.cardHeaderSub, { color: themeColors.textSecondary }]}>Select days you want to receive workout reminders</Text>

              <View style={styles.daysGrid}>
                {ALL_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.dayChip,
                        {
                          backgroundColor: isSelected ? themeColors.chipActiveBg : themeColors.chipBg,
                          borderColor: isSelected ? themeColors.chipActiveBg : themeColors.chipBorder,
                        },
                      ]}
                      onPress={() => toggleDay(day)}>
                      <Text style={[styles.dayChipText, { color: isSelected ? themeColors.chipActiveText : themeColors.chipText }]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ─── 4. 6 Specific Reminder Type Switches ─────────────────── */}
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Reminder Categories</Text>

            {/* 1. Workout Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: isDark ? '#22C55E' : '#86EFAC' }]}>
                <Ionicons name="fitness-outline" size={20} color={isDark ? '#4ADE80' : '#16A34A'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Workout Reminder</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Alerts for scheduled workout sessions</Text>
              </View>
              <Switch
                value={workoutReminder}
                onValueChange={setWorkoutReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* 2. Daily Fitness Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#7C2D1240' : '#FFEDD5', borderColor: isDark ? '#EA580C' : '#FED7AA' }]}>
                <Ionicons name="flame-outline" size={20} color={isDark ? '#FB923C' : '#EA580C'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Daily Fitness Reminder</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Encouraging daily activity & hydration tips</Text>
              </View>
              <Switch
                value={dailyFitnessReminder}
                onValueChange={setDailyFitnessReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* 3. Rest Day Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#312E8140' : '#EEF2FF', borderColor: isDark ? '#6366F1' : '#C7D2FE' }]}>
                <Ionicons name="moon-outline" size={20} color={isDark ? '#818CF8' : '#4F46E5'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Rest Day Reminder</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Recovery, mobility stretching & sleep alerts</Text>
              </View>
              <Switch
                value={restReminder}
                onValueChange={setRestReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* 4. Plan Progress Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#134E4A40' : '#CCFBF1', borderColor: isDark ? '#14B8A6' : '#99F6E4' }]}>
                <Ionicons name="journal-outline" size={20} color={isDark ? '#2DD4BF' : '#0D9488'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Plan Progress Reminder</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Weekly completion & goal milestone updates</Text>
              </View>
              <Switch
                value={planReminder}
                onValueChange={setPlanReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* 5. Streak Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#78350F40' : '#FEF3C7', borderColor: isDark ? '#F59E0B' : '#FDE68A' }]}>
                <Ionicons name="trophy-outline" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Streak Shield Reminder</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Warns before your workout streak breaks</Text>
              </View>
              <Switch
                value={streakReminder}
                onValueChange={setStreakReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* 6. Inactivity Reminder */}
            <View style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
              <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#88133740' : '#FFE4E6', borderColor: isDark ? '#F43F5E' : '#FECDD3' }]}>
                <Ionicons name="alarm-outline" size={20} color={isDark ? '#FB7185' : '#E11D48'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Inactivity Alert</Text>
                <Text style={[styles.settingSub, { color: themeColors.textSecondary }]}>Notifies after 2 days of inactivity</Text>
              </View>
              <Switch
                value={inactivityReminder}
                onValueChange={setInactivityReminder}
                trackColor={{ false: themeColors.switchTrackFalse, true: themeColors.switchTrackTrue }}
                thumbColor={themeColors.switchThumb}
              />
            </View>

            {/* ─── 5. Test Push Notification Section ────────────────────── */}
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Test Push Notifications (FCM)</Text>
            <Text style={[styles.cardHeaderSub, { color: themeColors.textSecondary, marginBottom: 10 }]}>
              Tap any category below to immediately preview and trigger its push alert on your device.
            </Text>

            <View style={styles.testGridRow}>
              {/* 1. Workout */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: isDark ? '#22C55E' : '#86EFAC' }]}
                onPress={() => sendTestNotification('workout')}>
                <Ionicons name="barbell-outline" size={16} color={isDark ? '#4ADE80' : '#16A34A'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#4ADE80' : '#16A34A' }]}>Workout Alert</Text>
              </Pressable>

              {/* 2. Daily Fitness */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#7C2D1240' : '#FFEDD5', borderColor: isDark ? '#EA580C' : '#FED7AA' }]}
                onPress={() => sendTestNotification('daily')}>
                <Ionicons name="flame-outline" size={16} color={isDark ? '#FB923C' : '#EA580C'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#FB923C' : '#EA580C' }]}>Daily Fitness</Text>
              </Pressable>
            </View>

            <View style={styles.testGridRow}>
              {/* 3. Rest Day */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#312E8140' : '#EEF2FF', borderColor: isDark ? '#6366F1' : '#C7D2FE' }]}
                onPress={() => sendTestNotification('rest')}>
                <Ionicons name="moon-outline" size={16} color={isDark ? '#818CF8' : '#4F46E5'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#818CF8' : '#4F46E5' }]}>Rest Day</Text>
              </Pressable>

              {/* 4. Plan Progress */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#134E4A40' : '#CCFBF1', borderColor: isDark ? '#14B8A6' : '#99F6E4' }]}
                onPress={() => sendTestNotification('plan')}>
                <Ionicons name="journal-outline" size={16} color={isDark ? '#2DD4BF' : '#0D9488'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#2DD4BF' : '#0D9488' }]}>Plan Progress</Text>
              </Pressable>
            </View>

            <View style={styles.testGridRow}>
              {/* 5. Streak */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#78350F40' : '#FEF3C7', borderColor: isDark ? '#F59E0B' : '#FDE68A' }]}
                onPress={() => sendTestNotification('streak')}>
                <Ionicons name="trophy-outline" size={16} color={isDark ? '#FBBF24' : '#D97706'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#FBBF24' : '#D97706' }]}>Streak Shield</Text>
              </Pressable>

              {/* 6. Inactivity */}
              <Pressable
                style={[styles.testGridItem, { backgroundColor: isDark ? '#88133740' : '#FFE4E6', borderColor: isDark ? '#F43F5E' : '#FECDD3' }]}
                onPress={() => sendTestNotification('inactivity')}>
                <Ionicons name="alarm-outline" size={16} color={isDark ? '#FB7185' : '#E11D48'} style={{ marginRight: 6 }} />
                <Text style={[styles.testGridText, { color: isDark ? '#FB7185' : '#E11D48' }]}>Inactivity Alert</Text>
              </Pressable>
            </View>

            {/* Save Preferences Button */}
            {saving ? (
              <ActivityIndicator color={themeColors.iconColor} size="large" style={{ marginVertical: 20 }} />
            ) : (
              <Pressable style={[styles.saveBtn, { backgroundColor: themeColors.btnPrimaryBg }]} onPress={handleSave}>
                <Text style={[styles.saveBtnText, { color: themeColors.btnPrimaryText }]}>Save Notification Preferences</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#888888',
    marginTop: 10,
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginBottom: 14,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#141414',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  saveHeaderBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131F08',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#29400D',
    marginBottom: 16,
  },
  masterIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#263D0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterIconCircle3D: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  masterTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  masterSub: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIcon3D: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardHeaderSub: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  timeInputOnly: {
    backgroundColor: '#182405',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: '#364D0C',
    width: '100%',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayChipSelected: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  dayChipText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#182405',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconWrap3D: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    color: '#777777',
    fontSize: 11,
    marginTop: 2,
  },
  testGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  testGridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  testGridText: {
    fontSize: 12,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
