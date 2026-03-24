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
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export function CreateEventScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    arrivalDeadline: '',
    dressCode: '',
    description: '',
    capacity: '',
    perks: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.time || !form.capacity) {
      Alert.alert('Error', 'Please fill in title, date, time, and capacity');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/events', {
        venueId: user?.id,
        venueName: user?.name,
        title: form.title,
        date: form.date,
        time: form.time,
        arrivalDeadline: form.arrivalDeadline || form.time,
        dressCode: form.dressCode || 'Smart Casual',
        description: form.description,
        capacity: parseInt(form.capacity, 10),
        perks: form.perks
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      });
      Alert.alert('Success', 'Event created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
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
        <Text style={styles.title}>Create New Event</Text>

        <Input label="Event Title *" placeholder="Saturday Night Out" value={form.title} onChangeText={(v) => updateField('title', v)} />
        <Input label="Date *" placeholder="2025-04-15" value={form.date} onChangeText={(v) => updateField('date', v)} />
        <Input label="Time *" placeholder="22:00" value={form.time} onChangeText={(v) => updateField('time', v)} />
        <Input label="Arrival Deadline" placeholder="22:30" value={form.arrivalDeadline} onChangeText={(v) => updateField('arrivalDeadline', v)} />
        <Input label="Dress Code" placeholder="Smart Casual" value={form.dressCode} onChangeText={(v) => updateField('dressCode', v)} />
        <Input label="Description" placeholder="Event details..." value={form.description} onChangeText={(v) => updateField('description', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Capacity *" placeholder="50" value={form.capacity} onChangeText={(v) => updateField('capacity', v)} keyboardType="number-pad" />
        <Input label="Perks (comma separated)" placeholder="Free drinks, VIP table" value={form.perks} onChangeText={(v) => updateField('perks', v)} />

        <Button title="Create Event" onPress={handleCreate} loading={loading} size="lg" style={{ marginTop: SPACING.sm }} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={{ marginTop: SPACING.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
});
