import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export function CreatorProfileScreen() {
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
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'C'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        {user?.instagram && (
          <Text style={styles.handle}>@{user.instagram}</Text>
        )}
        {user?.tier && <Badge text={user.tier} variant="gold" />}
      </View>

      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <InfoRow icon="mail" label="Email" value={user?.email || '-'} />
          <InfoRow icon="key" label="Access Code" value={user?.accessCode || '-'} />
          <InfoRow icon="star" label="Events Attended" value={String(user?.eventsAttended || 0)} />
          <InfoRow icon="camera" label="Content Score" value={String(user?.contentScore || 0)} />
          <InfoRow icon="shield-checkmark" label="Reliability" value={`${user?.reliabilityScore || 0}%`} />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  handle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  content: {
    padding: SPACING.lg,
  },
  infoCard: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});
