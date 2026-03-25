import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { api } from '../../api/client';

type TargetRole = 'all' | 'member' | 'venue';

export function AdminNotificationsScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<TargetRole>('all');
  const [loading, setLoading] = useState(false);

  const roles: { key: TargetRole; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'Everyone', icon: 'globe' },
    { key: 'member', label: 'Creators', icon: 'people' },
    { key: 'venue', label: 'Venues', icon: 'business' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter a title and message');
      return;
    }
    if (title.trim().length > 100) {
      Alert.alert('Error', 'Title is too long (max 100 characters)');
      return;
    }
    if (message.trim().length > 500) {
      Alert.alert('Error', 'Message is too long (max 500 characters)');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send "${title}" to ${targetRole === 'all' ? 'everyone' : targetRole + 's'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await api.post<{ sent: number }>('/api/mobile/send-notification', {
                title: title.trim(),
                message: message.trim(),
                targetRole,
              });
              Alert.alert('Sent!', `Notification sent to ${result.sent} user(s)`);
              setTitle('');
              setMessage('');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Failed to send';
              Alert.alert('Error', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <AnimatedEntry delay={0} direction="down" distance={20}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Push Notifications</Text>
          <Text style={styles.headerSubtitle}>Send custom notifications to users</Text>
        </View>
      </AnimatedEntry>

      <AnimatedEntry delay={150}>
        <View style={styles.content}>
          {/* Target Selection */}
          <Text style={styles.label}>Send To</Text>
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.key}
                style={[styles.roleChip, targetRole === role.key && styles.roleChipActive]}
                onPress={() => setTargetRole(role.key)}
              >
                <Ionicons
                  name={role.icon}
                  size={18}
                  color={targetRole === role.key ? '#FFF' : COLORS.textSecondary}
                />
                <Text style={[styles.roleText, targetRole === role.key && styles.roleTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Title"
            placeholder="Weekend Event Alert 🎉"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Message"
            placeholder="Don't miss our exclusive events this weekend..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Button
            title="Send Notification"
            onPress={handleSend}
            loading={loading}
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />
        </View>
      </AnimatedEntry>

      {/* Quick Templates */}
      <AnimatedEntry delay={300}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        <NotificationTemplate
          title="New Event Tonight"
          message="A new event has been posted! Check it out and RSVP before spots fill up."
          onUse={(t, m) => { setTitle(t); setMessage(m); }}
        />
        <NotificationTemplate
          title="Content Reminder"
          message="Don't forget to submit your content proof from last night's event!"
          onUse={(t, m) => { setTitle(t); setMessage(m); }}
        />
        <NotificationTemplate
          title="Welcome to Glow Pass"
          message="Your application has been approved! Log in with your access code to explore events."
          onUse={(t, m) => { setTitle(t); setMessage(m); }}
        />
      </AnimatedEntry>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

function NotificationTemplate({ title, message, onUse }: {
  title: string;
  message: string;
  onUse: (title: string, message: string) => void;
}) {
  return (
    <TouchableOpacity onPress={() => onUse(title, message)}>
      <Card style={styles.templateCard}>
        <View style={styles.templateRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.templateTitle}>{title}</Text>
            <Text style={styles.templateMessage} numberOfLines={2}>{message}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, paddingTop: SPACING.xl },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  content: { paddingHorizontal: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', marginBottom: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: SPACING.sm + 2, borderRadius: 12,
    backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { fontSize: 13, color: COLORS.textSecondary },
  roleTextActive: { color: '#FFF', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  templateCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  templateRow: { flexDirection: 'row', alignItems: 'center' },
  templateTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  templateMessage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
