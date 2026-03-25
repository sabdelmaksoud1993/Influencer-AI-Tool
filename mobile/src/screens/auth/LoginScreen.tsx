import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animation values
  const circleScale1 = useRef(new Animated.Value(0)).current;
  const circleScale2 = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // 1. Circles pop in with bounce
      Animated.parallel([
        Animated.spring(circleScale1, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(circleScale2, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // 2. Logo slides in and fades
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Form slides up and fades in
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 5. Footer fades in
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous gentle pulse on circles
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter your access code');
      return;
    }

    setLoading(true);
    try {
      await login(trimmed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {/* Animated Logo Row — circles + text inline */}
          <Animated.View
            style={[
              styles.logoRow,
              {
                opacity: logoOpacity,
                transform: [{ translateY: logoSlide }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.circleLarge,
                { backgroundColor: '#7C3AED' },
                {
                  transform: [
                    { scale: Animated.multiply(circleScale1, pulseAnim) },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.circleSmall,
                { backgroundColor: '#EC4899' },
                {
                  transform: [{ scale: circleScale2 }],
                },
              ]}
            />
            <Text style={styles.logo}>GLOW PASS</Text>
          </Animated.View>

          {/* Animated Tagline */}
          <Animated.Text
            style={[styles.tagline, { opacity: taglineOpacity }]}
          >
            Exclusive Creator Platform
          </Animated.Text>
        </View>

        {/* Animated Form */}
        <Animated.View
          style={[
            styles.form,
            {
              opacity: formOpacity,
              transform: [{ translateY: formSlide }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your access code to continue
          </Text>

          <Input
            label="Access Code"
            placeholder="CRC-XXXXXXXX, VNU-XXXXXXXX, or Admin"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Apply as Creator"
            onPress={() => navigation.navigate('Apply')}
            variant="outline"
          />

          <Button
            title="Register as Venue"
            onPress={() => navigation.navigate('RegisterVenue')}
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
          />
        </Animated.View>

        {/* Animated Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <Text style={styles.footerText}>
            Creators: CRC-XXXXXXXX{'\n'}
            Venues: VNU-XXXXXXXX{'\n'}
            Admin: Password
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.md,
  },
  circleLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  circleSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginLeft: 6,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    letterSpacing: 1,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});
