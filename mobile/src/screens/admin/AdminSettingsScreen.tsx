import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export function AdminSettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <SettingRow icon="shield-checkmark" label="Role" value="Administrator" />
          <SettingRow icon="globe" label="Platform" value="myglowpass.com" />
          <SettingRow icon="code-working" label="App Version" value="2.0.0" />
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

function SettingRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
});
