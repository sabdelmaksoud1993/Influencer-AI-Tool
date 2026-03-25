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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

type PickerField = 'date' | 'time' | 'arrivalDeadline' | null;

export function CreateEventScreen({ navigation }: any) {
  const { user } = useAuth();
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

  // Store actual Date objects for display
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [timeObj, setTimeObj] = useState<Date | null>(null);
  const [deadlineObj, setDeadlineObj] = useState<Date | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDisplayTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handlePickerConfirm = (selected: Date) => {
    switch (activePicker) {
      case 'date':
        setDateObj(selected);
        updateField('date', formatDate(selected));
        break;
      case 'time':
        setTimeObj(selected);
        updateField('time', formatTime(selected));
        break;
      case 'arrivalDeadline':
        setDeadlineObj(selected);
        updateField('arrivalDeadline', formatTime(selected));
        break;
    }
    setActivePicker(null);
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

        <Input
          label="Event Title *"
          placeholder="Saturday Night Out"
          value={form.title}
          onChangeText={(v) => updateField('title', v)}
        />

        {/* Date Picker */}
        <Text style={styles.label}>Event Date *</Text>
        <TouchableOpacity onPress={() => setActivePicker('date')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={dateObj ? styles.pickerValue : styles.pickerPlaceholder}>
              {dateObj ? formatDisplayDate(dateObj) : 'Tap to select date'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </Card>
        </TouchableOpacity>

        {/* Event Time Picker */}
        <Text style={styles.label}>Event Time *</Text>
        <TouchableOpacity onPress={() => setActivePicker('time')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={timeObj ? styles.pickerValue : styles.pickerPlaceholder}>
              {timeObj ? formatDisplayTime(timeObj) : 'Tap to select time'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </Card>
        </TouchableOpacity>

        {/* Latest Entry Time Picker */}
        <Text style={styles.label}>Latest Entry Time</Text>
        <TouchableOpacity onPress={() => setActivePicker('arrivalDeadline')}>
          <Card style={styles.pickerCard}>
            <Ionicons name="alarm" size={20} color={COLORS.warning} />
            <Text style={deadlineObj ? styles.pickerValue : styles.pickerPlaceholder}>
              {deadlineObj ? formatDisplayTime(deadlineObj) : 'Tap to select latest entry'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </Card>
        </TouchableOpacity>

        <Input label="Dress Code" placeholder="Smart Casual" value={form.dressCode} onChangeText={(v) => updateField('dressCode', v)} />
        <Input label="Description" placeholder="Event details..." value={form.description} onChangeText={(v) => updateField('description', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Capacity *" placeholder="50" value={form.capacity} onChangeText={(v) => updateField('capacity', v)} keyboardType="number-pad" />
        <Input label="Perks (comma separated)" placeholder="Free drinks, VIP table" value={form.perks} onChangeText={(v) => updateField('perks', v)} />

        <Button title="Create Event" onPress={handleCreate} loading={loading} size="lg" style={{ marginTop: SPACING.sm }} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={{ marginTop: SPACING.sm }} />

        {/* Date/Time Picker Modal */}
        <DateTimePickerModal
          isVisible={activePicker !== null}
          mode={activePicker === 'date' ? 'date' : 'time'}
          date={
            activePicker === 'date' ? (dateObj || new Date()) :
            activePicker === 'time' ? (timeObj || new Date()) :
            (deadlineObj || new Date())
          }
          minimumDate={activePicker === 'date' ? new Date() : undefined}
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
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pickerValue: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMuted,
  },
});
