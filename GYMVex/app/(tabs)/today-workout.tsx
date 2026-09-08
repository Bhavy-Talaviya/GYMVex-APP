// ═══════════════════════════════════════════════════════════════════════
// today-workout.tsx — Today's Workout Screen (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Features interactive workout execution for today's plan session:
// Day 1 to Day 7 selector bar, set checklists, rest timer modal, & progress.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getUserPlanState,
  completeWorkoutSession,
  resumeWorkoutPlan,
} from '../../services/workoutPlanApi';
import { UserPlanState } from './plans';
import { useAppTheme } from '@/context/ThemeContext';

export default function TodayWorkoutScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  // State management with explicit types
  const [userState, setUserState] = useState<UserPlanState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({}); // { [exIndex_setIndex]: boolean }
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [showRestModal, setShowRestModal] = useState<boolean>(false);

  // Reload data on focus
  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [])
  );

  // Update selected day when userState loads
  useEffect(() => {
    if (userState?.currentDay) {
      setSelectedDayNum(userState.currentDay);
    }
  }, [userState]);

  // Main Workout Stopwatch Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Rest Countdown Timer
  useEffect(() => {
    let restInterval: any = null;
    if (showRestModal && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setShowRestModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [showRestModal, restTimerSeconds]);

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const state = await getUserPlanState();
      setUserState(state);
    } catch (err) {
      console.error('Error loading today workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activePlan = userState?.activePlanData;
  const currentWeekNumber = userState?.currentWeek || 1;

  // Generate full 7-Day Schedule (Day 1 to Day 7) for active plan
  const full7DaySchedule = Array.from({ length: 7 }, (_, index) => {
    const dayNum = index + 1;
    const existing = activePlan?.exercises?.find((d: any) => d.dayNumber === dayNum);
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

  // Selected schedule based on user's chosen day tab
  const todaySchedule =
    full7DaySchedule.find((d: any) => d.dayNumber === selectedDayNum) || full7DaySchedule[0];

  // Toggle set completed checkmark
  const toggleSetComplete = (exIdx: number, setIdx: number, restTime: number = 60) => {
    const key = `${exIdx}_${setIdx}`;
    const nextVal = !completedSets[key];

    setCompletedSets((prev) => ({
      ...prev,
      [key]: nextVal,
    }));

    // If checked off, trigger rest timer
    if (nextVal) {
      setRestTimerSeconds(restTime || 60);
      setShowRestModal(true);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate workout completion percentage
  const totalExercises = todaySchedule?.exercises?.length || 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  todaySchedule?.exercises?.forEach((ex: any, exIdx: number) => {
    const numSets = ex.sets || 3;
    totalSetsCount += numSets;
    for (let s = 0; s < numSets; s++) {
      if (completedSets[`${exIdx}_${s}`]) {
        completedSetsCount++;
      }
    }
  });

  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Handle Workout Completion submission
  const handleFinishWorkout = async () => {
    setSubmitting(true);
    try {
      const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
      const calories = Math.round(durationMins * 8.5) + 50;

      await completeWorkoutSession(calories, durationMins, totalExercises);
      setShowCompleteModal(false);
      Alert.alert(
        '🎉 Workout Complete!',
        `Fantastic job! You completed Day ${selectedDayNum} and burned ~${calories} kcal in ${durationMins} minutes. History has been updated!`,
        [
          {
            text: 'View History',
            onPress: () => router.push('/(tabs)/history'),
          },
          { text: 'OK', onPress: () => loadTodayData() },
        ]
      );
    } catch (err) {
      console.error('Failed to complete workout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={isDark ? "#CCFF00" : "#0F172A"} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Today's Session...</Text>
      </View>
    );
  }

  // If user has no active plan
  if (!activePlan || userState?.status === 'none') {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
        <View style={styles.noPlanContainer}>
          <View style={[styles.iconCircleBig, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="barbell-outline" size={48} color={isDark ? "#CCFF00" : "#0F172A"} />
          </View>
          <Text style={[styles.noPlanTitle, { color: colors.textPrimary }]}>No Active Workout Plan</Text>
          <Text style={[styles.noPlanSubtitle, { color: colors.textSecondary }]}>
            Select a workout plan from the Plans tab to start tracking your daily progress.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.browseBtn,
              { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
            ]}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={[styles.browseBtnText, { color: isDark ? "#000" : "#FFF" }]}>Explore Workout Plans</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // If active plan is paused
  if (userState?.status === 'paused') {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
        <View style={styles.noPlanContainer}>
          <View style={[styles.iconCircleBig, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="pause-circle-outline" size={48} color={isDark ? "#CCFF00" : "#0F172A"} />
          </View>
          <Text style={[styles.noPlanTitle, { color: colors.textPrimary }]}>Workout Plan Paused</Text>
          <Text style={[styles.noPlanSubtitle, { color: colors.textSecondary }]}>
            "{activePlan.name}" is currently on pause. Resume to unlock today's workout.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.browseBtn,
              { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
            ]}
            onPress={async () => {
              await resumeWorkoutPlan();
              loadTodayData();
            }}>
            <Text style={[styles.browseBtnText, { color: isDark ? "#000" : "#FFF" }]}>Resume Plan Now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        {activePlan?.name && (
          <View style={[styles.activePlanTag, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="flame" size={12} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.activePlanTagText, { color: colors.textPrimary }]} numberOfLines={1}>
              ACTIVE: {activePlan.name}
            </Text>
          </View>
        )}
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {(todaySchedule?.dayName || `Day ${selectedDayNum}`).replace(' — ', ': ')}
        </Text>
      </View>

      {/* Day Selector Bar (Day 1 to Day 7) */}
      <View style={styles.daySelectorWrapper}>
        <Text style={[styles.daySelectorLabel, { color: colors.textSecondary }]}>CHOOSE WORKOUT DAY:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScroll}>
          {full7DaySchedule.map((d: any) => {
            const isSelected = selectedDayNum === d.dayNumber;
            return (
              <Pressable
                key={d.dayNumber}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                    borderColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                  },
                ]}
                onPress={() => {
                  setSelectedDayNum(d.dayNumber);
                  setCompletedSets({}); // reset checklist for newly chosen day
                }}>
                <Text
                  style={[
                    styles.dayChipText,
                    {
                      color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}>
                  Day {d.dayNumber}
                </Text>
                {d.isRestDay ? (
                  <Ionicons name="moon" size={10} color={isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary} style={{ marginLeft: 3 }} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Session Quick Meta Stats Bar */}
      <View style={[styles.metaStatsBar, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.metaStatItem}>
          <Text style={[styles.metaStatLabel, { color: colors.textSecondary }]}>SELECTED</Text>
          <Text style={[styles.metaStatValue, { color: colors.textPrimary }]}>Day {selectedDayNum} / 7</Text>
        </View>
        <View style={[styles.metaStatDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.metaStatItem}>
          <Text style={[styles.metaStatLabel, { color: colors.textSecondary }]}>EXERCISES</Text>
          <Text style={[styles.metaStatValue, { color: colors.textPrimary }]}>{totalExercises}</Text>
        </View>
        <View style={[styles.metaStatDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.metaStatItem}>
          <Text style={[styles.metaStatLabel, { color: colors.textSecondary }]}>EST. BURN</Text>
          <Text style={[styles.metaStatValue, { color: colors.textPrimary }]}>~{activePlan.estimatedCalories || 350} Cal</Text>
        </View>
      </View>

      {/* If selected day is a Rest Day */}
      {todaySchedule?.isRestDay ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={[styles.restDayContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.iconCircleBig, { backgroundColor: isDark ? '#1C2E05' : '#E6F4EA' }]}>
              <Ionicons name="moon" size={48} color={isDark ? "#CCFF00" : "#10B981"} />
            </View>
            <Text style={[styles.restDayTitle, { color: colors.textPrimary }]}>Day {selectedDayNum} — Rest & Active Recovery</Text>
            <Text style={[styles.restDayDesc, { color: colors.textSecondary }]}>
              This day is a scheduled rest day for <Text style={{ color: isDark ? '#CCFF00' : '#0F172A', fontWeight: 'bold' }}>{activePlan.name}</Text>.
              Rest days allow muscle tissue to repair and replenish energy stores!
            </Text>

            <View style={[styles.recoveryChecklist, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.checkText, { color: colors.textPrimary }]}>Drink 3L+ water for cellular recovery</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.checkText, { color: colors.textPrimary }]}>Light 15-minute walk or mobility stretch</Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.checkText, { color: colors.textPrimary }]}>Sleep 7-8 hours for full muscle synthesis</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Progress Bar Container */}
          <View style={[styles.progressContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Day {selectedDayNum} Progress ({completedSetsCount}/{totalSetsCount} Sets)</Text>
              <Text style={[styles.progressPercent, { color: isDark ? "#CCFF00" : "#0F172A" }]}>{progressPercent}%</Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: colors.badgeBg }]}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: isDark ? "#CCFF00" : "#0F172A" }]} />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Exercises List */}
            {todaySchedule?.exercises?.map((ex: any, exIdx: number) => {
              const numSets = ex.sets || 3;
              const setsArr = Array.from({ length: numSets }, (_, i) => i);

              return (
                <View key={exIdx} style={[styles.exerciseCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.exerciseHeader}>
                    <Image
                      source={{
                        uri:
                          ex.image ||
                          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
                      }}
                      style={styles.exImage}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exName, { color: colors.textPrimary }]}>{ex.exerciseName}</Text>
                      <Text style={[styles.exDetailsText, { color: colors.textSecondary }]}>
                        {ex.category || 'General'} • {ex.durationSeconds > 0 ? `${ex.durationSeconds}s duration` : `${ex.reps} Reps per set`}
                      </Text>
                    </View>
                    <View style={[styles.restPillBadge, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                      <Ionicons name="timer-outline" size={12} color={isDark ? "#CCFF00" : "#0F172A"} style={{ marginRight: 2 }} />
                      <Text style={[styles.restPillText, { color: colors.textPrimary }]}>{ex.restSeconds || 60}s</Text>
                    </View>
                  </View>

                  {/* Set Checkboxes Grid */}
                  <View style={styles.setsGrid}>
                    {setsArr.map((setIndex) => {
                      const key = `${exIdx}_${setIndex}`;
                      const isChecked = !!completedSets[key];

                      return (
                        <Pressable
                          key={setIndex}
                          style={[
                            styles.setChip,
                            {
                              backgroundColor: isChecked ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                              borderColor: isChecked ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                            },
                          ]}
                          onPress={() => toggleSetComplete(exIdx, setIndex, ex.restSeconds)}>
                          <Ionicons
                            name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                            size={18}
                            color={isChecked ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                          />
                          <Text style={[styles.setText, { color: isChecked ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
                            Set {setIndex + 1}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Complete Workout Button — Below All Exercises */}
            <View style={[styles.bottomBar, { backgroundColor: colors.bg, marginTop: 12 }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.completeBtn,
                  { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
                ]}
                onPress={() => setShowCompleteModal(true)}>
                <Ionicons name="checkmark-done-circle" size={22} color={isDark ? "#000000" : "#FFFFFF"} style={{ marginRight: 6 }} />
                <Text style={[styles.completeBtnText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Complete Day {selectedDayNum} Workout</Text>
              </Pressable>
            </View>
          </ScrollView>
        </>
      )}

      {/* Rest Timer Modal */}
      <Modal visible={showRestModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.restModalBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="timer-outline" size={44} color={isDark ? "#CCFF00" : "#0F172A"} />
            <Text style={[styles.restModalTitle, { color: colors.textPrimary }]}>Rest & Recover</Text>
            <Text style={[styles.restTimerDisplay, { color: isDark ? "#CCFF00" : "#0F172A" }]}>{formatTime(restTimerSeconds)}</Text>
            <Text style={[styles.restModalSubtitle, { color: colors.textSecondary }]}>Catch your breath before starting the next set!</Text>
            <Pressable
              style={[styles.skipRestBtn, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
              onPress={() => setShowRestModal(false)}
            >
              <Text style={[styles.skipRestText, { color: colors.textPrimary }]}>Skip Rest</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Complete Workout Confirmation Modal */}
      <Modal visible={showCompleteModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.completeModalBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="trophy" size={48} color={isDark ? "#CCFF00" : "#0F172A"} />
            <Text style={[styles.completeModalTitle, { color: colors.textPrimary }]}>Finish Day {selectedDayNum} Workout?</Text>
            <Text style={[styles.completeModalSubtitle, { color: colors.textSecondary }]}>
              Awesome job! You completed {completedSetsCount} sets in {formatTime(elapsedSeconds)}.
            </Text>

            {submitting ? (
              <ActivityIndicator color={isDark ? "#CCFF00" : "#0F172A"} size="large" style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ width: '100%', marginTop: 16 }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalConfirmBtn,
                    { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
                  ]}
                  onPress={handleFinishWorkout}
                >
                  <Text style={[styles.modalConfirmText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Save & Log Workout</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalCancelBtn, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
                  onPress={() => setShowCompleteModal(false)}>
                  <Text style={[styles.modalCancelText, { color: colors.textPrimary }]}>Keep Going</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    paddingTop: 2,
    paddingBottom: 4,
  },
  activePlanTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  activePlanTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: 8,
  },
  timerWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  timerWidgetText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  daySelectorWrapper: {
    marginBottom: 10,
  },
  daySelectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  daySelectorScroll: {
    flexDirection: 'row',
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaStatsBar: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  metaStatItem: {
    alignItems: 'center',
  },
  metaStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaStatValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metaStatDivider: {
    width: 1,
    height: 18,
  },
  progressContainer: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  exName: {
    fontSize: 16,
    fontWeight: '700',
  },
  exDetailsText: {
    fontSize: 12,
    marginTop: 2,
  },
  restPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  restPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  setChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  setText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomBar: {
    paddingVertical: 12,
  },
  completeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  noPlanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  noPlanTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  noPlanSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  restDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  restDayDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  recoveryChecklist: {
    width: '100%',
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  restModalBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
  },
  restModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  restTimerDisplay: {
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 12,
  },
  restModalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  skipRestBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
  },
  skipRestText: {
    fontSize: 13,
    fontWeight: '600',
  },
  completeModalBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
  },
  completeModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  completeModalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  modalConfirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalCancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
  },
});
