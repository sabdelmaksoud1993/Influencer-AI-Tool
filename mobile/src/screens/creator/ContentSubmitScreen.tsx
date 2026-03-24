import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function ContentSubmitScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params;
  const { user } = useAuth();

  const [platform, setPlatform] = useState<'instagram' | 'snapchat' | 'google'>('instagram');
  const [contentType, setContentType] = useState<'post' | 'reel' | 'story'>('post');
  const [link, setLink] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setScreenshot(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!link.trim()) {
      Alert.alert('Error', 'Please enter the content link');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/events/${eventId}/content`, {
        memberId: user?.id,
        platform,
        type: contentType,
        link: link.trim(),
        screenshot: screenshot || undefined,
      });
      Alert.alert('Success', 'Content submitted for verification!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { key: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
    { key: 'snapchat', label: 'Snapchat', icon: 'logo-snapchat' },
    { key: 'google', label: 'Google', icon: 'logo-google' },
  ] as const;

  const contentTypes = platform === 'instagram'
    ? [{ key: 'post', label: 'Post' }, { key: 'reel', label: 'Reel' }, { key: 'story', label: 'Story' }]
    : [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Submit Content</Text>
        <Text style={styles.subtitle}>for {eventTitle}</Text>

        {/* Platform Selection */}
        <Text style={styles.label}>Platform</Text>
        <View style={styles.chipRow}>
          {platforms.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, platform === p.key && styles.chipActive]}
              onPress={() => {
                setPlatform(p.key);
                if (p.key !== 'instagram') setContentType('post');
              }}
            >
              <Ionicons
                name={p.icon as any}
                size={18}
                color={platform === p.key ? '#FFF' : COLORS.textSecondary}
              />
              <Text style={[styles.chipText, platform === p.key && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Type (Instagram only) */}
        {platform === 'instagram' && (
          <>
            <Text style={styles.label}>Content Type</Text>
            <View style={styles.chipRow}>
              {contentTypes.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, contentType === t.key && styles.chipActive]}
                  onPress={() => setContentType(t.key as any)}
                >
                  <Text style={[styles.chipText, contentType === t.key && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Link Input */}
        <Input
          label={platform === 'google' ? 'Google Review Link' : `${platform === 'snapchat' ? 'Snap' : 'Instagram'} Link`}
          placeholder={
            platform === 'google'
              ? 'https://g.co/kgs/...'
              : platform === 'snapchat'
              ? 'https://www.snapchat.com/...'
              : 'https://www.instagram.com/p/...'
          }
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Screenshot Upload */}
        <Text style={styles.label}>Screenshot (Proof)</Text>
        <TouchableOpacity onPress={pickImage}>
          <Card style={styles.uploadCard}>
            {screenshot ? (
              <Image source={{ uri: screenshot }} style={styles.screenshotPreview} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.uploadText}>Tap to upload screenshot</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        <Button
          title="Submit Content"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={{ marginTop: SPACING.md }}
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ marginTop: SPACING.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.primary, marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', marginBottom: SPACING.sm, marginTop: SPACING.md },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 20, backgroundColor: COLORS.surfaceLight,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 14 },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  uploadCard: { minHeight: 150, justifyContent: 'center', alignItems: 'center' },
  uploadPlaceholder: { alignItems: 'center', gap: SPACING.sm },
  uploadText: { color: COLORS.textMuted, fontSize: 14 },
  screenshotPreview: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' },
});
