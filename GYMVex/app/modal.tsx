import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Close button animation
  const closeScale = useRef(new Animated.Value(1)).current;

  const handleClosePressIn = () => {
    Animated.spring(closeScale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handleClosePressOut = () => {
    Animated.spring(closeScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Pressable
          onPressIn={handleClosePressIn}
          onPressOut={handleClosePressOut}
          onPress={() => router.back()}
        >
          <Animated.View
            style={[styles.closeButton, { transform: [{ scale: closeScale }] }]}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>

      {/* ─── Settings Section ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>

        {/* Notifications Toggle (Switch) */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#CCFF0020' }]}>
              <Ionicons name="notifications-outline" size={18} color="#CCFF00" />
            </View>
            <View>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Workout reminders</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#333333', true: '#CCFF0060' }}
            thumbColor={notificationsEnabled ? '#CCFF00' : '#666666'}
          />
        </View>

        {/* Dark Mode Toggle (Switch) */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#A78BFA20' }]}>
              <Ionicons name="moon-outline" size={18} color="#A78BFA" />
            </View>
            <View>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>Always on</Text>
            </View>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#333333', true: '#A78BFA60' }}
            thumbColor={darkModeEnabled ? '#A78BFA' : '#666666'}
          />
        </View>

        {/* Sound Toggle (Switch) */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="volume-high-outline" size={18} color="#4ECDC4" />
            </View>
            <View>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingSubtitle}>Workout sounds</Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#333333', true: '#4ECDC460' }}
            thumbColor={soundEnabled ? '#4ECDC4' : '#666666'}
          />
        </View>
      </View>

      {/* ─── Action Buttons (Pressable) ──────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="person-outline" size={18} color="#FF6B6B" />
            </View>
            <Text style={styles.settingTitle}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#444444" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#F9731620' }]}>
              <Ionicons name="help-circle-outline" size={18} color="#F97316" />
            </View>
            <Text style={styles.settingTitle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#444444" />
        </Pressable>
      </View>

      {/* ─── Go Home Button (Pressable) ──────────────────────── */}
      <View style={styles.bottomAction}>
        <Pressable
          onPress={() => router.dismissAll()}
          style={({ pressed }) => [
            styles.homeButton,
            {
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Ionicons name="home-outline" size={18} color="#000000" style={{ marginRight: 8 }} />
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionLabel: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  // Settings Rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },

  // Action Rows (Pressable)
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },

  // Bottom action
  bottomAction: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  homeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCFF00',
    height: 52,
    borderRadius: 14,
  },
  homeButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
