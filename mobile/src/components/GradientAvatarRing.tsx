import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, COLORS } from '../constants/config';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  ringWidth?: number;
}

export function GradientAvatarRing({ uri, name, size = 80, ringWidth = 3 }: Props) {
  const outerSize = size + ringWidth * 2;
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <LinearGradient
      colors={GRADIENTS.pinkPurple as unknown as string[]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[styles.image, { width: size - 2, height: size - 2, borderRadius: (size - 2) / 2 }]}
          />
        ) : (
          <View style={[styles.placeholder, { width: size - 2, height: size - 2, borderRadius: (size - 2) / 2 }]}>
            <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
