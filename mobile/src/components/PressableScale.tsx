import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function PressableScale({
  children,
  onPress,
  onLongPress,
  scale = 0.96,
  style,
  disabled = false,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
