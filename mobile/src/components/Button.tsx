import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants/config';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'md',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#FFF'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surfaceLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  lg: {
    paddingVertical: SPACING.lg - 4,
    paddingHorizontal: SPACING.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: COLORS.text,
  },
  outlineText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: '#FFF',
  },
});
