import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../../constants/config';

export function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const circleScale1 = useRef(new Animated.Value(0)).current;
  const circleScale2 = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(20)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Circles bounce in
      Animated.parallel([
        Animated.spring(circleScale1, {
          toValue: 1, tension: 50, friction: 5, useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(circleScale2, {
            toValue: 1, tension: 50, friction: 5, useNativeDriver: true,
          }),
        ]),
      ]),
      // Logo fades in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(logoSlide, {
          toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(800),
      // Fade out
      Animated.timing(fadeOut, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <View style={styles.logoRow}>
        <Animated.View style={[styles.circleLarge, { transform: [{ scale: circleScale1 }] }]} />
        <Animated.View style={[styles.circleSmall, { transform: [{ scale: circleScale2 }] }]} />
        <Animated.Text style={[styles.logo, { opacity: logoOpacity, transform: [{ translateY: logoSlide }] }]}>
          GLOW PASS
        </Animated.Text>
      </View>
      <Text style={styles.tagline}>Access the City. Capture the Glow.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
  },
  circleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EC4899',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginLeft: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    letterSpacing: 1,
  },
});
