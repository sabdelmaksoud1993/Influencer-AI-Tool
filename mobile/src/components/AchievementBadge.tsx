import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GLASS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/config';
import { PressableScale } from './PressableScale';

interface Props {
  icon: string;
  label: string;
  description: string;
  unlocked?: boolean;
  onPress?: () => void;
  delay?: number;
}

export function AchievementBadge({ icon, label, description, unlocked = false, onPress, delay = 0 }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 10,
      }).start();

      if (unlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
            Animated.timing(shineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
          ])
        ).start();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, unlocked, scaleAnim, shineAnim]);

  const glowOpacity = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <PressableScale onPress={onPress}>
        <View style={[styles.container, unlocked ? SHADOWS.gold : null]}>
          <LinearGradient
            colors={unlocked
              ? (GRADIENTS.gold as unknown as string[])
              : ([GLASS.background, 'rgba(30, 21, 53, 0.9)'] as string[])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {unlocked && (
              <Animated.View style={[styles.shine, { opacity: glowOpacity }]} />
            )}
            <Text style={[styles.icon, !unlocked && styles.locked]}>{icon}</Text>
            <Text style={[styles.label, !unlocked && styles.lockedText]} numberOfLines={1}>
              {label}
            </Text>
            {unlocked && (
              <View style={styles.unlockedBadge}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 90,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  locked: {
    opacity: 0.3,
  },
  label: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  lockedText: {
    color: COLORS.textMuted,
    opacity: 0.5,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
