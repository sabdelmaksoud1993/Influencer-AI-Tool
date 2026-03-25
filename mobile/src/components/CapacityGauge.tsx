import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING } from '../constants/config';

interface Props {
  spotsLeft: number;
  capacity: number;
  showLabel?: boolean;
}

export function CapacityGauge({ spotsLeft, capacity, showLabel = true }: Props) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const filled = capacity - spotsLeft;
  const percent = capacity > 0 ? (filled / capacity) * 100 : 0;
  const isWarn = spotsLeft > 0 && spotsLeft <= 5;
  const isFull = spotsLeft <= 0;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: Math.min(percent, 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent, fillAnim]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const gradientColors = isFull
    ? (['#EF4444', '#DC2626'] as const)
    : isWarn
    ? (['#F59E0B', '#EF4444'] as const)
    : (GRADIENTS.pinkPurple as unknown as string[]);

  return (
    <View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrapper, { width: fillWidth as unknown as string }]}>
          <LinearGradient
            colors={gradientColors as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.count}>{filled}/{capacity}</Text>
          <Text
            style={[
              styles.status,
              isFull && styles.statusFull,
              isWarn && styles.statusWarn,
            ]}
          >
            {isFull ? 'FULL — WAITLIST' : `${spotsLeft} spots left`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillWrapper: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  count: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  status: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusFull: {
    color: COLORS.error,
  },
  statusWarn: {
    color: COLORS.warning,
  },
});
