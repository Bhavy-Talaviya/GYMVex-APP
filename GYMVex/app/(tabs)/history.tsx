import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  getWorkoutHistory,
  getUserPlanState,
  deleteWorkoutLog,
  clearWorkoutHistory,
} from '../../services/workoutPlanApi';
import { UserPlanState } from './plans';
import { useAppTheme } from '@/context/ThemeContext';

export interface CompletedWorkoutLog {
  _id?: string;
  planId?: string;
  planName?: string;
  dayNumber?: number;
  dayName?: string;
  completedAt?: string;
  caloriesBurned?: number;
  durationMinutes?: number;
  exercisesCompletedCount?: number;
  setsCount?: number;
  repsCount?: number;
  weight?: number;
  image?: string;
  type?: 'plan' | 'exercise' | string;
}

export default function WorkoutHistoryScreen() {
  const { colors, isDark } = useAppTheme();
  const [history, setHistory] = useState<CompletedWorkoutLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userState, setUserState] = useState<UserPlanState | null>(null);

  // Reload history and state every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const logs = await getWorkoutHistory();
      setHistory(logs || []);

      const state = await getUserPlanState();
      setUserState(state);
    } catch (err) {
      console.error('Error loading workout history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDeleteLog = (item: CompletedWorkoutLog) => {
    Alert.alert(
      'Delete Workout Log',
      `Are you sure you want to remove this ${item.dayName || 'workout'} from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteWorkoutLog(item._id || item.completedAt);
            setHistory(updated || []);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert(
      'Clear Workout History',
      'Are you sure you want to clear all completed workout logs? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearWorkoutHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  // Calculate dynamic totals from history
  const totalWorkouts = history.length;
  const totalCalories = history.reduce((sum, item) => sum + (Number(item.caloriesBurned) || 0), 0);
  const totalMinutes = history.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);

  // Format date string cleanly
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render history item card
  const renderHistoryItem = ({ item }: { item: CompletedWorkoutLog }) => {
    const isExercise = item.type === 'exercise';
    const thumbUri =
      item.image ||
      (isExercise
        ? 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&q=80&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80&auto=format&fit=crop');

    return (
      <View
        style={[
          styles.historyCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Exercise / Workout Image Thumbnail with checkmark badge */}
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: thumbUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.cardImageOverlay} />

          {/* Completed Checkmark Badge */}
          <View style={styles.completedCheckBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          </View>
        </View>

        {/* History Card Details */}
        <View style={styles.cardDetails}>
          <View style={styles.cardTopTitleRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: isExercise
                        ? (isDark ? '#082F49' : '#E0F2FE')
                        : (isDark ? '#14532D' : '#DCFCE7'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      {
                        color: isExercise
                          ? (isDark ? '#38BDF8' : '#0284C7')
                          : (isDark ? '#4ADE80' : '#15803D'),
                      },
                    ]}
                  >
                    {isExercise ? 'EXERCISE' : 'PLAN WORKOUT'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.dayTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.dayName || item.planName || 'Completed Workout'}
              </Text>
            </View>

            {/* Delete button */}
            <Pressable
              onPress={() => handleDeleteLog(item)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.deleteLogBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="time-outline" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(item.completedAt)}
            </Text>
          </View>

          {/* Bottom Row: Cal, Time, Exercises/Sets */}
          <View style={styles.cardBottomRow}>
            <View style={[styles.cardMetaBadge, { backgroundColor: isDark ? '#261111' : '#FEE2E2' }]}>
              <Ionicons name="flame" size={12} color="#EF4444" style={{ marginRight: 3 }} />
              <Text style={[styles.cardMetaText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                {item.caloriesBurned || 150} kcal
              </Text>
            </View>

            <View style={[styles.cardMetaBadge, { backgroundColor: isDark ? '#082F49' : '#E0F2FE' }]}>
              <Ionicons name="stopwatch-outline" size={12} color="#0284C7" style={{ marginRight: 3 }} />
              <Text style={[styles.cardMetaText, { color: isDark ? '#7DD3FC' : '#0369A1' }]}>
                {item.durationMinutes || 15}m
              </Text>
            </View>

            <View style={[styles.cardMetaBadge, { backgroundColor: isDark ? '#25163D' : '#F3E8FF' }]}>
              <Ionicons name="barbell-outline" size={12} color="#9333EA" style={{ marginRight: 3 }} />
              <Text style={[styles.cardMetaText, { color: isDark ? '#D8B4FE' : '#7E22CE' }]}>
                {item.setsCount ? `${item.setsCount} sets` : `${item.exercisesCompletedCount || 4} ex`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Workout History</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your completed fitness log</Text>
        </View>
        {history.length > 0 && (
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.clearBtn,
              { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>Clear All</Text>
          </Pressable>
        )}
      </View>

      {/* Active Program Badge */}
      {userState?.activePlanData && (
        <View style={[styles.activePlanBadge, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Ionicons name="trophy" size={14} color="#22C55E" style={{ marginRight: 6 }} />
          <Text style={[styles.activePlanBadgeText, { color: colors.textPrimary }]} numberOfLines={1}>
            ACTIVE: {userState.activePlanData.name} (Day {userState.currentDay || 1})
          </Text>
        </View>
      )}

      {/* ─── Performance Overview Stats Board ─── */}
      <View style={[styles.statsBoardCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.statsBoardHeader}>
          <View style={styles.statsBoardHeaderLeft}>
            <Ionicons name="stats-chart" size={16} color="#22C55E" />
            <Text style={[styles.statsBoardTitle, { color: colors.textPrimary }]}>Performance Overview</Text>
          </View>
          <View style={[styles.allTimeBadge, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.allTimeText, { color: colors.textSecondary }]}>All Time</Text>
          </View>
        </View>

        <View style={styles.statsGridRow}>
          {/* Workouts Stat Card */}
          <View style={[styles.statBox, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
              <Ionicons name="fitness" size={18} color="#22C55E" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalWorkouts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Workouts</Text>
          </View>

          {/* Total Cal Stat Card */}
          <View style={[styles.statBox, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
              <Ionicons name="flame" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalCalories > 999 ? totalCalories.toLocaleString() : totalCalories}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Cal</Text>
          </View>

          {/* Total Mins Stat Card */}
          <View style={[styles.statBox, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : '#E0F2FE' }]}>
              <Ionicons name="stopwatch" size={18} color="#0284C7" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalMinutes > 999 ? totalMinutes.toLocaleString() : totalMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Mins</Text>
          </View>
        </View>
      </View>

      {/* History Log List Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Completed Logs</Text>
        <Text style={[styles.logCountText, { color: colors.textSecondary }]}>{history.length} logged</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 40 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.iconCircleBig, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="calendar-outline" size={44} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Workouts Logged Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Complete your daily workout or any exercise to see your count, calories, and minutes tracked here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => item._id || `${item.completedAt}_${index}`}
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  activePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
  },
  activePlanBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsBoardCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsBoardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsBoardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsBoardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  allTimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  allTimeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  logCountText: {
    fontSize: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  completedCheckBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    justifyContent: 'center',
  },
  cardTopTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  deleteLogBtn: {
    padding: 6,
    borderRadius: 8,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  planTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 11,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardMetaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  iconCircleBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
