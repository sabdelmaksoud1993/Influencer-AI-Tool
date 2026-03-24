import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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
          <View style={styles.logoCircles}>
            <View style={[styles.circle, { backgroundColor: '#7C3AED' }]} />
            <View style={[styles.circle, { backgroundColor: '#EC4899' }]} />
          </View>
          <Text style={styles.logo}>GLOW PASS</Text>
          <Text style={styles.tagline}>Exclusive Creator Platform</Text>
        </View>

        <View style={styles.form}>
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
            onPress={() => Alert.alert('Apply', 'Visit myglowpass.com/apply to submit your application')}
            variant="outline"
          />

          <Button
            title="Register as Venue"
            onPress={() => Alert.alert('Register', 'Visit myglowpass.com to register your venue')}
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Creators: CRC-XXXXXXXX{'\n'}
            Venues: VNU-XXXXXXXX{'\n'}
            Admin: Password
          </Text>
        </View>
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
  logoCircles: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
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
