import React, { useState, useEffect } from 'react';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { Event } from '../../types';

type PickerField = 'date' | 'time' | 'arrivalDeadline' | null;

export function EditEventScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const [loading, setLoading] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerField>(null);
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

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await api.get<{ events: Event[] }>(`/api/events?id=${eventId}`);
        if (data.events?.length > 0) {
          const e = data.events[0];
          setForm({
            title: e.title,
            date: e.date,
            time: e.time,
            arrivalDeadline: e.arrivalDeadline,
            dressCode: e.dressCode,
            description: e.description,
            capacity: String(e.capacity),
            perks: e.perks?.join(', ') || '',
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load event');
      }
    };
    loadEvent();
  }, [eventId]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickerConfirm = (selected: Date) => {
    if (activePicker === 'date') {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      updateField('date', `${y}-${m}-${d}`);
    } else {
      const h = String(selected.getHours()).padStart(2, '0');
      const min = String(selected.getMinutes()).padStart(2, '0');
      const field = activePicker === 'time' ? 'time' : 'arrivalDeadline';
      updateField(field, `${h}:${min}`);
    }
    setActivePicker(null);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time) {
      Alert.alert('Error', 'Title, date, and time are required');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/events/${eventId}`, {
        title: form.title,
        date: form.date,
        time: form.time,
        arrivalDeadline: form.arrivalDeadline || form.time,
        dressCode: form.dressCode,
        description: form.description,
        capacity: parseInt(form.capacity, 10),
        perks: form.perks.split(',').map((p) => p.trim()).filter(Boolean),
      });
      Alert.alert('Success', 'Event updated!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update event';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Event</Text>

        <Input label="Event Title *" value={form.title} onChangeText={(v) => updateField('title', v)} />

        <Text style={styles.label}>Event Date *</Text>
        <TouchableOpacity onPress={() => setActivePicker('date')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={form.date ? styles.pickerValue : styles.pickerPlaceholder}>
              {form.date || 'Tap to select date'}
            </Text>
          </Card>
        </TouchableOpacity>

        <Text style={styles.label}>Event Time *</Text>
        <TouchableOpacity onPress={() => setActivePicker('time')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={form.time ? styles.pickerValue : styles.pickerPlaceholder}>
              {form.time || 'Tap to select time'}
            </Text>
          </Card>
        </TouchableOpacity>

        <Text style={styles.label}>Latest Entry Time</Text>
        <TouchableOpacity onPress={() => setActivePicker('arrivalDeadline')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="alarm" size={20} color={COLORS.warning} />
            <Text style={form.arrivalDeadline ? styles.pickerValue : styles.pickerPlaceholder}>
              {form.arrivalDeadline || 'Tap to select'}
            </Text>
          </Card>
        </TouchableOpacity>

        <Input label="Dress Code" value={form.dressCode} onChangeText={(v) => updateField('dressCode', v)} />
        <Input label="Description" value={form.description} onChangeText={(v) => updateField('description', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Capacity *" value={form.capacity} onChangeText={(v) => updateField('capacity', v)} keyboardType="number-pad" />
        <Input label="Perks (comma separated)" value={form.perks} onChangeText={(v) => updateField('perks', v)} />

        <Button title="Save Changes" onPress={handleSave} loading={loading} size="lg" style={{ marginTop: SPACING.sm }} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={{ marginTop: SPACING.sm }} />

        <DateTimePickerModal
          isVisible={activePicker !== null}
          mode={activePicker === 'date' ? 'date' : 'time'}
          onConfirm={handlePickerConfirm}
          onCancel={() => setActivePicker(null)}
          themeVariant="dark"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  pickerCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  pickerValue: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  pickerPlaceholder: { flex: 1, fontSize: 16, color: COLORS.textMuted },
});
