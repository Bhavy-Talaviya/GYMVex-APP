import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Pressable,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: Animated.WithAnimatedValue<ViewStyle>;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  activeOpacity?: number;
}

export function Button({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  // Animation scale value
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Handle press in (shrink slightly)
  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle press out (restore to normal size)
  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Determine styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={{ width: '100%' }}
    >
      <Animated.View
        style={[
          styles.baseButton,
          getButtonStyles(),
          disabled && styles.disabledButton,
          style,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.6 : opacity,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#090A08' : '#B7D94C'}
            size="small"
          />
        ) : (
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#B7D94C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Variant styles
  primaryButton: {
    backgroundColor: '#B7D94C', // GYMVex Brand Muted Lime Accent
  },
  primaryText: {
    color: '#090A08', // High-contrast dark text on muted lime
  },
  secondaryButton: {
    backgroundColor: '#151814',
    borderWidth: 1,
    borderColor: '#292D25',
  },
  secondaryText: {
    color: '#F4F3ED',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B7D94C',
  },
  outlineText: {
    color: '#B7D94C',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  disabledButton: {
    backgroundColor: '#333333',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
