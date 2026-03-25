import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS } from '../constants/config';
import { GradientButton } from './GradientButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  tierName: string;
  tierIcon: string;
  tierColor: string;
  onDismiss: () => void;
}

export function LevelUpAnimation({ visible, tierName, tierIcon, tierColor, onDismiss }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
      particleAnims.forEach(p => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.opacity.setValue(0);
        p.scale.setValue(0);
      });

      // Main icon animation
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 4, bounciness: 12 }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ]).start();

      // Particle explosions
      particleAnims.forEach((p, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;

        Animated.sequence([
          Animated.delay(400 + i * 50),
          Animated.parallel([
            Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration: 600, useNativeDriver: true }),
            Animated.timing(p.y, { toValue: Math.sin(angle) * distance, duration: 600, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.spring(p.scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
              Animated.timing(p.scale, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
          ]),
        ]).start();
      });
    }
  }, [visible, scaleAnim, rotateAnim, fadeAnim, particleAnims]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const particles = ['✨', '⭐', '💫', '🌟', '✦', '◆', '★', '✧'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Particles */}
          {particleAnims.map((p, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.particle,
                {
                  opacity: p.opacity,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { scale: p.scale },
                  ],
                },
              ]}
            >
              {particles[i]}
            </Animated.Text>
          ))}

          {/* Main badge */}
          <Animated.View
            style={[
              styles.badge,
              SHADOWS.glow,
              {
                transform: [{ scale: scaleAnim }, { rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={GRADIENTS.gold as unknown as string[]}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeIcon}>{tierIcon}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>LEVEL UP!</Text>
            <Text style={[styles.tierName, { color: tierColor }]}>{tierName}</Text>
            <Text style={styles.subtitle}>You've unlocked a new tier!</Text>

            <GradientButton
              title="Continue"
              onPress={onDismiss}
              variant="gold"
              style={styles.button}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 26, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 24,
  },
  badgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 48,
    fontWeight: '800',
  },
  title: {
    color: COLORS.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    minWidth: 200,
  },
});
