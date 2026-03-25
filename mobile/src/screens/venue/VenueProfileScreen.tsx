import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../api/upload';

export function VenueProfileScreen() {
  const { user, logout } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(result.assets[0].uri, 'logos');
        setLogo(url);
        Alert.alert('Success', 'Venue logo updated!');
      } catch {
        setLogo(result.assets[0].uri);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <AnimatedEntry delay={0} direction="none">
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handlePickLogo} disabled={uploading}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="business" size={36} color="#FFF" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Tap to upload logo (optional)</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.type}>{user?.venueType || 'Venue'}</Text>
        </View>
      </AnimatedEntry>

      <AnimatedEntry delay={200}>
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
      </AnimatedEntry>
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
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoImage: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: COLORS.primary,
  },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.primary, width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },
  uploadHint: { fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.xs },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: SPACING.sm },
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
