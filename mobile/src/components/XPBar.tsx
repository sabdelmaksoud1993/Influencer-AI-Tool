import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, GLASS, BORDER_RADIUS, SPACING, GAMIFICATION, SHADOWS } from '../constants/config';

interface Props {
  currentXP: number;
  currentTier: string;
}

export function XPBar({ currentXP, currentTier }: Props) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const tierKey = currentTier.toLowerCase().replace(/\s+/g, '').replace('_', '');
  const tiers = GAMIFICATION.tiers;
  const currentTierConfig = tierKey === 'muse' ? tiers.muse
    : tierKey === 'innercircle' ? tiers.innerCircle
    : tiers.new;

  const nextTierConfig = tierKey === 'muse' ? null
    : tierKey === 'innercircle' ? tiers.muse
    : tiers.innerCircle;

  const xpForCurrent = currentTierConfig.xpRequired;
  const xpForNext = nextTierConfig ? nextTierConfig.xpRequired : currentTierConfig.xpRequired;
  const xpRange = xpForNext - xpForCurrent;
  const xpInRange = currentXP - xpForCurrent;
  const progress = nextTierConfig ? Math.min((xpInRange / xpRange) * 100, 100) : 100;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    if (progress >= 90 && nextTierConfig) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [progress, fillAnim, pulseAnim, nextTierConfig]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={[GLASS.background, 'rgba(30, 21, 53, 0.9)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.tierRow}>
            <Text style={[styles.tierIcon, { color: currentTierConfig.color }]}>
              {currentTierConfig.icon}
            </Text>
            <Text style={styles.tierLabel}>{currentTierConfig.label}</Text>
          </View>
          <Text style={styles.xpText}>
            <Text style={styles.xpValue}>{currentXP}</Text>
            <Text style={styles.xpUnit}> XP</Text>
          </Text>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.track}>
            <Animated.View style={[styles.fillWrapper, { width: fillWidth as unknown as string }]}>
              <LinearGradient
                colors={GRADIENTS.xp as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>
        </View>

        {nextTierConfig ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{xpForNext - currentXP} XP to</Text>
            <Text style={[styles.nextTier, { color: nextTierConfig.color }]}>
              {nextTierConfig.icon} {nextTierConfig.label}
            </Text>
          </View>
        ) : (
          <Text style={styles.maxTier}>Max tier reached ✦</Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  gradient: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  tierLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  xpText: {
    flexDirection: 'row',
  },
  xpValue: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: '900',
  },
  xpUnit: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    marginBottom: SPACING.sm,
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillWrapper: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  nextTier: {
    fontSize: 12,
    fontWeight: '700',
  },
  maxTier: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
