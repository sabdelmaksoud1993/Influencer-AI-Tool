import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from './GlassCard';
import { COLORS, SPACING } from '../constants/config';

interface Props {
  icon: string;
  label: string;
  value: number | string;
  accentColor?: string;
  delay?: number;
  animateValue?: boolean;
}

export function StatCard({ icon, label, value, accentColor = COLORS.primary, delay = 0, animateValue = true }: Props) {
  const countAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]).start();

      if (animateValue && typeof value === 'number') {
        Animated.timing(countAnim, {
          toValue: value,
          duration: 1200,
          useNativeDriver: false,
        }).start();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, animateValue, countAnim, fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <GlassCard depth={2} style={[styles.card, { borderTopColor: accentColor, borderTopWidth: 2 }]}>
        <Text style={styles.icon}>{icon}</Text>
        {animateValue && typeof value === 'number' ? (
          <AnimatedNumber value={countAnim} style={styles.value} />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
        <Text style={styles.label}>{label}</Text>
      </GlassCard>
    </Animated.View>
  );
}

function AnimatedNumber({ value, style }: { value: Animated.Value; style: object }) {
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
  card: {
    alignItems: 'center',
    minWidth: 80,
  },
  icon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
