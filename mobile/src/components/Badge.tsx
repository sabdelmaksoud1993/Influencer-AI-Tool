import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/config';

interface BadgeProps {
  text: string;
  variant?: 'gold' | 'success' | 'warning' | 'error' | 'info';
}

const BADGE_COLORS = {
  gold: { bg: 'rgba(212, 175, 55, 0.2)', text: COLORS.primary },
  success: { bg: 'rgba(16, 185, 129, 0.2)', text: COLORS.success },
  warning: { bg: 'rgba(245, 158, 11, 0.2)', text: COLORS.warning },
  error: { bg: 'rgba(239, 68, 68, 0.2)', text: COLORS.error },
  info: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6' },
};

export function Badge({ text, variant = 'gold' }: BadgeProps) {
  const colors = BADGE_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
