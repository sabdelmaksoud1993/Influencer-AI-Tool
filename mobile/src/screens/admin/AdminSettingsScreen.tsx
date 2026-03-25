import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { useAuth } from '../../context/AuthContext';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
  getBiometricType,
} from '../../api/biometric';

export function AdminSettingsScreen() {
  const { logout } = useAuth();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioType, setBioType] = useState('Biometric');

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      setBioAvailable(available);
      if (available) {
        const enabled = await isBiometricEnabled();
        setBioEnabled(enabled);
        const type = await getBiometricType();
        setBioType(type);
      }
    };
    checkBiometric();
  }, []);

  const toggleBiometric = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBioEnabled(value);
    Alert.alert(
      value ? `${bioType} Enabled` : `${bioType} Disabled`,
      value
        ? `You'll need to use ${bioType} to unlock the app.`
        : 'You can now open the app without biometric verification.'
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <AnimatedEntry delay={0} direction="down" distance={15}>
        <View style={styles.content}>
          <Card>
            <SettingRow icon="shield-checkmark" label="Role" value="Administrator" />
            <SettingRow icon="globe" label="Platform" value="myglowpass.com" />
            <SettingRow icon="code-working" label="App Version" value="2.0.0" />
          </Card>

          {bioAvailable && (
            <Card style={{ marginTop: SPACING.md }}>
              <View style={styles.bioRow}>
                <View style={styles.rowLeft}>
                  <Ionicons name="finger-print" size={18} color={COLORS.primary} />
                  <Text style={styles.rowLabel}>{bioType}</Text>
                </View>
                <Switch
                  value={bioEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#FFF"
                />
              </View>
              <Text style={styles.bioHint}>
                {bioEnabled
                  ? `${bioType} is required to unlock the app`
                  : `Enable ${bioType} for extra security`}
              </Text>
            </Card>
          )}

          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </AnimatedEntry>
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
  bioRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  bioHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});
