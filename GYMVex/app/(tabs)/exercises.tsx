// ═══════════════════════════════════════════════════════════════════════
// exercises.tsx — Exercise Explorer Screen
// ═══════════════════════════════════════════════════════════════════════
// This screen lets users browse, search, and filter exercises.
// All data comes from the backend API — nothing is hardcoded here.
//
// Features:
// - Search with debounce (waits 500ms before searching)
// - Filter by category, muscle, equipment, difficulty
// - Infinite scrolling (loads more when you reach the bottom)
// - Pull-to-refresh
// - Loading skeleton while data loads
// - Favorite exercises (saved locally)
// - Recent exercises (last viewed)
// - Error state with retry button
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';

import { fetchAllExercises, searchExercises } from '../../services/exerciseApi';

// ═══════════════════════════════════════════════════════════════════════
// FILTER OPTIONS — These match the backend enum values
// ═══════════════════════════════════════════════════════════════════════

// Categories for the filter
const CATEGORIES = [
  'All', 'Favorites', 'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps',
  'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio',
  'Full Body', 'Stretching', 'Yoga',
];

// Muscle groups for the muscle filter
const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Core', 'Calves',
  'Forearms', 'Obliques',
];

// Equipment options
const EQUIPMENT_LIST = [
  'All', 'Bodyweight', 'Dumbbell', 'Barbell', 'Machine',
  'Resistance Band', 'Kettlebell', 'Cable', 'Bench', 'None',
];

// Difficulty levels
const DIFFICULTY_LIST = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Exercise types
const EXERCISE_TYPES = ['All', 'Strength', 'Cardio', 'Flexibility'];

// Colors for difficulty badges
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#4ECDC4',
  Intermediate: '#CCFF00',
  Advanced: '#FF6B6B',
};

// ═══════════════════════════════════════════════════════════════════════
// SKELETON LOADER COMPONENT — Shows while exercises are loading
// ═══════════════════════════════════════════════════════════════════════
// This creates a pulsing placeholder that looks like an exercise card

const SkeletonCard = () => {
  // Create a pulsing animation
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Loop the animation: fade in and out
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop(); // cleanup when component unmounts
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      {/* Image placeholder */}
      <View style={styles.skeletonImage} />
      {/* Text placeholders */}
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonMeta} />
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// EXERCISE CARD COMPONENT — Displays one exercise in the list
// ═══════════════════════════════════════════════════════════════════════
// Props:
//   exercise   — the exercise data object
//   isFavorite — whether this exercise is in favorites
//   onPress    — called when user taps the card
//   onFavorite — called when user taps the heart icon

type ExerciseCardProps = {
  exercise: any;
  isFavorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
};

const ExerciseCard = ({ exercise, isFavorite, onPress, onFavorite }: ExerciseCardProps) => {
  const { colors, isDark } = useAppTheme();
  // Get the color for the difficulty badge
  const diffColor = DIFFICULTY_COLORS[exercise.difficulty] || '#CCFF00';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseCard,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Exercise Image */}
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: exercise.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardImageOverlay} />

        {/* Difficulty Badge — top left of image */}
        <View style={[styles.diffBadge, { backgroundColor: `${diffColor}25`, borderColor: `${diffColor}40` }]}>
          <Text style={[styles.diffBadgeText, { color: diffColor }]}>
            {exercise.difficulty}
          </Text>
        </View>

        {/* Favorite Button — top right of image */}
        <Pressable
          onPress={onFavorite}
          hitSlop={10}
          style={styles.favButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
          />
        </Pressable>
      </View>

      {/* Exercise Details */}
      <View style={styles.cardDetails}>
        {/* Exercise Name */}
        <Text style={[styles.cardName, { color: colors.textPrimary }]} numberOfLines={1}>
          {exercise.name}
        </Text>

        {/* Muscle Groups */}
        <Text style={[styles.cardMuscle, { color: colors.textSecondary }]} numberOfLines={1}>
          {exercise.muscleGroups?.join(', ')}
        </Text>

        {/* Bottom Row: Equipment and Calories */}
        <View style={styles.cardBottomRow}>
          {/* Equipment */}
          <View style={styles.cardMetaItem}>
            <Ionicons name="barbell-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>{exercise.equipment}</Text>
          </View>

          {/* Calories */}
          <View style={styles.cardMetaItem}>
            <Ionicons name="flame-outline" size={12} color="#FF6B6B" />
            <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>
              {exercise.caloriesPerMinute} cal/min
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// FILTER MODAL COMPONENT — Full-screen filter picker
// ═══════════════════════════════════════════════════════════════════════

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: any;
  onApply: (filters: any) => void;
};

const FilterModal = ({ visible, onClose, filters, onApply }: FilterModalProps) => {
  const { colors, isDark } = useAppTheme();
  // Local state for the modal — so user can change filters before applying
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when modal opens with new filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Helper to render a filter section with chips
  const renderFilterSection = (title: string, options: string[], filterKey: string) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.filterChipsWrap}>
        {options.map((option) => {
          // Check if this option is currently selected
          const isSelected = localFilters[filterKey] === option ||
            (option === 'All' && !localFilters[filterKey]);

          return (
            <Pressable
              key={option}
              onPress={() => {
                // Set the filter value (or clear it if "All" is selected)
                setLocalFilters({
                  ...localFilters,
                  [filterKey]: option === 'All' ? '' : option,
                });
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBg,
                  borderColor: isSelected ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filters</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Filter Sections */}
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {renderFilterSection('Category', CATEGORIES, 'category')}
            {renderFilterSection('Muscle Group', MUSCLE_GROUPS, 'muscleGroup')}
            {renderFilterSection('Equipment', EQUIPMENT_LIST, 'equipment')}
            {renderFilterSection('Difficulty', DIFFICULTY_LIST, 'difficulty')}
            {renderFilterSection('Exercise Type', EXERCISE_TYPES, 'exerciseType')}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Buttons */}
          <View style={[styles.modalBottom, { borderTopColor: colors.cardBorder, backgroundColor: colors.bg }]}>
            {/* Clear All button */}
            <Pressable
              onPress={() => setLocalFilters({})}
              style={({ pressed }) => [
                styles.clearButton,
                { borderColor: colors.cardBorder, backgroundColor: colors.cardBg, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear All</Text>
            </Pressable>

            {/* Apply button */}
            <Pressable
              onPress={() => {
                onApply(localFilters);
                onClose();
              }}
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: isDark ? '#CCFF00' : '#0F172A', opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={[styles.applyButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Apply Filters</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXERCISE EXPLORER SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function ExercisesScreen() {
  const { colors, isDark } = useAppTheme();
  // ─── State Variables ──────────────────────────────────────────────
  const [exercises, setExercises] = useState<any[]>([]);  // list of exercises
  const [loading, setLoading] = useState(true);            // first load
  const [loadingMore, setLoadingMore] = useState(false);   // loading next page
  const [refreshing, setRefreshing] = useState(false);     // pull-to-refresh
  const [error, setError] = useState('');                   // error message
  const [searchQuery, setSearchQuery] = useState('');       // search text
  const [page, setPage] = useState(1);                     // current page
  const [totalPages, setTotalPages] = useState(1);         // total pages from API
  const [filters, setFilters] = useState<any>({});          // active filters
  const [showFilters, setShowFilters] = useState(false);    // filter modal visible
  const [favorites, setFavorites] = useState<string[]>([]); // list of favorite exercise IDs
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]); // list of favorited exercise objects
  const [recentExercises, setRecentExercises] = useState<any[]>([]); // recently viewed

  // ─── Refs ─────────────────────────────────────────────────────────
  const searchTimer = useRef<any>(null);  // timer for debounce
  const fadeIn = useRef(new Animated.Value(0)).current;  // entrance animation

  const routeParams = useLocalSearchParams<{ category?: string }>();

  // ─── Sync route category parameter from Home navigation ─────────────
  useEffect(() => {
    if (routeParams?.category !== undefined) {
      setFilters((prev: any) => ({
        ...prev,
        category: routeParams.category === 'All' ? '' : routeParams.category,
      }));
      setPage(1);
    }
  }, [routeParams?.category]);

  // ─── Entrance Animation ───────────────────────────────────────────
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // LOAD EXERCISES — called on first load and when filters change
  // ═══════════════════════════════════════════════════════════════════

  const loadExercises = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      // Show loading indicator
      if (pageNum === 1 && !isRefresh) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);
      setError('');

      let result;

      // If category filter is "Favorites", show favorited items locally
      if (filters.category === 'Favorites') {
        result = {
          exercises: favoriteItems,
          totalPages: 1,
          totalExercises: favoriteItems.length,
        };
      } else if (searchQuery.trim()) {
        result = await searchExercises(searchQuery.trim(), pageNum, 10);
      } else {
        result = await fetchAllExercises(pageNum, 10, filters, 'name', 'asc');
      }

      // If first page, replace the list; otherwise, add to the list
      if (pageNum === 1) {
        setExercises(result.exercises);
      } else {
        // Add new exercises to the existing list (infinite scroll)
        setExercises((prev: any[]) => [...prev, ...result.exercises]);
      }

      setTotalPages(result.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [searchQuery, filters, favoriteItems]);

  // ─── Load exercises on first render and when filters change ───────
  useEffect(() => {
    loadExercises(1);
  }, [filters]);

  // ═══════════════════════════════════════════════════════════════════
  // DEBOUNCED SEARCH — waits 500ms after user stops typing
  // ═══════════════════════════════════════════════════════════════════

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadExercises(1);
    }, 500);
  };

  // ═══════════════════════════════════════════════════════════════════
  // INFINITE SCROLL — load more when user reaches the bottom
  // ═══════════════════════════════════════════════════════════════════

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages && filters.category !== 'Favorites') {
      loadExercises(page + 1);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PULL TO REFRESH — reload from page 1
  // ═══════════════════════════════════════════════════════════════════

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadExercises(1, true);
  };

  // ═══════════════════════════════════════════════════════════════════
  // TOGGLE FAVORITE — add or remove exercise from favorites
  // ═══════════════════════════════════════════════════════════════════

  const toggleFavorite = (exercise: any) => {
    const exerciseId = exercise._id;
    setFavorites((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });

    setFavoriteItems((prev) => {
      const exists = prev.some((item) => item._id === exerciseId);
      if (exists) {
        return prev.filter((item) => item._id !== exerciseId);
      } else {
        return [exercise, ...prev];
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATE TO EXERCISE DETAILS
  // ═══════════════════════════════════════════════════════════════════

  const handleExercisePress = (exercise: any) => {
    // Add to recent exercises (keep only last 10)
    setRecentExercises((prev) => {
      const filtered = prev.filter((e: any) => e._id !== exercise._id);
      return [exercise, ...filtered].slice(0, 10);
    });

    // Navigate to the exercise details screen
    router.push({
      pathname: '/exercise-details',
      params: { id: exercise._id },
    });
  };

  // ═══════════════════════════════════════════════════════════════════
  // APPLY FILTERS from the filter modal
  // ═══════════════════════════════════════════════════════════════════

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    // loadExercises will be called by the useEffect that watches filters
  };

  // Count how many filters are active (for the badge number)
  const activeFilterCount = Object.values(filters).filter((v) => v).length;

  // ═══════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Render one exercise card in the FlatList
  const renderExerciseCard = ({ item }: { item: any }) => (
    <ExerciseCard
      exercise={item}
      isFavorite={favorites.includes(item._id)}
      onPress={() => handleExercisePress(item)}
      onFavorite={() => toggleFavorite(item)}
    />
  );

  // Render loading skeleton (shown during first load)
  const renderSkeleton = () => (
    <View style={styles.skeletonList}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );

  // Render error state with retry button
  const renderError = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cloud-offline-outline" size={48} color="#FF6B6B" />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <Pressable
        onPress={() => loadExercises(1)}
        style={({ pressed }) => [styles.retryButton, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );

  // Render empty state
  const renderEmpty = () => {
    if (filters.category === 'Favorites') {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color="#FF6B6B" />
          <Text style={styles.emptyTitle}>No favorite exercises yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any exercise card to save your favorites here.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={48} color="#333" />
        <Text style={styles.emptyTitle}>No exercises found</Text>
        <Text style={styles.emptySubtitle}>
          Try a different search or clear your filters
        </Text>
      </View>
    );
  };

  // Render footer (loading indicator for infinite scroll)
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#CCFF00" />
        <Text style={styles.loadingFooterText}>Loading more exercises...</Text>
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeIn }}>

          {/* ─── Header ──────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Exercises</Text>
            {/* Filter button with hamburger icon matching home page design */}
            <Pressable
              onPress={() => setShowFilters(true)}
              style={({ pressed }) => [
                styles.filterButton,
                { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="menu-outline" size={22} color={isDark ? "#CCFF00" : "#0F172A"} />
              {/* Show badge if filters are active */}
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* ─── Search Bar ──────────────────────────────────────── */}
          <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              selectionColor={isDark ? "#CCFF00" : "#0F172A"}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setPage(1);
                  loadExercises(1);
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* ─── Quick Category Chips (horizontal scroll) ──────── */}
          <View style={styles.quickFiltersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickFiltersScroll}
            >
              {CATEGORIES.map((cat) => {
                const isActive = filters.category === cat || (cat === 'All' && !filters.category);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      const newFilters = { ...filters, category: cat === 'All' ? '' : cat };
                      setFilters(newFilters);
                      setPage(1);
                    }}
                    style={[
                      styles.quickChip,
                      {
                        backgroundColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.badgeBg,
                        borderColor: isActive ? (isDark ? '#CCFF00' : '#0F172A') : colors.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.quickChipText, { color: isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ─── Recent Exercises Section ─────────────────────────── */}
          {recentExercises.length > 0 && !searchQuery.trim() && filters.category !== 'Favorites' && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent</Text>
                <Pressable onPress={() => setRecentExercises([])}>
                  <Text style={[styles.clearText, { color: colors.textSecondary }]}>Clear</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScroll}>
                {recentExercises.map((exercise: any) => (
                  <Pressable
                    key={exercise._id}
                    onPress={() => handleExercisePress(exercise)}
                    style={({ pressed }) => [styles.recentCard, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View style={[styles.recentImageWrap, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                      <Image
                        source={{ uri: exercise.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100' }}
                        style={styles.recentImage}
                        contentFit="cover"
                      />
                    </View>
                    <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={1}>{exercise.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}


          {/* ─── Exercise List ───────────────────────────────────── */}
          <View style={styles.listFlexContainer}>
            {loading ? (
              // Show skeleton while loading
              renderSkeleton()
            ) : error ? (
              // Show error state
              renderError()
            ) : (
              // Show the exercise list
              <FlatList
                data={exercises}
                renderItem={renderExerciseCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.exerciseList}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                // Infinite scrolling — load more when near the end
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                // Pull-to-refresh
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#CCFF00"
                    colors={['#CCFF00']}
                  />
                }
              />
            )}
          </View>

        </Animated.View>
      </SafeAreaView>

      {/* ─── Filter Modal ──────────────────────────────────────── */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ─── Main Container ─────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ─── Header ─────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ─── Search Bar ─────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },

  // ─── Quick Filter Chips ─────────────────────────────────────────
  quickFiltersWrapper: {
    height: 46,
    marginBottom: 10,
  },
  quickFiltersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ─── Recent Exercises ───────────────────────────────────────────
  recentSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recentCard: {
    alignItems: 'center',
    width: 72,
  },
  recentImageWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 2,
  },
  recentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  recentName: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  favBadgeIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Exercise List Container ─────────────────────────────────────
  listFlexContainer: {
    flex: 1,
  },
  exerciseList: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#0D0D0D',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  cardImageContainer: {
    width: 95,
    height: 105,
    overflow: 'hidden',
  },
  cardImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  diffBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  cardMuscle: {
    color: '#777',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardMetaText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
  },
  cardArrow: {
    paddingRight: 12,
  },

  // ─── Skeleton Loading ───────────────────────────────────────────
  skeletonList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#0D0D0D',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    height: 105,
  },
  skeletonImage: {
    width: 95,
    height: 105,
    backgroundColor: '#1A1A1A',
  },
  skeletonContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
  },
  skeletonSubtitle: {
    height: 10,
    width: '50%',
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
  },
  skeletonMeta: {
    height: 10,
    width: '40%',
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
  },

  // ─── Empty State ────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#555',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Loading Footer (infinite scroll) ───────────────────────────
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingFooterText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },

  // ─── Filter Modal ──────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 20,
  },
  filterSectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBottom: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#CCFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
