import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedEntryProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  style?: ViewStyle;
}

export function AnimatedEntry({
  children,
  delay = 0,
  direction = 'up',
  distance = 30,
  duration = 500,
  style,
}: AnimatedEntryProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(
    direction === 'none' ? 0 : distance
  )).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const transform = direction === 'none' ? [] :
    direction === 'left' || direction === 'right'
      ? [{ translateX: direction === 'right' ? translate : Animated.multiply(translate, -1) }]
      : [{ translateY: direction === 'down' ? Animated.multiply(translate, -1) : translate }];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
}
