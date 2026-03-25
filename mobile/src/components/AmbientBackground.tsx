import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

export function AmbientBackground({ children }: Props) {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    );
    loop1.start();
    loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, [orb1Anim, orb2Anim]);

  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View style={styles.container}>
      {/* Pink orb top-right */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1TranslateY }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.2)', 'transparent']}
          style={styles.orbGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      {/* Purple orb bottom-left */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateX: orb2TranslateX }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={styles.orbGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  orb1: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
  },
  orb2: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    bottom: 100,
    left: -SCREEN_WIDTH * 0.2,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
  },
});
