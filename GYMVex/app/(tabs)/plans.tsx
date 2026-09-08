// ═══════════════════════════════════════════════════════════════════════
// plans.tsx — Workout Plans Screen (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Allows users to browse, filter by difficulty & goal, search, and view
// personalized plan recommendations based on their user profile!
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchWorkoutPlans,
  fetchRecommendedPlans,
  getUserPlanState,
  updateUserProfile,
} from '../../services/workoutPlanApi';
import { useAppTheme } from '@/context/ThemeContext';

// Difficulty options
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Goal options
const GOALS = [
  'All',
  'Weight Loss',
  'Muscle Gain',
  'Strength',
  'General Fitness',
  'Flexibility',
  'Yoga',
];

export interface WorkoutPlanItem {
  _id?: string;
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  estimatedCalories?: number;
  exercises?: any[];
  restDays?: string[];
  image?: string;
  badge?: string;
}

export interface UserPlanState {
  activePlanData?: WorkoutPlanItem | null;
  status?: string;
  currentWeek?: number;
  currentDay?: number;
  startedAt?: string;
  userProfile?: { goal: string; difficulty: string };
  completedWorkouts?: any[];
}

export default function WorkoutPlansScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  // State management with explicit TypeScript types
  const [plans, setPlans] = useState<WorkoutPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [userPlanState, setUserPlanState] = useState<UserPlanState | null>(null);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Load plans & user data on screen focus or when filters change
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [selectedDifficulty, selectedGoal, searchQuery])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await fetchWorkoutPlans({
        difficulty: selectedDifficulty,
        goal: selectedGoal,
        search: searchQuery,
      });
      setPlans(fetchedPlans || []);

      const state = await getUserPlanState();
      setUserPlanState(state);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render individual plan card item
  const renderPlanCard = ({ item }: { item: WorkoutPlanItem }) => {
    const activeName = userPlanState?.activePlanData?.name?.toLowerCase() || '';
    const activeId = userPlanState?.activePlanData?._id || '';

    const isActive =
      (activeId && item._id && activeId === item._id) ||
      (activeName && item.name && activeName === item.name.toLowerCase());

    const restDaysList = item.restDays && item.restDays.length > 0 ? item.restDays : ['Wed', 'Sun'];

    return (
      <Pressable
        style={[styles.planCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={() =>
          router.push({
            pathname: '/plan-details',
            params: { planId: item._id || item.name },
          })
        }>
        <Image
          source={{
            uri:
              item.image ||
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay} />

        {/* Top Badges */}
        <View style={styles.cardBadgeContainer}>
          <View style={[styles.goalBadge, { backgroundColor: isDark ? '#CCFF00' : '#0F172A' }]}>
            <Text style={[styles.goalBadgeText, { color: isDark ? '#000000' : '#FFFFFF' }]}>{item.goal}</Text>
          </View>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyBadgeText}>{item.difficulty}</Text>
          </View>
        </View>

        {/* Active Status Badge if currently selected */}
        {isActive && (
          <View style={[styles.activeTag, { backgroundColor: isDark ? '#CCFF00' : '#10B981' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={[styles.activeTagText, { color: '#FFFFFF' }]}>Active Plan</Text>
          </View>
        )}

        {/* Card Body Info */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: colors.badgeBg }]}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={14} color="#0284C7" />
              <Text style={[styles.statText, { color: colors.textPrimary }]}>{item.durationWeeks || 4} Wks</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={14} color="#8B5CF6" />
              <Text style={[styles.statText, { color: colors.textPrimary }]}>{item.daysPerWeek || 4} Days/wk</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={14} color="#EF4444" />
              <Text style={[styles.statText, { color: colors.textPrimary }]}>{item.estimatedCalories || 350} Cal</Text>
            </View>
          </View>

          {/* Rest Days Quick Pill */}
          <View style={[styles.cardRestRow, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="moon-outline" size={12} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={[styles.cardRestLabel, { color: colors.textSecondary }]}>Rest Days:</Text>
            {restDaysList.map((day, idx) => (
              <View key={idx} style={[styles.cardRestChip, { backgroundColor: isDark ? '#293F0F' : '#E2E8F0' }]}>
                <Text style={[styles.cardRestChipText, { color: isDark ? '#CCFF00' : '#0F172A' }]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Workout Plans</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Personalized programs for every goal</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.iconFilterBtn,
            {
              backgroundColor: colors.badgeBg,
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          onPress={() => setShowFilterModal(true)}>
          <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search programs, goals..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Filters Section (Difficulty & Goal) */}
        <View style={styles.filterSectionContainer}>
          {/* Difficulty Filter Tabs */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DIFFICULTY LEVEL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {DIFFICULTIES.map((diff) => {
              const isActive = selectedDifficulty === diff;
              return (
                <Pressable
                  key={diff}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                      borderColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedDifficulty(diff)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Difficulty level: ${diff}`}>
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                      },
                    ]}>
                    {diff}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Goal Filter Pills */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 10 }]}>TARGET GOAL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {GOALS.map((g) => {
              const isActive = selectedGoal === g;
              return (
                <Pressable
                  key={g}
                  style={[
                    styles.goalChip,
                    {
                      backgroundColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                      borderColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedGoal(g)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Target goal: ${g}`}>
                  <Text
                    style={[
                      styles.goalChipText,
                      {
                        color: isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                      },
                    ]}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* All Plans Header */}
        <View style={styles.plansHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Available Programs</Text>
          <Text style={[styles.plansCountText, { color: colors.textSecondary }]}>{plans.length} plans</Text>
        </View>

        {/* Plans List */}
        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "#CCFF00" : "#0F172A"} style={{ marginVertical: 40 }} />
        ) : plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Plans Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try adjusting your filters or search terms.</Text>
          </View>
        ) : (
          <FlatList
            data={plans}
            renderItem={renderPlanCard}
            keyExtractor={(item, index) => item._id || item.name || String(index)}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filter Programs</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>DIFFICULTY LEVEL</Text>
            <View style={styles.modalOptionsGrid}>
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty === d;
                return (
                  <Pressable
                    key={d}
                    style={[
                      styles.modalOptionBtn,
                      {
                        backgroundColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                        borderColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedDifficulty(d)}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                      ]}>
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 16 }]}>TARGET GOAL</Text>
            <View style={styles.modalOptionsGrid}>
              {GOALS.map((g) => {
                const isSelected = selectedGoal === g;
                return (
                  <Pressable
                    key={g}
                    style={[
                      styles.modalOptionBtn,
                      {
                        backgroundColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                        borderColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedGoal(g)}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                      ]}>
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalFooterRow}>
              <Pressable
                style={[styles.modalResetBtn, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}
                onPress={() => {
                  setSelectedDifficulty('All');
                  setSelectedGoal('All');
                }}>
                <Text style={[styles.modalResetText, { color: colors.textPrimary }]}>Reset All</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalApplyBtn,
                  { backgroundColor: isDark ? '#CCFF00' : '#0F172A', opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => setShowFilterModal(false)}>
                <Text style={[styles.modalApplyText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Apply Filters</Text>
              </Pressable>
            </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  profileButtonText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterSectionContainer: {
    marginBottom: 8,
  },
  recommendationBanner: {
    backgroundColor: '#141E0A',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3E12',
    marginBottom: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  changeProfileText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationSub: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },
  recCard: {
    width: 165,
    height: 115,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#1E1E1E',
  },
  recImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  recOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  recContent: {
    padding: 10,
    justifyContent: 'flex-end',
    flex: 1,
  },
  recBadge: {
    color: '#CCFF00',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  recMeta: {
    color: '#CCCCCC',
    fontSize: 10,
    marginTop: 2,
  },
  sectionLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#141414',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  filterChipActive: {
    backgroundColor: '#CCFF00',
    borderColor: '#CCFF00',
  },
  filterChipText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  goalChip: {
    backgroundColor: '#111111',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  goalChipActive: {
    borderColor: '#CCFF00',
    backgroundColor: '#1B2A08',
  },
  goalChipText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  goalChipTextActive: {
    color: '#CCFF00',
    fontWeight: '700',
  },
  plansHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  plansCountText: {
    color: '#777777',
    fontSize: 12,
  },
  planCard: {
    backgroundColor: '#121212',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  goalBadge: {
    backgroundColor: '#CCFF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  goalBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444444',
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#CCFF00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#AAAAAA',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#DDDDDD',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#333333',
  },
  cardRestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172208',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#293C0E',
  },
  cardRestLabel: {
    color: '#AAAAAA',
    fontSize: 11,
    marginRight: 6,
  },
  cardRestChip: {
    backgroundColor: '#293F0F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  cardRestChipText: {
    color: '#CCFF00',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },
  iconFilterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalResetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalApplyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalApplyText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
