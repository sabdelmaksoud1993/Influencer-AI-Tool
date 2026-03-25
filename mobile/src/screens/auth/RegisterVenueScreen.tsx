import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';

export function RegisterVenueScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    venueType: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    instagram: '',
    description: '',
    capacity: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.contactEmail || !form.contactName) {
      Alert.alert('Error', 'Please fill in venue name, contact name, and email');
      return;
    }
    if (form.name.length > 100 || form.contactName.length > 100) {
      Alert.alert('Error', 'Name is too long (max 100 characters)');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.contactEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (form.description.length > 2000) {
      Alert.alert('Error', 'Description is too long (max 2000 characters)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/venues', {
        name: form.name,
        location: form.location,
        venueType: form.venueType || 'Nightclub',
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        instagram: form.instagram.replace('@', ''),
        description: form.description,
        capacity: parseInt(form.capacity, 10) || 100,
        dealType: '',
        rate: '',
        notes: '',
      });
      Alert.alert(
        'Registration Submitted!',
        'Your venue application is under review. We will contact you once approved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
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
        <Text style={styles.title}>Register Your Venue</Text>
        <Text style={styles.subtitle}>Partner with Glow Pass</Text>

        <Input label="Venue Name *" placeholder="Club XYZ" value={form.name} onChangeText={(v) => updateField('name', v)} />
        <Input label="Venue Type" placeholder="Nightclub, Lounge, Rooftop..." value={form.venueType} onChangeText={(v) => updateField('venueType', v)} />
        <Input label="Location" placeholder="Downtown Dubai" value={form.location} onChangeText={(v) => updateField('location', v)} />
        <Input label="Capacity" placeholder="200" value={form.capacity} onChangeText={(v) => updateField('capacity', v)} keyboardType="number-pad" />
        <Input label="Contact Name *" placeholder="John Smith" value={form.contactName} onChangeText={(v) => updateField('contactName', v)} />
        <Input label="Contact Email *" placeholder="contact@venue.com" value={form.contactEmail} onChangeText={(v) => updateField('contactEmail', v)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Contact Phone" placeholder="+971..." value={form.contactPhone} onChangeText={(v) => updateField('contactPhone', v)} keyboardType="phone-pad" />
        <Input label="Instagram" placeholder="@venuename" value={form.instagram} onChangeText={(v) => updateField('instagram', v)} autoCapitalize="none" />
        <Input label="Description" placeholder="Tell us about your venue..." value={form.description} onChangeText={(v) => updateField('description', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />

        <Button title="Submit Registration" onPress={handleSubmit} loading={loading} size="lg" style={{ marginTop: SPACING.sm }} />
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
});
