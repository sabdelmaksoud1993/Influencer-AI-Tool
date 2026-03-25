import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { api } from '../../api/client';
import { Event } from '../../types';

export function CreatorHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>('/api/events?status=upcoming');
      setEvents(data.events || []);
    } catch (err) {
      console.log('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const handleRSVP = async (eventId: string) => {
    try {
      await api.post(`/api/events/${eventId}/rsvp`, {
        memberId: user?.id,
        memberName: user?.name,
      });
      Alert.alert('Success', 'RSVP confirmed!');
      fetchEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'RSVP failed';
      Alert.alert('Error', message);
    }
  };

  const tierColor = user?.tier === 'Gold' ? 'gold' : user?.tier === 'Silver' ? 'info' : 'success';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Profile Header */}
      <AnimatedEntry delay={0} direction="down" distance={20}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'C'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
            <View style={styles.badges}>
              {user?.tier && <Badge text={user.tier} variant={tierColor as any} />}
              {user?.instagram && (
                <Text style={styles.handle}>@{user.instagram}</Text>
              )}
            </View>
          </View>
        </View>
      </AnimatedEntry>

      {/* Stats Row */}
      <AnimatedEntry delay={200}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.eventsAttended || 0}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.contentScore || 0}</Text>
            <Text style={styles.statLabel}>Content</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.reliabilityScore || 0}%</Text>
            <Text style={styles.statLabel}>Reliability</Text>
          </Card>
        </View>
      </AnimatedEntry>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {events.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          </Card>
        ) : (
          events.map((event) => {
            const myRsvp = event.rsvps?.find((r) => r.memberId === user?.id);
            return (
              <TouchableOpacity key={event.id} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
              <Card style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Badge
                    text={event.status}
                    variant={event.status === 'upcoming' ? 'gold' : 'success'}
                  />
                </View>
                <Text style={styles.eventVenue}>{event.venueName}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.date}</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="time" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="shirt" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.dressCode}</Text>
                  </View>
                </View>
                {event.perks?.length > 0 && (
                  <View style={styles.perksRow}>
                    {event.perks.map((perk, i) => (
                      <Badge key={i} text={perk} variant="success" />
                    ))}
                  </View>
                )}
                {myRsvp ? (
                  <View style={styles.rsvpStatus}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    <Text style={styles.rsvpText}>RSVP: {myRsvp.status}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.rsvpButton}
                    onPress={() => handleRSVP(event.id)}
                  >
                    <Text style={styles.rsvpButtonText}>RSVP Now</Text>
                  </TouchableOpacity>
                )}
              </Card>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  headerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  handle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  eventCard: {
    marginBottom: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  eventVenue: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  eventDetails: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  perksRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  rsvpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  rsvpButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
  },
  rsvpText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
