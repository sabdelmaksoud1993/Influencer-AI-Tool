import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { Event, RSVP } from '../../types';

export function EventDetailScreen({ route }: any) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>(`/api/events?id=${eventId}`);
      if (data.events?.length > 0) {
        setEvent(data.events[0]);
      }
    } catch (err) {
      console.log('Failed to fetch event:', err);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvent();
    setRefreshing(false);
  }, [fetchEvent]);

  const handleRsvpAction = async (memberId: string, action: string) => {
    try {
      await api.patch(`/api/events/${eventId}/rsvp`, { memberId, status: action });
      fetchEvent();
    } catch (err) {
      Alert.alert('Error', 'Failed to update RSVP');
    }
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const confirmed = event.rsvps?.filter((r) => r.status === 'confirmed') || [];
  const pending = event.rsvps?.filter((r) => r.status === 'pending') || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Badge text={event.status} variant={event.status === 'upcoming' ? 'gold' : 'success'} />
      </View>

      <View style={styles.details}>
        <DetailRow icon="calendar" text={event.date} />
        <DetailRow icon="time" text={event.time} />
        <DetailRow icon="shirt" text={event.dressCode} />
        <DetailRow icon="people" text={`${event.rsvps?.length || 0}/${event.capacity} RSVPs`} />
      </View>

      {event.description && (
        <Card style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
          <Text style={styles.description}>{event.description}</Text>
        </Card>
      )}

      {/* Confirmed RSVPs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confirmed ({confirmed.length})</Text>
        {confirmed.map((rsvp) => (
          <RsvpCard key={rsvp.memberId} rsvp={rsvp} />
        ))}
      </View>

      {/* Pending RSVPs */}
      {pending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending ({pending.length})</Text>
          {pending.map((rsvp) => (
            <RsvpCard
              key={rsvp.memberId}
              rsvp={rsvp}
              onConfirm={() => handleRsvpAction(rsvp.memberId, 'confirmed')}
              onDecline={() => handleRsvpAction(rsvp.memberId, 'declined')}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function RsvpCard({ rsvp, onConfirm, onDecline }: { rsvp: RSVP; onConfirm?: () => void; onDecline?: () => void }) {
  return (
    <Card style={styles.rsvpCard}>
      <View style={styles.rsvpInfo}>
        <Text style={styles.rsvpName}>{rsvp.memberName}</Text>
        {rsvp.instagram && <Text style={styles.rsvpHandle}>@{rsvp.instagram}</Text>}
        <Badge text={rsvp.status} variant={rsvp.status === 'confirmed' ? 'success' : 'warning'} />
      </View>
      {onConfirm && onDecline && (
        <View style={styles.rsvpActions}>
          <Button title="Confirm" onPress={onConfirm} size="sm" />
          <Button title="Decline" onPress={onDecline} variant="danger" size="sm" />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  details: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: COLORS.textSecondary },
  description: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  section: { padding: SPACING.lg, paddingTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  rsvpCard: { marginBottom: SPACING.sm },
  rsvpInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  rsvpName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rsvpHandle: { fontSize: 13, color: COLORS.textSecondary },
  rsvpActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
