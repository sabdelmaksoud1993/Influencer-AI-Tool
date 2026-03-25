import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Event } from '../../types';

export function GenerateQRScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>(
        `/api/events?venueId=${user?.id}`
      );
      const active = (data.events || []).filter(
        (e) => e.status === 'upcoming' || e.status === 'active' || e.status === 'ongoing'
      );
      setEvents(active);
    } catch (err) {
      console.log('Failed to fetch events:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const handleGenerateQR = async (event: Event) => {
    try {
      const data = await api.post<{ qrCodes: Array<{ memberName: string; token: string }> }>(
        '/api/events/checkin-qr',
        { eventId: event.id }
      );

      if (data.qrCodes?.length > 0) {
        const count = data.qrCodes.length;
        Alert.alert(
          'QR Codes Generated',
          `${count} QR code(s) generated for ${event.title}. Check-in tokens are ready. View them on the web dashboard for printing.`,
          [
            {
              text: 'Share Link',
              onPress: () => {
                Share.share({
                  message: `Check-in for ${event.title}: https://www.myglowpass.com/checkin?token=${data.qrCodes[0].token}`,
                });
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('No RSVPs', 'No confirmed RSVPs to generate QR codes for.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate QR codes';
      Alert.alert('Error', message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Generate Check-in QR</Text>
        <Text style={styles.subtitle}>Select an event to generate QR codes for attendees</Text>
      </View>

      {events.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyState}>
            <Ionicons name="qr-code-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No active events</Text>
            <Text style={styles.emptySubtext}>Create an event first</Text>
          </View>
        </Card>
      ) : (
        events.map((event) => (
          <TouchableOpacity key={event.id} onPress={() => handleGenerateQR(event)}>
            <Card style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date} at {event.time}</Text>
                  <Text style={styles.eventRsvps}>
                    {event.rsvps?.filter((r) => r.status === 'confirmed').length || 0} confirmed RSVPs
                  </Text>
                </View>
                <View style={styles.qrIcon}>
                  <Ionicons name="qr-code" size={28} color={COLORS.primary} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  emptyCard: { marginHorizontal: SPACING.lg },
  emptyState: { alignItems: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600', marginTop: SPACING.sm },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  eventCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  eventTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  eventDate: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  eventRsvps: { fontSize: 13, color: COLORS.primary, marginTop: 4 },
  qrIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: `${COLORS.primary}22`,
    justifyContent: 'center', alignItems: 'center',
  },
});
