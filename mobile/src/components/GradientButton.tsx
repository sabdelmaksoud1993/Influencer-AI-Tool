import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, BORDER_RADIUS, SPACING, COLORS } from '../constants/config';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'success' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

const VARIANT_COLORS: Record<string, readonly string[]> = {
  primary: GRADIENTS.pinkPurple,
  gold: GRADIENTS.gold,
  success: GRADIENTS.success,
  danger: GRADIENTS.danger,
};

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'md',
  icon,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  if (variant === 'outline') {
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <Animated.View
          style={[
            styles.base,
            styles[size],
            styles.outline,
            isDisabled && styles.disabled,
            { transform: [{ scale: scaleAnim }] },
            style,
          ]}
        >
          <Text style={[styles.text, styles.outlineText]}>
            {icon ? `${icon} ${title}` : title}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  const colors = VARIANT_COLORS[variant] || GRADIENTS.pinkPurple;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={colors as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, styles[size]]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.text}>
              {icon ? `${icon} ${title}` : title}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  md: {
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
  },
  lg: {
    paddingVertical: SPACING.lg - 4,
    paddingHorizontal: SPACING.xl,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: COLORS.primary,
  },
});
