import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export function VenueProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="business" size={32} color="#000" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.type}>{user?.venueType || 'Venue'}</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <InfoRow icon="key" label="Access Code" value={user?.accessCode || '-'} />
          <InfoRow icon="calendar" label="Total Events" value={String(user?.totalEvents || 0)} />
          <InfoRow icon="people" label="Members Sent" value={String(user?.totalMembersSent || 0)} />
        </Card>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  type: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  content: { padding: SPACING.lg },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
});
