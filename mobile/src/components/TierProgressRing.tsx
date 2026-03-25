import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GAMIFICATION, GRADIENTS, SHADOWS } from '../constants/config';

interface Props {
  tier: string;
  progress: number; // 0-100
  size?: number;
}

export function TierProgressRing({ tier, progress, size = 96 }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const tierKey = tier.toLowerCase().replace(/\s+/g, '').replace('_', '');
  const tierConfig = tierKey === 'innercircle'
    ? GAMIFICATION.tiers.innerCircle
    : tierKey === 'muse'
    ? GAMIFICATION.tiers.muse
    : GAMIFICATION.tiers.new;

  const ringWidth = 4;
  const outerSize = size;
  const innerSize = size - ringWidth * 2;

  return (
    <Animated.View style={[styles.container, { width: outerSize, height: outerSize, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Background ring */}
      <View style={[styles.ringBg, { width: outerSize, height: outerSize, borderRadius: outerSize / 2, borderWidth: ringWidth }]} />
      {/* Progress ring — using a gradient border overlay with clipping */}
      <View style={[styles.progressContainer, { width: outerSize, height: outerSize }]}>
        <LinearGradient
          colors={GRADIENTS.pinkPurple as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.progressRing, {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: ringWidth,
          }]}
        />
        {/* Mask to show only progress portion — clip via rotation */}
        {progress < 100 && (
          <View style={[styles.mask, {
            width: outerSize,
            height: outerSize,
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
          }]}>
            <View style={[styles.maskHalf, { width: outerSize / 2, height: outerSize, backgroundColor: COLORS.background }]} />
          </View>
        )}
        {progress <= 50 && (
          <View style={[styles.maskStatic, { width: outerSize / 2, height: outerSize, left: 0, backgroundColor: COLORS.background }]} />
        )}
      </View>
      {/* Center content */}
      <View style={styles.center}>
        <View style={[styles.innerCircle, { width: innerSize - 4, height: innerSize - 4, borderRadius: (innerSize - 4) / 2 }]}>
          <Text style={[styles.icon, { color: tierConfig.color, fontSize: size * 0.22 }]}>{tierConfig.icon}</Text>
          <Text style={styles.percent}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    position: 'absolute',
    borderColor: COLORS.border,
  },
  progressContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  progressRing: {
    borderColor: 'transparent',
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'flex-end',
  },
  maskHalf: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  maskStatic: {
    position: 'absolute',
    top: 0,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontWeight: '800',
  },
  percent: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
