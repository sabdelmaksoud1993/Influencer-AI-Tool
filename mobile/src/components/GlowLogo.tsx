import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS } from '../constants/config';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZES = {
  sm: { text: 20, glow: 40 },
  md: { text: 32, glow: 60 },
  lg: { text: 44, glow: 80 },
};

export function GlowLogo({ size = 'md', animated = true }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const s = SIZES[size];

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, [animated, pulseAnim, glowAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Animated.View style={[styles.glowBg, { width: s.glow, height: s.glow, opacity: glowAnim }, SHADOWS.glow]} />
      <Text style={[styles.text, { fontSize: s.text }]}>
        <Text style={styles.glow}>Glow</Text>
        <Text style={styles.pass}> Pass</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBg: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  glow: {
    color: COLORS.primary,
  },
  pass: {
    color: COLORS.text,
  },
});
