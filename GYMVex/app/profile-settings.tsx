// ═══════════════════════════════════════════════════════════════════════
// profile-settings.tsx — Profile & Settings System (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Features:
// - User Profile (Gallery Photo Picker, Avatar Selection, Name, Email, Metrics)
// - Edit Profile Modal with Device Gallery Image Picker
// - App Settings (Theme, Units kg/lbs & cm/ft, Notifications, Privacy, Account)
// - Destructive Account Deletion with confirmation dialog
// - Secure Session Logout with confirmation dialog
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  getUserProfileData,
  updateUserProfileData,
  deleteUserAccountApi,
  logoutUserApi,
  getCurrentUserSession,
  ATHLETIC_AVATARS,
} from '../services/userProfileApi';
import { useAppTheme } from '../context/ThemeContext';

// Combined Preset Avatar Images (Men and Women)
const AVATAR_PRESETS = [
  ...ATHLETIC_AVATARS.MEN,
  ...ATHLETIC_AVATARS.WOMEN,
];

// Constant Choice Arrays for Pickers
const GOALS = ['Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness', 'Flexibility', 'Yoga'];
const ACTIVITY_LEVELS = ['Sedentary', 'Light', 'Moderate', 'Very Active'];
const EXPERIENCES = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfileSettingsScreen() {
  const router = useRouter();

  // State Management
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Profile Information States
  const [profileImage, setProfileImage] = useState<string>(AVATAR_PRESETS[0]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [height, setHeight] = useState<number>(175);
  const [heightUnit, setHeightUnit] = useState<string>('cm');
  const [weight, setWeight] = useState<number>(75.0);
  const [targetWeight, setTargetWeight] = useState<number>(70.0);
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  const [fitnessGoal, setFitnessGoal] = useState<string>('Weight Loss');
  const [activityLevel, setActivityLevel] = useState<string>('Moderate');
  const [experience, setExperience] = useState<string>('Beginner');

  // Global App Theme Hook (Default is Light mode)
  const { theme, isDark, colors, setThemeMode } = useAppTheme();

  // Modals Visibility
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState<boolean>(false);

  // Temporary Edit State inside Edit Profile Modal
  const [editImage, setEditImage] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editHeight, setEditHeight] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editTargetWeight, setEditTargetWeight] = useState<string>('');
  const [editGoal, setEditGoal] = useState<string>('');
  const [editActivity, setEditActivity] = useState<string>('');
  const [editExp, setEditExp] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const session = await getCurrentUserSession();
      if (session) {
        if (session.name) setName(session.name);
        if (session.email) setEmail(session.email);
        if (session.profileImage) setProfileImage(session.profileImage);
      }
      const data = await getUserProfileData();
      if (data) {
        setProfileImage(data.profileImage || session?.profileImage || AVATAR_PRESETS[0]);
        setName(session?.name || data.name || 'Athlete');
        setEmail(session?.email || data.email || '');
        setHeight(data.height || 175);
        setHeightUnit(data.heightUnit || 'cm');
        setWeight(data.weight || 75.0);
        setTargetWeight(data.targetWeight || 70.0);
        setWeightUnit(data.weightUnit || 'kg');
        setFitnessGoal(data.fitnessGoal || 'Weight Loss');
        setActivityLevel(data.activityLevel || 'Moderate');
        setExperience(data.experience || 'Beginner');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Profile Modal with prefilled current data
  const openEditModal = () => {
    setEditImage(profileImage);
    setEditName(name);
    setEditEmail(email);
    setEditHeight(String(height));
    setEditWeight(String(weight));
    setEditTargetWeight(String(targetWeight));
    setEditGoal(fitnessGoal);
    setEditActivity(activityLevel);
    setEditExp(experience);
    setEditModalVisible(true);
  };

  // Pick Custom Image from Device Gallery
  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Permission to access your photo gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setEditImage(selectedUri);
      }
    } catch (err) {
      console.error('Error selecting image from gallery:', err);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  // Save Edit Profile Modal changes
  const saveProfileEdits = async () => {
    setSaving(true);
    const updated = {
      profileImage: editImage || profileImage,
      name: editName,
      email: editEmail,
      height: parseFloat(editHeight) || height,
      weight: parseFloat(editWeight) || weight,
      targetWeight: parseFloat(editTargetWeight) || targetWeight,
      fitnessGoal: editGoal,
      activityLevel: editActivity,
      experience: editExp,
    };

    try {
      await updateUserProfileData(updated);
      setProfileImage(updated.profileImage);
      setName(updated.name);
      setEmail(updated.email);
      setHeight(updated.height);
      setWeight(updated.weight);
      setTargetWeight(updated.targetWeight);
      setFitnessGoal(updated.fitnessGoal);
      setActivityLevel(updated.activityLevel);
      setExperience(updated.experience);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile edits:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Weight Unit (kg <-> lbs)
  const toggleWeightUnit = async (unit: string) => {
    setWeightUnit(unit);
    await updateUserProfileData({ weightUnit: unit });
  };

  // Toggle Height Unit (cm <-> ft)
  const toggleHeightUnit = async (unit: string) => {
    setHeightUnit(unit);
    await updateUserProfileData({ heightUnit: unit });
  };

  // Switch global App Theme ('light' or 'dark')
  const toggleTheme = async (wantDark: boolean) => {
    await setThemeMode(wantDark ? 'dark' : 'light');
  };

  // Confirm and Logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your GYMVex account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUserApi();
            router.replace('/');
          },
        },
      ]
    );
  };

  // Confirm and Permanently Delete Account (Destructive Action)
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account Permanently',
      'This action CANNOT be undone. All your workout history, progress data, and settings will be permanently erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserAccountApi();
              Alert.alert('Account Deleted', 'Your account has been deleted permanently.', [
                { text: 'OK', onPress: () => router.replace('/') },
              ]);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  const themeColors = {
    bg: colors.backgroundPrimary,
    cardBg: colors.card,
    cardBorder: colors.border,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    subText: colors.textMuted,
    iconBg: isDark ? '#14532D30' : '#DCFCE7',
    iconColor: '#22C55E',
    navBorder: colors.border,
    navBtnBg: colors.badgeBg,
    navBtnIcon: colors.textPrimary,
    unitBg: isDark ? '#1B1E18' : '#F1F5F9',
    unitBorder: colors.border,
    unitPillActive: '#22C55E',
    unitPillTextActive: '#FFFFFF',
    unitPillTextInactive: colors.textSecondary,
    badgeBg: isDark ? '#1B1E18' : '#F1F5F9',
    badgeText: colors.textPrimary,
    logoutBg: colors.card,
    logoutBorder: colors.border,
    logoutText: '#22C55E',
    modalOverlay: colors.overlay,
    modalBg: colors.card,
    modalBorder: colors.border,
    inputBg: colors.inputBg,
    inputBorder: colors.inputBorder,
    inputText: colors.textPrimary,
    chipBg: isDark ? '#1B1E18' : '#F1F5F9',
    chipBorder: colors.border,
    chipText: colors.textSecondary,
    chipActiveBg: '#22C55E',
    chipActiveText: '#FFFFFF',
    privacyText: colors.textSecondary,
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.bg }]}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading Profile & Settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: themeColors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Top Header Bar */}
      <View style={[styles.navBar, { borderBottomColor: themeColors.navBorder }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: themeColors.navBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={themeColors.navBtnIcon} />
        </Pressable>
        <Text style={[styles.navTitle, { color: themeColors.textPrimary }]}>Profile & Settings</Text>
        <Pressable style={[styles.editHeaderBtn, { backgroundColor: themeColors.unitPillActive }]} onPress={openEditModal}>
          <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={[styles.editHeaderBtnText, { color: '#FFFFFF' }]}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ─── 1. User Profile Header Card ───────────────────────────── */}
        <View style={[styles.profileHeaderCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
          <Pressable style={{ position: 'relative' }} onPress={openEditModal}>
            <Image source={{ uri: profileImage }} style={[styles.profileAvatar, { borderColor: themeColors.iconColor }]} />
            <View style={[styles.avatarEditBadge, { backgroundColor: themeColors.iconColor }]}>
              <Ionicons name="camera" size={12} color="#FFFFFF" />
            </View>
          </Pressable>
          <View style={styles.profileInfoWrap}>
            <Text style={[styles.profileName, { color: themeColors.textPrimary }]}>{name}</Text>
            <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>{email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badgePill, { backgroundColor: themeColors.badgeBg }]}>
                <Text style={[styles.badgePillText, { color: themeColors.badgeText }]}>{experience}</Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: isDark ? '#14532D' : '#DCFCE7' }]}>
                <Text style={[styles.badgePillText, { color: '#22C55E' }]}>{fitnessGoal}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 2. Personal Fitness Details Grid ──────────────────────── */}
        <Text style={[styles.sectionHeaderTitle, { color: themeColors.textPrimary }]}>Personal Metrics</Text>
        <View style={styles.metricsGrid}>
          {/* Height */}
          <View style={[styles.metricBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
            <View style={[styles.metricIconWrap3D, { backgroundColor: isDark ? '#0C4A6E40' : '#E0F2FE', borderColor: isDark ? '#0284C7' : '#BAE6FD' }]}>
              <Ionicons name="resize-outline" size={20} color={isDark ? '#38BDF8' : '#0284C7'} />
            </View>
            <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{height} {heightUnit}</Text>
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Height</Text>
          </View>

          {/* Weight */}
          <View style={[styles.metricBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
            <View style={[styles.metricIconWrap3D, { backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: isDark ? '#22C55E' : '#BBF7D0' }]}>
              <Ionicons name="scale-outline" size={20} color={isDark ? '#4ADE80' : '#16A34A'} />
            </View>
            <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{weight} {weightUnit}</Text>
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Weight</Text>
          </View>

          {/* Target Weight */}
          <View style={[styles.metricBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
            <View style={[styles.metricIconWrap3D, { backgroundColor: isDark ? '#7C2D1240' : '#FFEDD5', borderColor: isDark ? '#EA580C' : '#FED7AA' }]}>
              <Ionicons name="flag-outline" size={20} color={isDark ? '#FB923C' : '#EA580C'} />
            </View>
            <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{targetWeight} {weightUnit}</Text>
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Target Weight</Text>
          </View>

          {/* Activity Level */}
          <View style={[styles.metricBox, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
            <View style={[styles.metricIconWrap3D, { backgroundColor: isDark ? '#4C1D9540' : '#EDE9FE', borderColor: isDark ? '#8B5CF6' : '#DDD6FE' }]}>
              <Ionicons name="pulse-outline" size={20} color={isDark ? '#A78BFA' : '#7C3AED'} />
            </View>
            <Text
              style={[styles.metricValue, { color: themeColors.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {activityLevel}
            </Text>
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Activity Level</Text>
          </View>
        </View>

        {/* ─── 3. App Settings Section ────────────────────────────────── */}
        <Text style={[styles.sectionHeaderTitle, { color: themeColors.textPrimary }]}>App Settings</Text>

        {/* Units Preference (kg/lbs & cm/ft) */}
        <View style={[styles.settingCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}>
          <View style={styles.settingHeaderRow}>
            <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#134E4A40' : '#CCFBF1', borderColor: isDark ? '#14B8A6' : '#99F6E4', marginRight: 12 }]}>
              <Ionicons name="options-outline" size={20} color={isDark ? '#2DD4BF' : '#0D9488'} />
            </View>
            <Text style={[styles.settingCardTitle, { color: themeColors.textPrimary }]}>Units Preference</Text>
          </View>

          {/* Weight Unit Switch (kg vs lbs) */}
          <View style={styles.unitRow}>
            <Text style={[styles.unitRowLabel, { color: themeColors.textSecondary }]}>Weight Unit</Text>
            <View style={[styles.unitPillContainer, { backgroundColor: themeColors.unitBg, borderColor: themeColors.unitBorder }]}>
              <Pressable
                style={[styles.unitPill, weightUnit === 'kg' && { backgroundColor: themeColors.unitPillActive }]}
                onPress={() => toggleWeightUnit('kg')}>
                <Text style={[styles.unitPillText, weightUnit === 'kg' ? { color: themeColors.unitPillTextActive } : { color: themeColors.unitPillTextInactive }]}>kg</Text>
              </Pressable>
              <Pressable
                style={[styles.unitPill, weightUnit === 'lbs' && { backgroundColor: themeColors.unitPillActive }]}
                onPress={() => toggleWeightUnit('lbs')}>
                <Text style={[styles.unitPillText, weightUnit === 'lbs' ? { color: themeColors.unitPillTextActive } : { color: themeColors.unitPillTextInactive }]}>lbs</Text>
              </Pressable>
            </View>
          </View>

          {/* Height Unit Switch (cm vs ft) */}
          <View style={[styles.unitRow, { marginTop: 12 }]}>
            <Text style={[styles.unitRowLabel, { color: themeColors.textSecondary }]}>Height Unit</Text>
            <View style={[styles.unitPillContainer, { backgroundColor: themeColors.unitBg, borderColor: themeColors.unitBorder }]}>
              <Pressable
                style={[styles.unitPill, heightUnit === 'cm' && { backgroundColor: themeColors.unitPillActive }]}
                onPress={() => toggleHeightUnit('cm')}>
                <Text style={[styles.unitPillText, heightUnit === 'cm' ? { color: themeColors.unitPillTextActive } : { color: themeColors.unitPillTextInactive }]}>cm</Text>
              </Pressable>
              <Pressable
                style={[styles.unitPill, heightUnit === 'ft' && { backgroundColor: themeColors.unitPillActive }]}
                onPress={() => toggleHeightUnit('ft')}>
                <Text style={[styles.unitPillText, heightUnit === 'ft' ? { color: themeColors.unitPillTextActive } : { color: themeColors.unitPillTextInactive }]}>ft</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Notifications Setting Shortcut */}
        <Pressable
          style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}
          onPress={() => router.push('/notification-settings')}>
          <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#78350F40' : '#FEF3C7', borderColor: isDark ? '#F59E0B' : '#FDE68A' }]}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Notification Settings</Text>
            <Text style={[styles.settingSub, { color: themeColors.subText }]}>Workout, daily fitness & streak alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={themeColors.subText} />
        </Pressable>

        {/* Privacy Policy */}
        <Pressable
          style={[styles.settingItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }]}
          onPress={() => setPrivacyModalVisible(true)}>
          <View style={[styles.settingIconWrap3D, { backgroundColor: isDark ? '#1E3A8A40' : '#DBEAFE', borderColor: isDark ? '#3B82F6' : '#BFDBFE' }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Privacy & Data Protection</Text>
            <Text style={[styles.settingSub, { color: themeColors.subText }]}>Read data privacy policy & security statement</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={themeColors.subText} />
        </Pressable>

        {/* ─── 4. Account Actions & Logout ────────────────────────────── */}
        <Text style={[styles.sectionHeaderTitle, { color: themeColors.textPrimary }]}>Account</Text>

        {/* Logout Button */}
        <Pressable style={[styles.logoutBtn, { backgroundColor: themeColors.logoutBg, borderColor: themeColors.logoutBorder }]} onPress={handleLogout}>
          <View style={[styles.settingIconWrap3D, { width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: isDark ? '#22C55E' : '#BBF7D0', marginRight: 10 }]}>
            <Ionicons name="log-out-outline" size={18} color={themeColors.logoutText} />
          </View>
          <Text style={[styles.logoutBtnText, { color: themeColors.logoutText }]}>Logout Session</Text>
        </Pressable>

        {/* Delete Account Button (Destructive Action with confirmation) */}
        <Pressable style={styles.deleteAccountBtn} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={18} color="#FF4D4D" style={{ marginRight: 8 }} />
          <Text style={styles.deleteAccountBtnText}>Delete Account Permanently</Text>
        </Pressable>

      </ScrollView>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* EDIT PROFILE MODAL */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.modalBg, borderColor: themeColors.modalBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Edit Profile Information</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color={themeColors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              
              {/* ─── Centered Profile Picture Hero ─── */}
              <View style={styles.modalAvatarHeroWrap}>
                <Pressable style={styles.modalAvatarContainer} onPress={pickImageFromGallery}>
                  <Image source={{ uri: editImage }} style={[styles.modalAvatarHeroImg, { borderColor: '#22C55E' }]} />
                  <View style={[styles.modalAvatarCameraBadge, { backgroundColor: '#22C55E', borderColor: isDark ? '#121212' : '#FFFFFF' }]}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalGalleryPillBtn,
                    {
                      backgroundColor: isDark ? '#14532D40' : '#DCFCE7',
                      borderColor: isDark ? '#22C55E' : '#86EFAC',
                    },
                  ]}
                  onPress={pickImageFromGallery}>
                  <Ionicons name="images-outline" size={16} color={isDark ? '#4ADE80' : '#16A34A'} style={{ marginRight: 6 }} />
                  <Text style={[styles.modalGalleryPillBtnText, { color: isDark ? '#4ADE80' : '#16A34A' }]}>
                    Choose from Device Gallery
                  </Text>
                </Pressable>
              </View>

              <View style={styles.orDividerRow}>
                <View style={[styles.orDividerLine, { backgroundColor: themeColors.cardBorder }]} />
                <Text style={[styles.orDividerText, { color: themeColors.subText }]}>OR CHOOSE ATHLETIC AVATAR</Text>
                <View style={[styles.orDividerLine, { backgroundColor: themeColors.cardBorder }]} />
              </View>

              {/* Preset Avatars List */}
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 4 }]}>👨 Men Athletic Avatars</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {ATHLETIC_AVATARS.MEN.map((imgUrl, index) => {
                  const isSelected = editImage === imgUrl;
                  return (
                    <Pressable
                      key={`men-${index}`}
                      onPress={() => setEditImage(imgUrl)}
                      style={[styles.avatarChoiceWrap, isSelected && [styles.avatarChoiceSelected, { borderColor: '#22C55E' }]]}>
                      <Image source={{ uri: imgUrl }} style={styles.avatarChoiceImg} />
                      {isSelected && (
                        <View style={[styles.avatarSelectedCheck, { backgroundColor: '#22C55E' }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 2 }]}>👩 Women Athletic Avatars</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {ATHLETIC_AVATARS.WOMEN.map((imgUrl, index) => {
                  const isSelected = editImage === imgUrl;
                  return (
                    <Pressable
                      key={`women-${index}`}
                      onPress={() => setEditImage(imgUrl)}
                      style={[styles.avatarChoiceWrap, isSelected && [styles.avatarChoiceSelected, { borderColor: '#22C55E' }]]}>
                      <Image source={{ uri: imgUrl }} style={styles.avatarChoiceImg} />
                      {isSelected && (
                        <View style={[styles.avatarSelectedCheck, { backgroundColor: '#22C55E' }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.inputText }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor={themeColors.subText}
              />

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.inputText }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter email"
                placeholderTextColor={themeColors.subText}
                keyboardType="email-address"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Height ({heightUnit})</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.inputText }]}
                    value={editHeight}
                    onChangeText={setEditHeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Weight ({weightUnit})</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.inputText }]}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Target Weight ({weightUnit})</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder, color: themeColors.inputText }]}
                value={editTargetWeight}
                onChangeText={setEditTargetWeight}
                keyboardType="numeric"
              />

              {/* Fitness Goal Picker Chips */}
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Fitness Goal</Text>
              <View style={styles.chipWrapRow}>
                {GOALS.map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.modalChip,
                      { backgroundColor: themeColors.chipBg, borderColor: themeColors.chipBorder },
                      editGoal === g && { backgroundColor: themeColors.chipActiveBg, borderColor: themeColors.chipActiveBg },
                    ]}
                    onPress={() => setEditGoal(g)}>
                    <Text style={[styles.modalChipText, { color: themeColors.chipText }, editGoal === g && { color: themeColors.chipActiveText }]}>{g}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Activity Level Chips */}
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Activity Level</Text>
              <View style={styles.chipWrapRow}>
                {ACTIVITY_LEVELS.map((act) => (
                  <Pressable
                    key={act}
                    style={[
                      styles.modalChip,
                      { backgroundColor: themeColors.chipBg, borderColor: themeColors.chipBorder },
                      editActivity === act && { backgroundColor: themeColors.chipActiveBg, borderColor: themeColors.chipActiveBg },
                    ]}
                    onPress={() => setEditActivity(act)}>
                    <Text style={[styles.modalChipText, { color: themeColors.chipText }, editActivity === act && { color: themeColors.chipActiveText }]}>{act}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Experience Level Chips */}
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Experience Level</Text>
              <View style={styles.chipWrapRow}>
                {EXPERIENCES.map((exp) => (
                  <Pressable
                    key={exp}
                    style={[
                      styles.modalChip,
                      { backgroundColor: themeColors.chipBg, borderColor: themeColors.chipBorder },
                      editExp === exp && { backgroundColor: themeColors.chipActiveBg, borderColor: themeColors.chipActiveBg },
                    ]}
                    onPress={() => setEditExp(exp)}>
                    <Text style={[styles.modalChipText, { color: themeColors.chipText }, editExp === exp && { color: themeColors.chipActiveText }]}>{exp}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Save Modal Action Button */}
            {saving ? (
              <ActivityIndicator color={themeColors.iconColor} size="large" style={{ marginTop: 14 }} />
            ) : (
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: themeColors.unitPillActive }]} onPress={saveProfileEdits}>
                <Text style={styles.modalSaveBtnText}>Save Profile Changes</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* PRIVACY POLICY MODAL */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <Modal visible={privacyModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.modalBg, borderColor: themeColors.modalBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Privacy & Data Policy</Text>
              <Pressable onPress={() => setPrivacyModalVisible(false)}>
                <Ionicons name="close" size={22} color={themeColors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={[styles.privacyBodyText, { color: themeColors.privacyText }]}>
                GYMVex respects your privacy. All your fitness tracking, weight logs, and personal details are encrypted and securely stored. We never sell or share your personal authentication data with third-party advertisers.
              </Text>
              <Text style={[styles.privacyBodyText, { color: themeColors.privacyText }]}>
                You retain full ownership of your fitness logs and can request account deletion at any time.
              </Text>
            </ScrollView>

            <Pressable style={[styles.modalSaveBtn, { backgroundColor: themeColors.unitPillActive }]} onPress={() => setPrivacyModalVisible(false)}>
              <Text style={styles.modalSaveBtnText}>I Understand</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22C55E',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  profileInfoWrap: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badgePill: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  badgePillText: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  metricLabel: {
    color: '#777777',
    fontSize: 11,
    marginTop: 2,
  },
  settingCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    marginBottom: 12,
  },
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitRowLabel: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  unitPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  unitPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitPillActive: {
    backgroundColor: '#22C55E',
  },
  unitPillText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
  metricIconWrap3D: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
    marginBottom: 10,
  },
  logoutBtnText: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: '800',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#260B0B',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#541717',
    marginBottom: 20,
  },
  deleteAccountBtnText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262626',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  modalAvatarHeroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  modalAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  modalAvatarHeroImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
  },
  modalAvatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalGalleryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  modalGalleryPillBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '700',
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  avatarChoiceWrap: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChoiceSelected: {
    borderColor: '#22C55E',
  },
  avatarChoiceImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarSelectedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#22C55E',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  chipWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  modalChip: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  modalChipActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  modalChipText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },
  modalChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalSaveBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  privacyBodyText: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
});
