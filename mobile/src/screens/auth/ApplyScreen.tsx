import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';

export function ApplyScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    instagram: '',
    followerCount: '',
    email: '',
    phone: '',
    city: '',
    gender: '',
    whyJoin: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.instagram || !form.email || !form.gender) {
      Alert.alert('Error', 'Please fill in name, Instagram, email, and gender');
      return;
    }
    if (form.fullName.length > 100) {
      Alert.alert('Error', 'Name is too long (max 100 characters)');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (form.whyJoin.length > 2000) {
      Alert.alert('Error', 'Response is too long (max 2000 characters)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/applications', {
        fullName: form.fullName,
        instagram: form.instagram.replace('@', ''),
        followerCount: parseInt(form.followerCount, 10) || 0,
        email: form.email,
        phone: form.phone,
        city: form.city,
        gender: form.gender,
        whyJoin: form.whyJoin,
        photos: [],
        referredBy: '',
        heardFrom: 'mobile_app',
      });
      Alert.alert(
        'Application Submitted!',
        'We will review your application and get back to you via email.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Apply as Creator</Text>
        <Text style={styles.subtitle}>Join the Glow Pass creator network</Text>

        <Input label="Full Name *" placeholder="Your name" value={form.fullName} onChangeText={(v) => updateField('fullName', v)} />
        <Input label="Instagram Handle *" placeholder="@yourhandle" value={form.instagram} onChangeText={(v) => updateField('instagram', v)} autoCapitalize="none" />
        <Input label="Follower Count" placeholder="10000" value={form.followerCount} onChangeText={(v) => updateField('followerCount', v)} keyboardType="number-pad" />
        <Input label="Email *" placeholder="you@email.com" value={form.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone" placeholder="+971..." value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
        <Input label="City" placeholder="Dubai" value={form.city} onChangeText={(v) => updateField('city', v)} />

        <Text style={styles.fieldLabel}>Gender *</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[styles.genderButton, form.gender === 'male' && styles.genderButtonActive]}
            onPress={() => updateField('gender', 'male')}
          >
            <Text style={[styles.genderText, form.gender === 'male' && styles.genderTextActive]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, form.gender === 'female' && styles.genderButtonActive]}
            onPress={() => updateField('gender', 'female')}
          >
            <Text style={[styles.genderText, form.gender === 'female' && styles.genderTextActive]}>Female</Text>
          </TouchableOpacity>
        </View>

        <Input label="Why do you want to join?" placeholder="Tell us about yourself..." value={form.whyJoin} onChangeText={(v) => updateField('whyJoin', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />

        <Button title="Submit Application" onPress={handleSubmit} loading={loading} size="lg" style={{ marginTop: SPACING.sm }} />
        <Button title="Back to Login" onPress={() => navigation.goBack()} variant="secondary" style={{ marginTop: SPACING.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.primary, marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: SPACING.sm },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.sm },
  genderButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  genderButtonActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(236,72,153,0.15)' },
  genderText: { fontSize: 14, color: COLORS.textSecondary },
  genderTextActive: { color: COLORS.primary, fontWeight: '600' },
});
