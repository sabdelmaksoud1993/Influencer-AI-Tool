import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Event } from '../../types';

export function CreatorEventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>(`/api/events?id=${eventId}`);
      if (data.events?.length > 0) setEvent(data.events[0]);
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

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const myRsvp = event.rsvps?.find((r) => r.memberId === user?.id);
  const hasContent = myRsvp?.contentStatus === 'submitted' || myRsvp?.contentStatus === 'verified';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Badge text={event.status} variant={event.status === 'upcoming' ? 'gold' : 'success'} />
      </View>

      <Text style={styles.venue}>{event.venueName}</Text>

      <Card style={styles.detailsCard}>
        <DetailRow icon="calendar" label="Date" value={event.date} />
        <DetailRow icon="time" label="Time" value={event.time} />
        <DetailRow icon="alarm" label="Arrive By" value={event.arrivalDeadline} />
        <DetailRow icon="shirt" label="Dress Code" value={event.dressCode} />
        <DetailRow icon="people" label="Capacity" value={`${event.rsvps?.length || 0}/${event.capacity}`} />
      </Card>

      {event.description && (
        <Card style={styles.descCard}>
          <Text style={styles.descText}>{event.description}</Text>
        </Card>
      )}

      {event.perks?.length > 0 && (
        <View style={styles.perksSection}>
          <Text style={styles.sectionTitle}>Perks</Text>
          <View style={styles.perksRow}>
            {event.perks.map((perk, i) => (
              <Badge key={i} text={perk} variant="success" />
            ))}
          </View>
        </View>
      )}

      {/* RSVP Status */}
      {myRsvp && (
        <Card style={styles.rsvpCard}>
          <Text style={styles.sectionTitle}>Your RSVP</Text>
          <View style={styles.rsvpInfo}>
            <Badge text={myRsvp.status} variant={myRsvp.status === 'confirmed' ? 'success' : 'warning'} />
            {myRsvp.checkedInAt && (
              <Text style={styles.checkedIn}>Checked in</Text>
            )}
          </View>
        </Card>
      )}

      {/* Content Submission */}
      {myRsvp && (event.status === 'ongoing' || event.status === 'completed' || event.status === 'active') && (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Content Proof</Text>
          {hasContent ? (
            <Card>
              <View style={styles.contentStatus}>
                <Ionicons
                  name={myRsvp.contentStatus === 'verified' ? 'checkmark-circle' : 'time'}
                  size={24}
                  color={myRsvp.contentStatus === 'verified' ? COLORS.success : COLORS.warning}
                />
                <Text style={styles.contentStatusText}>
                  {myRsvp.contentStatus === 'verified' ? 'Content Verified' : 'Submitted — Awaiting Review'}
                </Text>
              </View>
            </Card>
          ) : (
            <Button
              title="Submit Content"
              onPress={() => navigation.navigate('ContentSubmit', { eventId: event.id, eventTitle: event.title })}
              size="lg"
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.lg, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  venue: { fontSize: 15, color: COLORS.primary, paddingHorizontal: SPACING.lg, marginTop: 4, marginBottom: SPACING.md },
  detailsCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  descCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  descText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  perksSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  perksRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' },
  rsvpCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  rsvpInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkedIn: { color: COLORS.success, fontSize: 13, fontWeight: '500' },
  contentSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  contentStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  contentStatusText: { color: COLORS.text, fontSize: 14 },
});
