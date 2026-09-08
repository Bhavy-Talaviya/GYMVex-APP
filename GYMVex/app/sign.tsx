// ═══════════════════════════════════════════════════════════════════════
// app/sign.tsx — GYMVex User Registration & Sign In Screen
// ═══════════════════════════════════════════════════════════════════════
// Minimalist, premium athletic auth screen with logo, inputs & action button.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/AppImage';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { registerUserApi, loginUserApi } from '@/services/userProfileApi';

export default function SignScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  // Toggle state: true = Create Account (Sign Up), false = Sign In
  const [isSignUp, setIsSignUp] = useState(params.mode !== 'signin');

  // Form input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Focus tracking for input border rings
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  // Smooth entrance animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Submit Handler ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          Alert.alert('Name Required', 'Please enter your full name to create an account.');
          setLoading(false);
          return;
        }

        const result = await registerUserApi(name, email, password);

        if (result.success) {
          router.replace('/(tabs)/home');
        } else {
          // If already registered, offer to switch to Sign In
          if (result.message && result.message.toLowerCase().includes('already exists')) {
            Alert.alert('Account Exists', result.message, [
              { text: 'Sign In', onPress: () => setIsSignUp(false) },
              { text: 'Cancel', style: 'cancel' },
            ]);
          } else {
            Alert.alert('Registration Failed', result.message || 'Failed to create account.');
          }
        }
      } else {
        const result = await loginUserApi(email, password);

        if (result.success) {
          router.replace('/(tabs)/home');
        } else {
          Alert.alert(
            'Access Denied',
            result.message || 'Account not found. Please create an account first.',
            [
              { text: 'Create Account', onPress: () => setIsSignUp(true) },
              { text: 'Try Again' },
            ]
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Athletic Background Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={600}
      />

      {/* Dark Gradient Overlay for Readability */}
      <View style={styles.gradientOverlay} />

      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Bar Navigation */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.replace('/')}
                style={({ pressed }) => [
                  styles.backBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="arrow-back" size={20} color="#F4F3ED" />
              </Pressable>
            </View>

            {/* Brand Logo & Title */}
            <Animated.View
              style={[
                styles.brandHeader,
                { opacity: fadeIn, transform: [{ translateY: slideUp }] },
              ]}
            >
              <View style={styles.logoBadge}>
                <Ionicons name="barbell" size={34} color="#B7D94C" />
              </View>
              <Text style={styles.brandTitle}>GYMVEX</Text>
              <Text style={styles.mainTitle}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={[
                styles.glassCard,
                { opacity: fadeIn, transform: [{ translateY: slideUp }] },
              ]}
            >
              {/* Segmented Mode Switcher */}
              <View style={styles.segmentContainer}>
                <Pressable
                  style={[
                    styles.segmentTab,
                    isSignUp && styles.segmentTabActive,
                  ]}
                  onPress={() => setIsSignUp(true)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSignUp ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    Create Account
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.segmentTab,
                    !isSignUp && styles.segmentTabActive,
                  ]}
                  onPress={() => setIsSignUp(false)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      !isSignUp ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    Sign In
                  </Text>
                </Pressable>
              </View>

              {/* Full Name Input (Create Account only) */}
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.inputBox,
                      focusedField === 'name' && styles.inputBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color={focusedField === 'name' ? '#B7D94C' : '#8E9288'}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Alex Johnson"
                      placeholderTextColor="#63675E"
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                      selectionColor="#B7D94C"
                    />
                  </View>
                </View>
              )}

              {/* Email Address Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === 'email' && styles.inputBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color={focusedField === 'email' ? '#B7D94C' : '#8E9288'}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="alex@gymvex.com"
                    placeholderTextColor="#63675E"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#B7D94C"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === 'password' && styles.inputBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={focusedField === 'password' ? '#B7D94C' : '#8E9288'}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••••••"
                    placeholderTextColor="#63675E"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    selectionColor="#B7D94C"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={19}
                      color="#8E9288"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Primary Action CTA Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.ctaButton,
                  {
                    backgroundColor: pressed ? '#A2C43E' : '#B7D94C',
                    opacity: loading ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#090A08" size="small" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#090A08" style={{ marginLeft: 8 }} />
                  </>
                )}
              </Pressable>

              {/* Bottom Toggle Link */}
              <Pressable
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchModeBtn}
              >
                <Text style={styles.switchModeText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.switchModeHighlight}>
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A08',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 10, 8, 0.91)',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  topBar: {
    paddingVertical: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Brand Header
  brandHeader: {
    alignItems: 'center',
    marginVertical: 18,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(183, 217, 76, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(183, 217, 76, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#B7D94C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  brandTitle: {
    color: '#B7D94C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
  },
  mainTitle: {
    color: '#F4F3ED',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  // Form Card
  glassCard: {
    backgroundColor: 'rgba(20, 23, 19, 0.88)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#2A2F25',
    padding: 22,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },

  // Segment Tab Switcher
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#111410',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2A2F25',
    marginBottom: 6,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#B7D94C',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#090A08',
  },
  segmentTextInactive: {
    color: '#9A9E94',
  },

  // Form Fields
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#F4F3ED',
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111410',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2F25',
    paddingHorizontal: 14,
    height: 52,
  },
  inputBoxFocused: {
    borderColor: '#B7D94C',
    backgroundColor: '#181C16',
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#F4F3ED',
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  eyeBtn: {
    padding: 4,
  },

  // Primary CTA Button
  ctaButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#B7D94C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  ctaText: {
    color: '#090A08',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  switchModeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  switchModeText: {
    color: '#8E9288',
    fontSize: 13,
    fontWeight: '500',
  },
  switchModeHighlight: {
    color: '#B7D94C',
    fontWeight: '700',
  },
});
