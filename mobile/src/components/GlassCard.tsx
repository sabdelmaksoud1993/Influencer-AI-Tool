import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, BORDER_RADIUS, SHADOWS, SPACING } from '../constants/config';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  depth?: 1 | 2 | 3;
  noPadding?: boolean;
}

export function GlassCard({ children, style, depth = 1, noPadding = false }: Props) {
  const shadowStyle = depth === 3 ? SHADOWS.lg : depth === 2 ? SHADOWS.md : SHADOWS.sm;
  const opacity = depth === 3 ? 0.8 : depth === 2 ? 0.6 : 0.4;

  return (
    <View style={[styles.outer, shadowStyle, style]}>
      <LinearGradient
        colors={[`rgba(45, 37, 69, ${opacity})`, `rgba(30, 21, 53, ${opacity + 0.15})`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, noPadding ? null : styles.padding]}
      >
        <View style={styles.border}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  padding: {
    padding: SPACING.md,
  },
  border: {
  },
});
