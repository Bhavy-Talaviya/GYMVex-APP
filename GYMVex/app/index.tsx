import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useWindowDimensions,
  Animated,
  Platform,
  StatusBar,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { getCurrentUserSession } from '@/services/userProfileApi';

// High-quality fitness images from Unsplash representing different training styles
const CAROUSEL_DATA = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    tag: 'POWER',
    title: 'Weight Training',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    tag: 'STRENGTH',
    title: 'Dumbbell Workout',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    tag: 'ATHLETICISM',
    title: 'Strength Training',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800&auto=format&fit=crop',
    tag: 'ENDURANCE',
    title: 'Cardio Workout',
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // FlatList and autoplay references
  const flatListRef = useRef<FlatList>(null);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUserInteracting = useRef(false);

  // Animated values for entrance stagger effect
  const carouselFade = useRef(new Animated.Value(0)).current;
  const carouselSlide = useRef(new Animated.Value(40)).current;

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  // Animated scroll value for interactive pagination dots
  const scrollX = useRef(new Animated.Value(0)).current;

  // Check active session immediately on startup
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const session = await getCurrentUserSession();
        if (session && session.isLoggedIn) {
          router.replace('/(tabs)/home');
          return;
        }
      } catch (err) {
        console.warn('Session check error:', err);
      }

      if (isMounted) {
        setCheckingAuth(false);

        Animated.stagger(250, [
          Animated.parallel([
            Animated.timing(carouselFade, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(carouselSlide, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(contentFade, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(contentSlide, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        startAutoplay();
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      stopAutoplay();
    };
  }, []);

  // Autoplay controls
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      if (isUserInteracting.current) return;

      const nextIndex = (currentIndex + 1) % CAROUSEL_DATA.length;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3800);
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  // Detect active slide when scrolling finishes
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);

    setCurrentIndex(newIndex);
    isUserInteracting.current = false;
    startAutoplay(); // Resume autoplay after interaction
  };

  const onScrollBeginDrag = () => {
    isUserInteracting.current = true;
    stopAutoplay(); // Pause autoplay during user manual swipe
  };

  // Navigates to the home tab screen or sign screen
  const handleGetStarted = async () => {
    const session = await getCurrentUserSession();
    if (session && session.isLoggedIn) {
      router.replace('/(tabs)/home');
    } else {
      router.push('/sign');
    }
  };

  // Renders a single image card in the carousel
  const renderCarouselItem = ({ item }: { item: typeof CAROUSEL_DATA[0] }) => {
    // Dynamic height calculation (65% of screen height)
    const cardHeight = height * 0.60;

    return (
      <View style={[styles.cardContainer, { width, height: cardHeight }]}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: item.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={500}
          />
          {/* Subtle gradient dark overlay at the bottom of the card for depth */}
          <View style={styles.overlayGradient} />

          {/* Premium tag overlay */}
          <View style={styles.tagCapsule}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        </View>
      </View>
    );
  };

  // While verifying session, show seamless dark splash screen (no onboarding flash)
  if (checkingAuth) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.splashContent}>
          <View style={styles.splashLogoBadge}>
            <Ionicons name="barbell" size={44} color="#B7D94C" />
          </View>
          <Text style={styles.splashBrandTitle}>GYMVEX</Text>
          <ActivityIndicator size="small" color="#B7D94C" style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Permanent sleek dark mode status bar for initial onboarding screen */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>

        {/* Top Section: Carousel area (takes up ~70% total screen room including dots) */}
        <Animated.View
          style={[
            styles.carouselWrapper,
            {
              opacity: carouselFade,
              transform: [{ translateY: carouselSlide }],
            },
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={CAROUSEL_DATA}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onScrollBeginDrag={onScrollBeginDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            decelerationRate="fast"
            style={styles.flatList}
          />

          {/* Pagination Dots (Positioned right below the image card inside the top container) */}
          <View style={styles.paginationContainer}>
            {CAROUSEL_DATA.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              // Animates width of active dot (expands horizontally)
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });

              // Animates opacity of dots (active is brighter)
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              // Animates color to primary muted lime accent when active
              const backgroundColor = scrollX.interpolate({
                inputRange,
                outputRange: ['#F4F3ED', '#B7D94C', '#F4F3ED'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor,
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Bottom Section: Text and CTA Button */}
        <SafeAreaView edges={['bottom']} style={styles.bottomSection}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: contentFade,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>Build Your Best Body</Text>
              <Text style={styles.subtitle}>
                Train smarter, track your progress, and achieve your fitness goals.
              </Text>
            </View>

            <View style={styles.buttonWrapper}>
              <Button title="Get Started" onPress={handleGetStarted} variant="primary" />
              <Pressable
                onPress={() => router.push({ pathname: '/sign', params: { mode: 'signin' } })}
                style={styles.signInLink}
              >
                <Text style={styles.signInLinkText}>
                  Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Premium pitch black dark background
  },
  carouselWrapper: {
    flex: 6.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flexGrow: 0,
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageCard: {
    width: '94%',
    height: '92%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#222222',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '35%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tagCapsule: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagText: {
    color: '#B7D94C', // GYMVex muted lime accent for tags
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginTop: 14,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomSection: {
    flex: 3.8,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#A0A0A0', // Muted text color for secondary readability
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  signInLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signInLinkText: {
    color: '#8E9288',
    fontSize: 14,
    fontWeight: '500',
  },
  signInHighlight: {
    color: '#B7D94C',
    fontWeight: '700',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoBadge: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: 'rgba(183, 217, 76, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(183, 217, 76, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashBrandTitle: {
    color: '#B7D94C',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
