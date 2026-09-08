// ═══════════════════════════════════════════════════════════════════════
// home.tsx — Home Screen Dashboard (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Ultra-clean, premium athletic dashboard with full Light & Dark theme support.
// Features Hero Banner, Quick Action Grid, Workout Categories, Featured Programs,
// Daily Motivation, and Side Navigation Drawer.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  Animated,
  useWindowDimensions,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getUserProfileData, getCurrentUserSession, markFirstLoginCompleted } from '../../services/userProfileApi';
import { useAppTheme } from '@/context/ThemeContext';

// ─── Minimalist Motivation Slides (Only Image & Motivation Line) ────────
const MOTIVATION_SLIDES = [
  {
    id: '1',
    line: 'Transform your body, conquer your mind.',
    sub: 'Daily GYMVex Motivation',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '2',
    line: 'Consistency is what transforms average into extraordinary.',
    sub: 'Stay Committed',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    line: 'Push harder today if you want a stronger tomorrow.',
    sub: 'Break Your Limits',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '4',
    line: 'Your only limit is the one you set yourself.',
    sub: 'Unleash Your Strength',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
  },
];

// ─── Workout Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { id: '1', name: 'Strength', category: 'Chest', icon: 'barbell-outline' as const, lightColor: '#16A34A', darkColor: '#CCFF00', lightBg: '#F0FDF4', darkBg: '#1C2E05' },
  { id: '2', name: 'Cardio', category: 'Cardio', icon: 'heart-outline' as const, lightColor: '#DC2626', darkColor: '#FF6B6B', lightBg: '#FEF2F2', darkBg: '#331414' },
  { id: '3', name: 'HIIT', category: 'Cardio', icon: 'flash-outline' as const, lightColor: '#0284C7', darkColor: '#4ECDC4', lightBg: '#F0F9FF', darkBg: '#0A2E2B' },
  { id: '4', name: 'Yoga', category: 'Yoga', icon: 'leaf-outline' as const, lightColor: '#7C3AED', darkColor: '#A78BFA', lightBg: '#F5F3FF', darkBg: '#1F1738' },
  { id: '5', name: 'Boxing', category: 'Full Body', icon: 'fitness-outline' as const, lightColor: '#EA580C', darkColor: '#F97316', lightBg: '#FFF7ED', darkBg: '#331A05' },
];

// ─── Featured Programs ──────────────────────────────────────────────────
const FEATURED_WORKOUTS = [
  {
    id: '1',
    title: 'Beginner Fat Burner',
    category: 'Full Body',
    duration: '4 Weeks',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    goal: 'Weight Loss',
  },
  {
    id: '2',
    title: 'Muscle Hypertrophy',
    category: 'Chest & Arms',
    duration: '8 Weeks',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
    goal: 'Muscle Gain',
  },
  {
    id: '3',
    title: 'Heavy Power Strength',
    category: 'Full Body',
    duration: '6 Weeks',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    goal: 'Strength',
  },
  {
    id: '4',
    title: 'Mobility & Flexibility',
    category: 'Full Body',
    duration: '4 Weeks',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
    goal: 'Flexibility',
  },
];

// ─── Drawer Items Config ───────────────────────────────────────────────
const DRAWER_ITEMS = [
  { title: "Today's Workout", sub: 'Daily exercise checklist', route: '/(tabs)/today-workout', icon: 'fitness-outline' as const, lightColor: '#16A34A', darkColor: '#CCFF00', lightBg: '#DCFCE7', darkBg: '#1C2E05' },
  { title: 'Workout Plans', sub: 'Explore structured programs', route: '/(tabs)/plans', icon: 'calendar-outline' as const, lightColor: '#0D9488', darkColor: '#4ECDC4', lightBg: '#CCFBF1', darkBg: '#0A2E2B' },
  { title: 'Exercises Database', sub: 'Technique & form guide', route: '/(tabs)/exercises', icon: 'barbell-outline' as const, lightColor: '#7C3AED', darkColor: '#A78BFA', lightBg: '#EDE9FE', darkBg: '#1F1738' },
  { title: 'Workout History', sub: 'View session records', route: '/(tabs)/history', icon: 'stats-chart-outline' as const, lightColor: '#E11D48', darkColor: '#FF6B6B', lightBg: '#FFE4E6', darkBg: '#331414' },
  { title: 'Reminders & Alerts', sub: 'Streak & workout alerts', route: '/notification-settings', icon: 'notifications-outline' as const, lightColor: '#D97706', darkColor: '#FACC15', lightBg: '#FEF3C7', darkBg: '#332905' },
  { title: 'Profile & Settings', sub: 'Theme & account settings', route: '/profile-settings', icon: 'person-outline' as const, lightColor: '#4F46E5', darkColor: '#E2E8F0', lightBg: '#EEF2FF', darkBg: '#1E293B' },
];

export default function HomeScreen() {
  const { colors, radius, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const [pressedCategory, setPressedCategory] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [userName, setUserName] = useState<string>('Athlete');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // Left-to-Right Full Height Side Drawer Animation
  const drawerWidth = Math.min(width * 0.85, 340);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    loadProfileAvatar();
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: -drawerWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  // Fetch updated profile picture whenever home screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfileAvatar();
    }, [])
  );

  const loadProfileAvatar = async () => {
    try {
      const session: any = await getCurrentUserSession();
      if (session) {
        if (session.name) setUserName(session.name);
        if (session.email) setUserEmail(session.email);
        if (session.profileImage) setUserAvatar(session.profileImage);
        setIsFirstLogin(session.isFirstLogin === true || session.loginCount === 1);
      }
      const data: any = await getUserProfileData();
      if (data) {
        if (data.profileImage || session?.profileImage) {
          setUserAvatar(data.profileImage || session?.profileImage || '');
        }
        if (session?.name || data.name) {
          setUserName(session?.name || data.name || 'Athlete');
        }
        if (session?.email || data.email) {
          setUserEmail(session?.email || data.email || '');
        }
        if (data.isFirstLogin !== undefined || data.loginCount !== undefined) {
          setIsFirstLogin(data.isFirstLogin === true || data.loginCount === 1);
        }
      }
    } catch (e) {
      console.log('Error loading profile avatar for home:', e);
    }
  };

  // Entrance animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Workout Card Renderer ─────────────────────────────────────────
  const renderWorkoutCard = ({ item }: { item: typeof FEATURED_WORKOUTS[0] }) => {
    const cardWidth = width * 0.68;

    return (
      <Pressable
        onPress={() => router.push('/(tabs)/plans')}
        style={({ pressed }) => [
          styles.workoutCard,
          {
            width: cardWidth,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.workoutCardImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.workoutCardOverlay} />
        <View style={styles.workoutCardContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.workoutLevelBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.workoutLevelText, { color: colors.accentText }]}>{item.level}</Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>{item.goal}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.workoutCardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.workoutCardMeta}>
              <Ionicons name="calendar-outline" size={13} color="#E2E8F0" />
              <Text style={styles.workoutCardMetaText}>{item.duration}</Text>
              <Ionicons name="barbell-outline" size={13} color="#E2E8F0" style={{ marginLeft: 12 }} />
              <Text style={styles.workoutCardMetaText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const bannerWidth = width - 32;
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const heroListRef = useRef<FlatList>(null);

  // Auto-slide hero motivation carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => {
        const next = (prev + 1) % MOTIVATION_SLIDES.length;
        heroListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [bannerWidth]);

  // Render Minimalist Hero Motivation Card (Only Image & Motivation Line)
  const renderMotivationSlide = ({ item }: { item: typeof MOTIVATION_SLIDES[0] }) => (
    <View
      key={item.id}
      style={[
        styles.heroSlideCard,
        {
          width: bannerWidth,
          borderRadius: radius.card,
          borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
            android: { elevation: 4 },
          }),
        },
      ]}>
      <Image
        source={{ uri: item.image }}
        style={styles.heroSlideImage}
        contentFit="cover"
        contentPosition="center"
        priority="high"
        cachePolicy="memory-disk"
        transition={200}
      />
      <View style={styles.heroSlideOverlay} />

      <View style={styles.heroSlideContent}>
        <View style={styles.heroQuoteIconWrap}>
          <Ionicons name="sparkles" size={15} color="#FFFFFF" />
        </View>

        <View style={{ marginTop: 'auto' }}>
          <Text style={styles.heroMotivationLine} numberOfLines={2}>
            "{item.line}"
          </Text>
          <Text style={styles.heroMotivationSub}>{item.sub}</Text>
        </View>
      </View>
    </View>
  );

  // Quick action items with curated light and dark colors
  const quickActions = [
    { title: "Today's Workout", sub: 'Daily exercise checklist', route: '/(tabs)/today-workout', icon: 'fitness' as const, color: isDark ? '#CCFF00' : '#16A34A', bg: isDark ? '#1C2E05' : '#DCFCE7' },
    { title: 'Workout Plans', sub: 'Explore 6+ programs', route: '/(tabs)/plans', icon: 'calendar' as const, color: isDark ? '#4ECDC4' : '#0D9488', bg: isDark ? '#0A2E2B' : '#CCFBF1' },
    { title: 'Exercises', sub: 'Form & instructions', route: '/(tabs)/exercises', icon: 'barbell' as const, color: isDark ? '#A78BFA' : '#7C3AED', bg: isDark ? '#1F1738' : '#EDE9FE' },
    { title: 'Workout History', sub: 'View session logs', route: '/(tabs)/history', icon: 'stats-chart' as const, color: isDark ? '#FF6B6B' : '#E11D48', bg: isDark ? '#331414' : '#FFE4E6' },
    { title: 'Reminders', sub: 'Daily & workout alerts', route: '/notification-settings', icon: 'notifications' as const, color: isDark ? '#FACC15' : '#D97706', bg: isDark ? '#332905' : '#FEF3C7' },
    { title: 'Profile & Settings', sub: 'Manage metrics & account', route: '/profile-settings', icon: 'person' as const, color: isDark ? '#E2E8F0' : '#4F46E5', bg: isDark ? '#1E293B' : '#EEF2FF' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* ─── Header ──────────────────────────────────────────── */}
          <Animated.View style={[styles.header, { opacity: headerFade }]}>
            <Pressable
              onPress={openDrawer}
              style={({ pressed }) => [
                styles.hamburgerBtn,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.7 : 1,
                  ...Platform.select({
                    ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 6 },
                    android: { elevation: 2 },
                  }),
                },
              ]}>
              <Ionicons name="menu-outline" size={22} color={colors.textPrimary} />
            </Pressable>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {isFirstLogin ? 'Welcome 👋' : 'Welcome Back 👋'}
              </Text>
              <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                {userName || 'Athlete'}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/profile-settings')}
              style={({ pressed }) => [
                styles.profileButton,
                { opacity: pressed ? 0.85 : 1 },
              ]}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={[styles.headerAvatarImg, { borderColor: '#22C55E' }]} />
              ) : (
                <View style={[styles.defaultAvatarWrap, { backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: '#22C55E' }]}>
                  <Ionicons name="person" size={20} color="#22C55E" />
                </View>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View style={{ opacity: contentFade }}>

            {/* ─── Minimalist Motivation Carousel (Image & Quote Only) ── */}
            <View style={styles.heroCarouselContainer}>
              <FlatList
                ref={heroListRef}
                data={MOTIVATION_SLIDES}
                renderItem={renderMotivationSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={bannerWidth}
                snapToAlignment="center"
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  length: bannerWidth,
                  offset: bannerWidth * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
                  if (newIndex >= 0 && newIndex < MOTIVATION_SLIDES.length) {
                    setActiveHeroIndex(newIndex);
                  }
                }}
              />

              {/* Clean Minimalist Pagination Dots */}
              <View style={styles.heroPaginationRow}>
                {MOTIVATION_SLIDES.map((_, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      heroListRef.current?.scrollToIndex({ index: idx, animated: true });
                      setActiveHeroIndex(idx);
                    }}
                    style={[
                      styles.heroPaginationDot,
                      activeHeroIndex === idx
                        ? styles.heroPaginationDotActive
                        : styles.heroPaginationDotInactive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* ─── Quick Features Navigation Grid ────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Explore Features</Text>
            </View>

            <View style={styles.quickGrid}>
              {quickActions.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [
                    styles.gridItem,
                    {
                      opacity: pressed ? 0.85 : 1,
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                      borderRadius: radius.large,
                      ...Platform.select({
                        ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.25 : 0.05, shadowRadius: 8 },
                        android: { elevation: isDark ? 2 : 1.5 },
                      }),
                    },
                  ]}>
                  <View style={[styles.gridIconWrap, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.gridItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.gridItemSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                </Pressable>
              ))}
            </View>

            {/* ─── Categories Horizontal Scroll ──────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categories</Text>
              <Pressable
                onPress={() => router.push({ pathname: '/exercises', params: { category: 'All' } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Text style={[styles.seeAllText, { color: colors.accent }]}>See All</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}>
              {CATEGORIES.map((cat) => {
                const catColor = isDark ? cat.darkColor : cat.lightColor;
                const catBg = isDark ? cat.darkBg : cat.lightBg;
                const isPressed = pressedCategory === cat.id;

                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => router.push({ pathname: '/exercises', params: { category: cat.category } })}
                    onPressIn={() => setPressedCategory(cat.id)}
                    onPressOut={() => setPressedCategory(null)}
                    style={[
                      styles.categoryCard,
                      {
                        borderColor: isPressed ? catColor : colors.cardBorder,
                        backgroundColor: isPressed ? catBg : colors.cardBg,
                        ...Platform.select({
                          ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 6 },
                          android: { elevation: 1.5 },
                        }),
                      },
                    ]}>
                    <View style={[styles.categoryIconWrap, { backgroundColor: catBg }]}>
                      <Ionicons name={cat.icon} size={18} color={catColor} />
                    </View>
                    <Text style={[styles.categoryName, { color: isPressed ? catColor : colors.textPrimary }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ─── Featured Programs Carousel ────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Programs</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/plans')}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Text style={[styles.seeAllText, { color: colors.accent }]}>View All</Text>
              </Pressable>
            </View>

            <FlatList
              data={FEATURED_WORKOUTS}
              renderItem={renderWorkoutCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.workoutListContent}
              ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
            />

            {/* ─── Daily Fitness Motivation Quote ────────────────── */}
            <View style={[
              styles.quoteCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                ...Platform.select({
                  ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 6 },
                  android: { elevation: 1.5 },
                }),
              },
            ]}>
              <View style={[styles.quoteIconWrap, { backgroundColor: isDark ? '#1C2E05' : '#DCFCE7' }]}>
                <Ionicons name="sparkles" size={20} color={isDark ? '#CCFF00' : '#16A34A'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.quoteTitle, { color: isDark ? '#CCFF00' : '#15803D' }]}>Daily Fitness Quote</Text>
                <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                  "Consistency is what transforms average into extraordinary. Show up every day!"
                </Text>
              </View>
            </View>

            <View style={{ height: 32 }} />
          </Animated.View>
        </ScrollView>

        {/* ─── Left-to-Right Full Height Side Drawer Navigation Modal ─── */}
        <Modal visible={menuVisible} animationType="none" transparent onRequestClose={closeDrawer}>
          <View style={StyleSheet.absoluteFill}>
            {/* Dimmed Overlay Backdrop */}
            <Animated.View style={[styles.drawerOverlayBg, { opacity: overlayAnim }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
            </Animated.View>

            {/* Full Height Left to Right Sliding Panel */}
            <Animated.View
              style={[
                styles.fullDrawerPanel,
                {
                  width: drawerWidth,
                  backgroundColor: colors.drawerBg,
                  borderRightColor: colors.cardBorder,
                  transform: [{ translateX: drawerAnim }],
                },
              ]}>
              <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>

                {/* Drawer Profile Header */}
                <View style={[styles.drawerHeaderBox, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.drawerProfileRow}>
                    <Pressable
                      onPress={() => {
                        closeDrawer();
                        setTimeout(() => router.push('/profile-settings'), 150);
                      }}
                      style={{ position: 'relative' }}>
                      {userAvatar ? (
                        <Image source={{ uri: userAvatar }} style={[styles.drawerAvatarImg, { borderColor: '#22C55E' }]} />
                      ) : (
                        <View style={[styles.drawerDefaultAvatar, { backgroundColor: isDark ? '#14532D40' : '#DCFCE7', borderColor: '#22C55E' }]}>
                          <Ionicons name="person" size={24} color="#22C55E" />
                        </View>
                      )}
                    </Pressable>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.drawerUserName, { color: colors.textPrimary }]} numberOfLines={1}>{userName}</Text>
                      <Text style={[styles.drawerUserSub, { color: colors.textSecondary }]} numberOfLines={1}>{userEmail}</Text>
                    </View>
                    <Pressable onPress={closeDrawer} style={[styles.drawerCloseCircleBtn, { backgroundColor: colors.badgeBg, borderColor: colors.cardBorder }]}>
                      <Ionicons name="close" size={18} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                </View>

                {/* Navigation Items List */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16 }}>
                  <Text style={[styles.drawerSectionLabel, { color: colors.accent }]}>NAVIGATION MENU</Text>

                  {DRAWER_ITEMS.map((item, idx) => {
                    const itemColor = isDark ? item.darkColor : item.lightColor;
                    const itemBg = isDark ? item.darkBg : item.lightBg;

                    return (
                      <Pressable
                        key={idx}
                        style={({ pressed }) => [
                          styles.drawerNavItem,
                          {
                            backgroundColor: colors.cardBg,
                            borderColor: colors.cardBorder,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={() => {
                          closeDrawer();
                          setTimeout(() => router.push(item.route as any), 150);
                        }}>
                        <View style={[styles.drawerItemIconWrap, { backgroundColor: itemBg }]}>
                          <Ionicons name={item.icon} size={20} color={itemColor} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.drawerItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                          <Text style={[styles.drawerItemSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Drawer Footer */}
                <View style={[styles.drawerFooter, { backgroundColor: colors.cardBg, borderTopColor: colors.cardBorder }]}>
                  <Ionicons name="flash" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.drawerFooterText, { color: colors.textSecondary }]}>GYMVex Pro • Unleash Your Potential</Text>
                </View>

              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  profileButton: {
    padding: 2,
  },
  headerAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  defaultAvatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCarouselContainer: {
    marginBottom: 20,
  },
  heroSlideCard: {
    height: 190,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    backgroundColor: '#0F172A',
  },
  heroSlideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroSlideOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroSlideContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  heroQuoteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  heroMotivationLine: {
    color: '#FFFFFF',
    fontSize: 17.5,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  heroMotivationSub: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroPaginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  heroPaginationDot: {
    height: 5,
    borderRadius: 3,
  },
  heroPaginationDotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroPaginationDotActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  gridItem: {
    width: '48%',
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridItemSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  categoriesScroll: {
    paddingBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
  },
  workoutListContent: {
    paddingBottom: 20,
  },
  workoutCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  workoutCardImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  workoutCardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  workoutCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  workoutLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  workoutLevelText: {
    fontSize: 10,
    fontWeight: '800',
  },
  goalBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  goalBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  workoutCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  workoutCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutCardMetaText: {
    color: '#E2E8F0',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  quoteCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    marginTop: 4,
    alignItems: 'center',
  },
  quoteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  drawerOverlayBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  fullDrawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 6, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  drawerHeaderBox: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  drawerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#22C55E',
  },
  drawerDefaultAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '800',
  },
  drawerUserSub: {
    fontSize: 12,
    marginTop: 2,
  },
  drawerCloseCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  drawerItemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  drawerFooterText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
