// ═══════════════════════════════════════════════════════════════════════
// plan-details.tsx — Plan Details Screen (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Shows detailed view of a selected workout plan including overview,
// complete Day 1 to Day 7 weekly schedule, Rest & Recovery Days UI, & Actions.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPlanById,
  getUserPlanState,
  startWorkoutPlan,
  pauseWorkoutPlan,
  resumeWorkoutPlan,
} from '../services/workoutPlanApi';
import { WorkoutPlanItem, UserPlanState } from './(tabs)/plans';
import { useAppTheme } from '@/context/ThemeContext';

export default function PlanDetailsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const planId = Array.isArray(searchParams.planId) ? searchParams.planId[0] : searchParams.planId;

  // State variables with explicit types
  const [plan, setPlan] = useState<WorkoutPlanItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPlanState, setUserPlanState] = useState<UserPlanState | null>(null);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    }
  }, [planId]);

  const loadPlanDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchPlanById(planId);
      setPlan(data);

      const state = await getUserPlanState();
      setUserPlanState(state);
    } catch (err) {
      console.error('Error fetching plan details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CCFF00" />
        <Text style={styles.loadingText}>Loading Plan Details...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeContainer}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
          <Text style={styles.errorText}>Workout plan not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Generate full 7-Day Schedule (Day 1 to Day 7)
  const full7DaySchedule = Array.from({ length: 7 }, (_, index) => {
    const dayNum = index + 1;
    const existing = plan.exercises?.find((d: any) => d.dayNumber === dayNum);
    if (existing) return existing;

    const isRest = dayNum === 7;
    return {
      dayNumber: dayNum,
      dayName: isRest ? `Day ${dayNum} — Rest & Active Recovery` : `Day ${dayNum} — Fitness Circuit`,
      isRestDay: isRest,
      exercises: isRest
        ? []
        : [
            { exerciseName: 'Bodyweight Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
            { exerciseName: 'Push-Ups', category: 'Chest', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800' },
            { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
          ],
    };
  });

  // Active state status calculation
  const isActivePlan =
    userPlanState?.activePlanData?._id === plan._id ||
    userPlanState?.activePlanData?.name === plan.name;
  const planStatus = isActivePlan ? userPlanState?.status : 'none';

  // Handle Start Plan button
  const handleStartPlan = async () => {
    setActionLoading(true);
    try {
      const newState = await startWorkoutPlan(plan);
      setUserPlanState(newState);
      Alert.alert('Plan Enrolled!', `You have started "${plan.name}". Let's get to work!`);
    } catch (err) {
      console.error('Failed to start plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Pause Plan button
  const handlePausePlan = async () => {
    setActionLoading(true);
    try {
      const newState = await pauseWorkoutPlan();
      setUserPlanState(newState);
      Alert.alert('Plan Paused', 'Your plan has been paused. You can resume anytime.');
    } catch (err) {
      console.error('Failed to pause plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Resume Plan button
  const handleResumePlan = async () => {
    setActionLoading(true);
    try {
      const newState = await resumeWorkoutPlan();
      setUserPlanState(newState);
      Alert.alert('Plan Resumed', 'Welcome back! Let\'s continue your workout plan.');
    } catch (err) {
      console.error('Failed to resume plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Find currently selected day schedule object from full 7 day schedule
  const currentDaySchedule =
    full7DaySchedule.find((d: any) => d.dayNumber === selectedDayTab) || full7DaySchedule[0];

  const restDaysList = plan.restDays && plan.restDays.length > 0 ? plan.restDays : ['Wednesday', 'Saturday', 'Sunday'];

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Top Header Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: colors.cardBorder, backgroundColor: colors.bg }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: colors.badgeBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {plan.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image & Overlay Badges */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                plan.image ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
            }}
            style={styles.coverImage}
          />
          <View style={styles.imageOverlay} />

          <View style={styles.badgeRow}>
            <View style={[styles.badgeGoal, { backgroundColor: isDark ? '#CCFF00' : '#0F172A' }]}>
              <Text style={[styles.badgeGoalText, { color: isDark ? '#000000' : '#FFFFFF' }]}>{plan.goal}</Text>
            </View>
            <View style={styles.badgeDifficulty}>
              <Text style={styles.badgeDiffText}>{plan.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.sectionPadding}>
          <Text style={[styles.planTitle, { color: colors.textPrimary }]}>{plan.name}</Text>
          <Text style={[styles.planDescription, { color: colors.textSecondary }]}>{plan.description}</Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="calendar-outline" size={20} color="#0284C7" />
              <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>{plan.durationWeeks || 4} Weeks</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Duration</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="barbell-outline" size={20} color="#8B5CF6" />
              <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>7 Days</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Full Schedule</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="flame-outline" size={20} color="#EF4444" />
              <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>{plan.estimatedCalories || 350}</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Est. Calories</Text>
            </View>
          </View>

          {/* Rest & Recovery Days Card */}
          <View style={[styles.restCardContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.restCardHeader}>
              <View style={[styles.restIconCircle, { backgroundColor: colors.badgeBg }]}>
                <Ionicons name="moon" size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.restCardTitle, { color: colors.textPrimary }]}>Rest & Active Recovery Days</Text>
                <Text style={[styles.restCardSubtitle, { color: colors.textSecondary }]}>Crucial for muscle repair & energy</Text>
              </View>
            </View>

            {/* Rest Day Badges */}
            <View style={styles.restDaysPillsRow}>
              {restDaysList.map((day, index) => (
                <View key={index} style={[styles.restDayPill, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                  <Ionicons name="sparkles" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                  <Text style={[styles.restDayPillText, { color: colors.textPrimary }]}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Recovery Tips Guidance */}
            <View style={[styles.recoveryGuideRow, { backgroundColor: colors.badgeBg }]}>
              <View style={styles.guideBadge}>
                <Text style={[styles.guideText, { color: colors.textPrimary }]}>💧 3L+ Water</Text>
              </View>
              <View style={styles.guideBadge}>
                <Text style={[styles.guideText, { color: colors.textPrimary }]}>💤 8 Hours Sleep</Text>
              </View>
              <View style={styles.guideBadge}>
                <Text style={[styles.guideText, { color: colors.textPrimary }]}>🧘 Mobility Stretch</Text>
              </View>
            </View>
          </View>

          {/* Day Schedule Selection Selector Tabs (Day 1 to Day 7) */}
          <View style={styles.scheduleHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>7-Day Weekly Schedule</Text>
            <Text style={[styles.scheduleSubtitle, { color: colors.textSecondary }]}>Day 1 to Day 7</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {full7DaySchedule.map((dayObj: any) => {
              const isSelected = selectedDayTab === dayObj.dayNumber;
              return (
                <Pressable
                  key={dayObj.dayNumber}
                  style={[
                    styles.dayTab,
                    {
                      backgroundColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                      borderColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedDayTab(dayObj.dayNumber)}>
                  <Text
                    style={[
                      styles.dayTabText,
                      { color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                    ]}>
                    Day {dayObj.dayNumber}
                  </Text>
                  {dayObj.isRestDay ? (
                    <View style={[styles.restPillBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.cardBorder }]}>
                      <Ionicons name="moon-outline" size={10} color={isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary} />
                      <Text style={[styles.restPillText, { color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary }]}>Rest</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Exercises for Selected Day */}
          {currentDaySchedule?.isRestDay ? (
            <View style={[styles.restDayNotice, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={[styles.restDayIconBig, { backgroundColor: colors.badgeBg }]}>
                <Ionicons name="moon" size={40} color={isDark ? "#CCFF00" : "#0284C7"} />
              </View>
              <Text style={[styles.restDayTitle, { color: colors.textPrimary }]}>Rest & Active Recovery Day</Text>
              <Text style={[styles.restDayDesc, { color: colors.textSecondary }]}>
                No heavy lifts today! Rest allows muscle fibers to rebuild stronger, repairs nervous system fatigue, and prevents injury.
              </Text>
              <View style={[styles.recoveryChecklist, { backgroundColor: colors.badgeBg }]}>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.checkText, { color: colors.textPrimary }]}>Light 15-min walk or mobility stretch</Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.checkText, { color: colors.textPrimary }]}>High protein intake for muscle synthesis</Text>
                </View>
                <View style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.checkText, { color: colors.textPrimary }]}>Get at least 7-8 hours of quality sleep</Text>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.dayScheduleTitle, { color: colors.textPrimary }]}>
                {(currentDaySchedule?.dayName || '').replace(' — ', ': ')}
              </Text>

              {currentDaySchedule?.exercises?.map((ex: any, idx: number) => (
                <View key={idx} style={[styles.exerciseCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                  <Image
                    source={{
                      uri:
                        ex.image ||
                        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
                    }}
                    style={styles.exImage}
                  />
                  <View style={styles.exDetails}>
                    <Text style={[styles.exName, { color: colors.textPrimary }]}>{ex.exerciseName}</Text>
                    <Text style={[styles.exCategory, { color: colors.textSecondary }]}>{ex.category || 'General'}</Text>
                    <View style={styles.exMetaRow}>
                      <Text style={[styles.exMetaPill, { backgroundColor: colors.badgeBg, color: colors.textPrimary }]}>{ex.sets} Sets</Text>
                      <Text style={[styles.exMetaPill, { backgroundColor: colors.badgeBg, color: colors.textPrimary }]}>
                        {ex.durationSeconds > 0 ? `${ex.durationSeconds}s` : `${ex.reps} Reps`}
                      </Text>
                      <Text style={[styles.exMetaPill, { backgroundColor: colors.badgeBg, color: colors.textPrimary }]}>{ex.restSeconds || 60}s Rest</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomBar, { backgroundColor: colors.bg, borderTopColor: colors.cardBorder }]}>
        {actionLoading ? (
          <ActivityIndicator color={isDark ? "#CCFF00" : "#0F172A"} size="small" />
        ) : isActivePlan ? (
          planStatus === 'active' ? (
            <View style={styles.btnRow}>
              <Pressable
                style={[styles.actionBtn, styles.pauseBtn, { backgroundColor: colors.badgeBg, borderWidth: 1, borderColor: colors.cardBorder }]}
                onPress={handlePausePlan}>
                <Ionicons name="pause" size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Pause Plan</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.todayBtn,
                  { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
                ]}
                onPress={() => router.push('/(tabs)/today-workout')}>
                <Ionicons name="fitness" size={18} color={isDark ? "#000" : "#FFF"} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: isDark ? "#000" : "#FFF" }]}>Today's Workout</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.resumeBtn,
                  { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
                ]}
                onPress={handleResumePlan}>
                <Ionicons name="play" size={18} color={isDark ? "#000" : "#FFF"} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: isDark ? "#000" : "#FFF" }]}>Resume Plan</Text>
              </Pressable>
            </View>
          )
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.startPlanBtn,
              { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
            ]}
            onPress={handleStartPlan}>
            <Ionicons name="rocket-outline" size={20} color={isDark ? "#000" : "#FFF"} style={{ marginRight: 8 }} />
            <Text style={[styles.startPlanBtnText, { color: isDark ? "#000" : "#FFF" }]}>
              {userPlanState?.activePlanData ? 'Switch to this Plan' : 'Start Plan Now'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 12,
  },
  backButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#CCFF00',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#161616',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badgeRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
  },
  badgeGoal: {
    backgroundColor: '#CCFF00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeGoalText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeDifficulty: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555555',
  },
  badgeDiffText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionPadding: {
    padding: 16,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  planDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statBoxValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  statBoxLabel: {
    color: '#777777',
    fontSize: 10,
    marginTop: 2,
  },
  restCardContainer: {
    backgroundColor: '#131F08',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2B4010',
    marginBottom: 20,
  },
  restCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#263B0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  restCardSubtitle: {
    color: '#888888',
    fontSize: 11,
    marginTop: 1,
  },
  restDaysPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  restDayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#253B0C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#395713',
  },
  restDayPillText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '800',
  },
  recoveryGuideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1B2B0A',
    borderRadius: 10,
    padding: 8,
  },
  guideBadge: {
    alignItems: 'center',
  },
  guideText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scheduleSubtitle: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '700',
  },
  dayTab: {
    backgroundColor: '#161616',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#282828',
  },
  dayTabActive: {
    backgroundColor: '#CCFF00',
    borderColor: '#CCFF00',
  },
  dayTabRest: {
    borderColor: '#2C4010',
  },
  dayTabText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  restPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23360B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  restPillText: {
    color: '#CCFF00',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  dayScheduleTitle: {
    color: '#CCFF00',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  restDayNotice: {
    backgroundColor: '#121C08',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#283D10',
  },
  restDayIconBig: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#23380B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  restDayTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  restDayDesc: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  recoveryChecklist: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#17240B',
    borderRadius: 12,
    padding: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkText: {
    color: '#DDDDDD',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
  },
  exImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  exDetails: {
    flex: 1,
  },
  exName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  exCategory: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  exMetaRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  exMetaPill: {
    color: '#CCFF00',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#1D2A05',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  bottomBar: {
    backgroundColor: '#121212',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  startPlanBtn: {
    backgroundColor: '#CCFF00',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPlanBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  pauseBtn: {
    backgroundColor: '#444444',
  },
  resumeBtn: {
    backgroundColor: '#CCFF00',
  },
  todayBtn: {
    backgroundColor: '#CCFF00',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
