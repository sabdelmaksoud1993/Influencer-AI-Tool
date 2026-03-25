import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, GLASS, BORDER_RADIUS, SPACING } from '../constants/config';

interface Props {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, activeIndex, onChange }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const segmentWidth = useRef(0);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * segmentWidth.current,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [activeIndex, slideAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width / segments.length;
    segmentWidth.current = width;
    slideAnim.setValue(activeIndex * width);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View
        style={[
          styles.slider,
          {
            width: `${100 / segments.length}%` as unknown as number,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.pinkPurple as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sliderGradient}
        />
      </Animated.View>
      {segments.map((label, i) => (
        <TouchableOpacity
          key={label}
          style={styles.segment}
          onPress={() => onChange(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, activeIndex === i && styles.activeLabel]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: GLASS.border,
    padding: 3,
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: BORDER_RADIUS.md - 2,
    overflow: 'hidden',
  },
  sliderGradient: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md - 2,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeLabel: {
    color: COLORS.text,
    fontWeight: '700',
  },
});
