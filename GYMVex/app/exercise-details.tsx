// ═══════════════════════════════════════════════════════════════════════
// exercise-details.tsx — Complete Exercise Details & Workout Config Screen
// ═══════════════════════════════════════════════════════════════════════
// Displayed when tapping an exercise card.
// Includes:
// - Exercise image/video preview animation area
// - Target muscles, equipment, difficulty, calories
// - Interactive workout configuration (Sets, Reps/Duration, Weight, Rest Time)
// - Dynamic calorie burn estimator (based on user weight & intensity)
// - Visual step-by-step instructions
// - Form tips, common mistakes, and safety information
// - Action buttons: Favorite, Add to Workout, Start Exercise with Timer Modal
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { logCompletedWorkout } from '../services/workoutPlanApi';

// API service
const { fetchExerciseById } = require('../services/exerciseApi');

// Difficulty badge colors
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#4ECDC4',
  Intermediate: '#CCFF00',
  Advanced: '#FF6B6B',
};

// ═══════════════════════════════════════════════════════════════════════
// STEPPER CONTROL COMPONENT — Adjustable number input with - and +
// ═══════════════════════════════════════════════════════════════════════

type StepperControlProps = {
  label: string;
  unit?: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
};

const StepperControl = ({ label, unit, value, step = 1, min = 1, max = 300, onChange }: StepperControlProps) => {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={[styles.stepperContainer, { borderBottomColor: colors.cardBorder }]}>
      <Text style={[styles.stepperLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={({ pressed }) => [
            styles.stepperButton,
            { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="remove" size={16} color={colors.textPrimary} />
        </Pressable>
        <View style={[styles.stepperValueContainer, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
          <TextInput
            style={[styles.stepperInput, { color: isDark ? '#CCFF00' : '#0F172A' }]}
            value={String(value)}
            keyboardType="numeric"
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
              else if (text === '') onChange(min);
            }}
            selectionColor={isDark ? '#CCFF00' : '#0F172A'}
          />
          {unit && <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>{unit}</Text>}
        </View>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={({ pressed }) => [
            styles.stepperButton,
            { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXERCISE DETAILS SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function ExerciseDetailsScreen() {
  const { colors, radius, isDark } = useAppTheme();
  const { id } = useLocalSearchParams();

  // ─── Exercise Data & Loading ──────────────────────────────────────
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Interactive Customization State ──────────────────────────────
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [duration, setDuration] = useState(30); // in seconds
  const [restTime, setRestTime] = useState(60); // in seconds
  const [weight, setWeight] = useState(20);     // in kg
  const [userWeight, setUserWeight] = useState(70); // in kg

  // ─── Actions & Modals ─────────────────────────────────────────────
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeSet, setActiveSet] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fade animation
  const fadeIn = useRef(new Animated.Value(0)).current;

  // ─── Load Exercise Details ────────────────────────────────────────
  useEffect(() => {
    const loadExercise = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchExerciseById(id);
        setExercise(data);

        // Initialize default configuration
        if (data) {
          setSets(data.defaultSets || 3);
          setReps(data.defaultReps || 12);
          setDuration(data.defaultDuration || 30);
          setRestTime(data.restTime || 60);
        }

        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        setError(err.message || 'Failed to load exercise details');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadExercise();
  }, [id]);

  // ─── Rest & Workout Timer logic ──────────────────────────────────
  const [isResting, setIsResting] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(60);

  // Sync default rest time when data loads
  useEffect(() => {
    if (restTime > 0) {
      setRestTimerSeconds(restTime);
    }
  }, [restTime]);

  // Start rest timer: pause main elapsed time & start rest countdown
  const handleStartRest = () => {
    setIsTimerRunning(false);
    setRestTimerSeconds(restTime);
    setIsResting(true);
  };

  // Skip / Finish rest: stop rest timer & resume main elapsed time
  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimerSeconds(restTime);
    setIsTimerRunning(true);
  };

  // Countdown effect for rest timer
  useEffect(() => {
    let restInterval: any = null;
    if (isResting && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restTimerSeconds === 0) {
      // Rest finished! Stop rest timer & resume main elapsed time
      setIsResting(false);
      setRestTimerSeconds(restTime);
      setIsTimerRunning(true);
      if (restInterval) clearInterval(restInterval);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isResting, restTimerSeconds, restTime]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // ─── Helper: Is this a timed exercise? ───────────────────────────
  const isTimedExercise = exercise ? (exercise.category === 'Cardio' || exercise.category === 'Yoga' || exercise.category === 'Stretching' || exercise.defaultDuration > 0) : false;

  // ─── Dynamic Calorie Burn Estimator ──────────────────────────────
  const calculateEstimatedCalories = () => {
    if (!exercise) return 0;
    const baseCalPerMin = exercise.caloriesPerMinute || 6;
    const weightRatio = userWeight / 70; // 70kg baseline

    if (isTimedExercise) {
      const totalMinutes = (sets * duration + sets * restTime) / 60;
      return Math.round(totalMinutes * baseCalPerMin * weightRatio);
    } else {
      const workSeconds = sets * reps * 4;
      const totalMinutes = (workSeconds + sets * restTime) / 60;
      return Math.round(totalMinutes * baseCalPerMin * weightRatio);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={isDark ? "#CCFF00" : "#0F172A"} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading exercise details...</Text>
      </View>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────
  if (error || !exercise) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.bg }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Failed to load exercise</Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Text style={[styles.backButtonText, { color: isDark ? "#000" : "#FFF" }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLORS[exercise.difficulty] || '#CCFF00';
  const estCalories = calculateEstimatedCalories();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeIn }}>

          {/* ─── Top Bar ─────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.topBarButton,
                { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <Text style={[styles.topBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Pressable
              onPress={() => setIsFavorite(!isFavorite)}
              style={({ pressed }) => [
                styles.topBarButton,
                { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#FF6B6B' : colors.textPrimary}
              />
            </Pressable>
          </View>

          {/* ─── Main Scrollable Area ────────────────────────────── */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
          >
            {/* ─── Hero Image Area ──────────────────────────── */}
            <View style={[styles.heroMediaContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Image
                source={{ uri: exercise.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.heroOverlay} />

              {/* Difficulty Badge */}
              <View style={[styles.heroDifficultyBadge, { backgroundColor: `${diffColor}25`, borderColor: `${diffColor}40` }]}>
                <Text style={[styles.heroDifficultyText, { color: diffColor }]}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>

            {/* ─── Exercise Header & Badges ──────────────────────── */}
            <View style={styles.infoContainer}>
              <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>{exercise.name}</Text>
              <Text style={[styles.exerciseDescription, { color: colors.textSecondary }]}>{exercise.description}</Text>

              {/* 3 Core Info Chips */}
              <View style={styles.infoChipsRow}>
                <View style={[styles.infoChip, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                  <Ionicons name="body-outline" size={14} color={isDark ? "#CCFF00" : "#0F172A"} />
                  <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>{exercise.category}</Text>
                </View>
                <View style={[styles.infoChip, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                  <Ionicons name="barbell-outline" size={14} color={colors.info} />
                  <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>{exercise.equipment}</Text>
                </View>
                <View style={[styles.infoChip, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                  <Ionicons name="flame-outline" size={14} color={colors.danger} />
                  <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>{exercise.caloriesPerMinute} cal/min</Text>
                </View>
              </View>

              {/* Target Muscle Tags */}
              <View style={styles.sectionMargin}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Target Muscles</Text>
                <View style={styles.muscleTagsWrap}>
                  {exercise.muscleGroups?.map((muscle: string) => (
                    <View key={muscle} style={[styles.muscleTag, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                      <Text style={[styles.muscleTagText, { color: colors.textPrimary }]}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ─── Workout Configuration (Interactive Controls) ─ */}
              <View style={[styles.configCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderRadius: radius.card }]}>
                <View style={styles.configHeader}>
                  <Ionicons name="options-outline" size={18} color={isDark ? "#CCFF00" : "#0F172A"} />
                  <Text style={[styles.configTitle, { color: colors.textPrimary }]}>Workout Configuration</Text>
                </View>

                {/* Sets Control */}
                <StepperControl
                  label="Sets"
                  value={sets}
                  min={1}
                  max={20}
                  onChange={setSets}
                />

                {/* Reps OR Duration Control */}
                {isTimedExercise ? (
                  <StepperControl
                    label="Duration per set"
                    unit="sec"
                    value={duration}
                    step={5}
                    min={5}
                    max={600}
                    onChange={setDuration}
                  />
                ) : (
                  <StepperControl
                    label="Reps per set"
                    value={reps}
                    min={1}
                    max={100}
                    onChange={setReps}
                  />
                )}

                {/* Weight Control */}
                {exercise.equipment !== 'Bodyweight' && exercise.equipment !== 'None' && (
                  <StepperControl
                    label="Weight"
                    unit="kg"
                    value={weight}
                    step={2.5}
                    min={0}
                    max={500}
                    onChange={setWeight}
                  />
                )}

                {/* Rest Time Control */}
                <StepperControl
                  label="Rest Time"
                  unit="sec"
                  value={restTime}
                  step={5}
                  min={0}
                  max={300}
                  onChange={setRestTime}
                />

                {/* Summary text */}
                <View style={styles.configSummary}>
                  <Text style={[styles.configSummaryText, { color: colors.textSecondary }]}>
                    Configured: <Text style={{ color: isDark ? '#CCFF00' : '#0F172A', fontWeight: '800' }}>{sets} Sets</Text> •{' '}
                    <Text style={{ color: isDark ? '#CCFF00' : '#0F172A', fontWeight: '800' }}>
                      {isTimedExercise ? `${duration}s` : `${reps} Reps`}
                    </Text>{' '}
                    • <Text style={{ color: isDark ? '#CCFF00' : '#0F172A', fontWeight: '800' }}>{restTime}s Rest</Text>
                  </Text>
                </View>
              </View>

              {/* ─── Dynamic Calorie Burn Estimator ──────────────── */}
              <View style={[styles.calorieCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.calorieHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="flame" size={18} color="#FF6B6B" />
                    <Text style={[styles.calorieTitle, { color: colors.textPrimary }]}>Estimated Calorie Burn</Text>
                  </View>
                  <Text style={styles.calorieValue}>{estCalories} kcal</Text>
                </View>

                {/* Weight input */}
                <View style={[styles.weightInputRow, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.weightInputLabel, { color: colors.textSecondary }]}>Your Body Weight:</Text>
                  <View style={styles.weightInputBox}>
                    <TextInput
                      style={[styles.weightInputText, { color: colors.textPrimary }]}
                      value={String(userWeight)}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        const w = parseInt(text, 10);
                        if (!isNaN(w)) setUserWeight(Math.max(30, Math.min(250, w)));
                        else if (text === '') setUserWeight(70);
                      }}
                      selectionColor={isDark ? "#CCFF00" : "#0F172A"}
                    />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>kg</Text>
                  </View>
                </View>

                {/* Mandatory Disclaimer */}
                <View style={styles.disclaimerBox}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                    Estimated calorie burn based on standard exercise intensity. Individual results may vary based on effort and metabolic rate.
                  </Text>
                </View>
              </View>

              {/* ─── Step-by-Step Visual Instructions ────────────── */}
              {exercise.instructions?.length > 0 && (
                <View style={styles.sectionMargin}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="list-outline" size={18} color={isDark ? "#CCFF00" : "#0F172A"} />
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Step-by-Step Instructions</Text>
                  </View>

                  {exercise.instructions.map((step: string, index: number) => (
                    <View key={index} style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                      <View style={[styles.stepNumberBadge, { backgroundColor: isDark ? '#CCFF0020' : 'rgba(15, 23, 42, 0.1)' }]}>
                        <Text style={[styles.stepNumberText, { color: isDark ? '#CCFF00' : '#0F172A' }]}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.stepInstructionText, { color: colors.textPrimary }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ─── Benefits Section ────────────────────────────── */}
              {exercise.benefits?.length > 0 && (
                <View style={styles.sectionMargin}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={isDark ? "#CCFF00" : "#0F172A"} />
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Benefits</Text>
                  </View>
                  {exercise.benefits.map((benefit: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletPoint, { backgroundColor: isDark ? '#CCFF00' : '#0F172A' }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ─── Form Tips ───────────────────────────────────── */}
              {exercise.tips?.length > 0 && (
                <View style={styles.sectionMargin}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="bulb-outline" size={18} color="#4ECDC4" />
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Form Tips</Text>
                  </View>
                  {exercise.tips.map((tip: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletPoint, { backgroundColor: '#4ECDC4' }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ─── Common Mistakes ─────────────────────────────── */}
              {exercise.mistakes?.length > 0 && (
                <View style={styles.sectionMargin}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="warning-outline" size={18} color="#FF6B6B" />
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Common Mistakes</Text>
                  </View>
                  {exercise.mistakes.map((mistake: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletPoint, { backgroundColor: '#FF6B6B' }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{mistake}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ─── Safety Information ──────────────────── */}
              {exercise.contraindications?.length > 0 && (
                <View style={styles.sectionMargin}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="alert-circle-outline" size={18} color="#F97316" />
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>Safety Information</Text>
                  </View>
                  {exercise.contraindications.map((item: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletPoint, { backgroundColor: '#F97316' }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Bottom spacer */}
              <View style={{ height: 100 }} />
            </View>
          </ScrollView>

          {/* ─── Bottom Action Bar ───────────────────────────────── */}
          <View style={[styles.bottomActionBar, { backgroundColor: colors.cardBg, borderTopColor: colors.cardBorder }]}>
            <Pressable
              onPress={() => {
                setShowStartModal(true);
                setIsTimerRunning(true);
              }}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
              ]}
            >
              <Ionicons name="play" size={20} color={isDark ? "#000000" : "#FFFFFF"} />
              <Text style={[styles.startButtonText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Start Exercise</Text>
            </Pressable>
          </View>

        </Animated.View>
      </SafeAreaView>

      {/* ─── Active Exercise Tracker Modal ──────────────────────── */}
      <Modal visible={showStartModal} transparent animationType="slide">
        <View style={[styles.fullModalContainer, { backgroundColor: colors.bg }]}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
            <View style={[styles.fullModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.fullModalTitle, { color: colors.textPrimary }]}>{exercise.name}</Text>
              <Pressable
                onPress={() => {
                  setShowStartModal(false);
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                  setActiveSet(1);
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={26} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.timerCenterContent}>
              {/* Set Counter */}
              <Text style={[styles.activeSetLabel, { color: isDark ? "#CCFF00" : "#0F172A" }]}>SET {activeSet} OF {sets}</Text>
              <Text style={[styles.activeTargetText, { color: colors.textPrimary }]}>
                {isTimedExercise ? `${duration} SECONDS` : `${reps} REPETITIONS`}
              </Text>
              {weight > 0 && <Text style={[styles.activeWeightText, { color: colors.textSecondary }]}>@ {weight} kg</Text>}

              {/* Timer Display */}
              <View style={[styles.timerCircle, { borderColor: isDark ? '#CCFF00' : '#0F172A', backgroundColor: colors.cardBg }]}>
                <Text style={[styles.timerText, { color: colors.textPrimary }]}>
                  {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </Text>
                <Text style={[styles.timerSubText, { color: colors.textSecondary }]}>Elapsed Time</Text>
              </View>

              {/* Timer Controls */}
              <View style={styles.timerButtonsRow}>
                <Pressable
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                  style={[styles.timerControlButton, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
                >
                  <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={24} color={isDark ? "#CCFF00" : "#0F172A"} />
                </Pressable>
                <Pressable
                  onPress={() => setTimerSeconds(0)}
                  style={[styles.timerControlButton, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
                >
                  <Ionicons name="refresh" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Rest Time Section */}
              <View style={[styles.restTimerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.restTimerHeader}>
                  <Ionicons name="timer-outline" size={16} color={isDark ? "#CCFF00" : "#0F172A"} />
                  <Text style={[styles.restTimerTitle, { color: colors.textPrimary }]}>Rest Time: {restTime} Seconds</Text>
                </View>
                {isResting ? (
                  <View style={styles.restCountdownRow}>
                    <Text style={[styles.restCountdownText, { color: isDark ? "#CCFF00" : "#0F172A" }]}>{restTimerSeconds}s Rest Remaining</Text>
                    <Pressable
                      onPress={handleSkipRest}
                      style={[styles.skipRestButton, { backgroundColor: colors.badgeBg }]}
                    >
                      <Text style={[styles.skipRestText, { color: colors.textSecondary }]}>Skip Rest</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleStartRest}
                    style={({ pressed }) => [
                      styles.startRestButton,
                      { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.8 : 1 }
                    ]}
                  >
                    <Ionicons name="cafe-outline" size={15} color={isDark ? "#000000" : "#FFFFFF"} />
                    <Text style={[styles.startRestText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Start Rest Timer ({restTime}s)</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Bottom Complete Set Button */}
            <View style={[styles.fullModalBottom, { borderTopColor: colors.cardBorder, backgroundColor: colors.bg }]}>
              <Pressable
                onPress={async () => {
                  if (activeSet < sets) {
                    setActiveSet((prev) => prev + 1);
                    handleStartRest();
                  } else {
                    // Calculate stats and log workout to history
                    const durationMins = Math.max(1, Math.round(timerSeconds / 60) || 1);
                    const estimatedCal = Math.round(sets * reps * (weight > 0 ? 0.75 : 0.4) + durationMins * 5);

                    try {
                      await logCompletedWorkout({
                        planName: exercise?.name ? `${exercise.name} Workout` : 'Exercise Session',
                        dayName: exercise?.name || 'Exercise Session',
                        exerciseName: exercise?.name,
                        caloriesBurned: estimatedCal,
                        durationMinutes: durationMins,
                        exercisesCompletedCount: 1,
                        setsCount: sets,
                        repsCount: reps,
                        weight: weight,
                        image: exercise?.image || exercise?.thumbnail,
                        type: 'exercise',
                      });
                    } catch (e) {
                      console.warn('Error saving exercise log:', e);
                    }

                    setShowStartModal(false);
                    setIsTimerRunning(false);
                    setIsResting(false);
                    setTimerSeconds(0);
                    setActiveSet(1);

                    Alert.alert(
                      '🎉 Workout Complete!',
                      `Great effort! You finished ${sets} sets of ${exercise?.name || 'this exercise'} (~${estimatedCal} kcal in ${durationMins}m). Logged to your History!`,
                      [
                        { text: 'View History', onPress: () => router.push('/(tabs)/history') },
                        { text: 'OK' },
                      ]
                    );
                  }
                }}
                style={({ pressed }) => [
                  styles.completeSetButton,
                  { backgroundColor: isDark ? "#CCFF00" : "#0F172A", opacity: pressed ? 0.85 : 1 }
                ]}
              >
                <Text style={[styles.completeSetText, { color: isDark ? "#000000" : "#FFFFFF" }]}>
                  {activeSet < sets ? `Complete Set ${activeSet}` : 'Finish Workout 🎉'}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
  },
  errorSubtitle: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Top Bar ───────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  topBarTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ─── Hero Image & Video Player Area ────────────────────────────
  scrollContent: {
    paddingBottom: 80,
  },
  heroMediaContainer: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  videoBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  videoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroDifficultyBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  heroDifficultyText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ─── Exercise Info & Chips ─────────────────────────────────────
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  exerciseDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 16,
  },
  infoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#0D0D0D',
  },
  infoChipText: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '600',
  },
  subSectionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  muscleTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  muscleTagText: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '600',
  },

  // ─── Configuration Card ────────────────────────────────────────
  configCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  configTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  stepperLabel: {
    color: '#BBB',
    fontSize: 14,
    fontWeight: '500',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  stepperValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 8,
    paddingHorizontal: 10,
    minWidth: 60,
    height: 32,
    justifyContent: 'center',
  },
  stepperInput: {
    color: '#CCFF00',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  stepperUnit: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  configSummary: {
    marginTop: 12,
    alignItems: 'center',
    paddingTop: 8,
  },
  configSummaryText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },

  // ─── Calorie Estimator Card ────────────────────────────────────
  calorieCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  calorieValue: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: '800',
  },
  weightInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  weightInputLabel: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '500',
  },
  weightInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weightInputText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
    minWidth: 30,
    textAlign: 'right',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    color: '#666',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },

  // ─── Sections ──────────────────────────────────────────────────
  sectionMargin: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#0D0D0D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#CCFF0020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '800',
  },
  stepInstructionText: {
    flex: 1,
    color: '#DDD',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: '#AAA',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },

  // ─── Bottom Action Bar ─────────────────────────────────────────
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  startButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#CCFF00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },

  // ─── Modals ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContentCard: {
    backgroundColor: '#111',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },

  // ─── Active Workout Full Screen Modal ──────────────────────────
  fullModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  fullModalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  timerCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  activeSetLabel: {
    color: '#CCFF00',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeTargetText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  activeWeightText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#CCFF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    backgroundColor: '#0A0A0A',
  },
  timerText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerSubText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  timerButtonsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timerControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },

  // ─── Rest Timer Styles in Workout Tracker ──────────────────────
  restTimerCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    width: '90%',
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  restTimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  restTimerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  restCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  restCountdownText: {
    color: '#CCFF00',
    fontSize: 16,
    fontWeight: '800',
  },
  skipRestButton: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipRestText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  startRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  startRestText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  fullModalBottom: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  completeSetButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#CCFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeSetText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});
