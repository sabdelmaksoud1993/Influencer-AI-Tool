import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, GLASS, SHADOWS, BORDER_RADIUS, SPACING, GAMIFICATION } from '../constants/config';

interface Props {
  currentStreak: number;
  bestStreak?: number;
}

export function StreakCounter({ currentStreak, bestStreak = 0 }: Props) {
  const flameAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const isActive = currentStreak > 0;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }

    Animated.timing(countAnim, {
      toValue: currentStreak,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [currentStreak, isActive, flameAnim, countAnim]);

  const nextMilestone = GAMIFICATION.streakMilestones.find(m => m > currentStreak) || 90;
  const milestoneProgress = currentStreak / nextMilestone;

  return (
    <View style={[styles.container, isActive ? SHADOWS.sm : null]}>
      <LinearGradient
        colors={isActive
          ? (GRADIENTS.streak as unknown as string[])
          : ([GLASS.background, 'rgba(30, 21, 53, 0.9)'] as string[])
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.row}>
          <Animated.Text style={[styles.flame, { transform: [{ scale: flameAnim }] }]}>
            {isActive ? '🔥' : '💤'}
          </Animated.Text>
          <View style={styles.info}>
            <View style={styles.countRow}>
              <AnimatedCount value={countAnim} style={styles.count} />
              <Text style={styles.dayLabel}> day{currentStreak !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.subtitle}>
              {isActive ? `Next milestone: ${nextMilestone} days` : 'Start your streak!'}
            </Text>
          </View>
          {bestStreak > 0 && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestLabel}>Best</Text>
              <Text style={styles.bestValue}>{bestStreak}</Text>
            </View>
          )}
        </View>
        {/* Milestone progress bar */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={GRADIENTS.streak as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(milestoneProgress * 100, 100)}%` as unknown as number }]}
          />
          {/* Milestone dots */}
          {GAMIFICATION.streakMilestones.map(m => {
            const pos = (m / nextMilestone) * 100;
            if (pos > 100) return null;
            return (
              <View
                key={m}
                style={[
                  styles.milestoneDot,
                  { left: `${pos}%` as unknown as number },
                  currentStreak >= m && styles.milestoneDotActive,
                ]}
              />
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

function AnimatedCount({ value, style }: { value: Animated.Value; style: object }) {
  const [display, setDisplay] = React.useState('0');

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      setDisplay(Math.round(v).toString());
    });
    return () => value.removeListener(id);
  }, [value]);

  return <Text style={style}>{display}</Text>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  flame: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  count: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  bestBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bestLabel: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bestValue: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: SPACING.sm,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  milestoneDot: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginLeft: -4,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  milestoneDotActive: {
    backgroundColor: COLORS.gold,
  },
});
