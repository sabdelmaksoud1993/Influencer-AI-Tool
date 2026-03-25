import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, GRADIENTS, GLASS, SHADOWS, BORDER_RADIUS, GAMIFICATION } from '../../constants/config';
import { GlassCard } from '../../components/GlassCard';
import { StatCard } from '../../components/StatCard';
import { GradientAvatarRing } from '../../components/GradientAvatarRing';
import { EventCard } from '../../components/EventCard';
import { XPBar } from '../../components/XPBar';
import { StreakCounter } from '../../components/StreakCounter';
import { AchievementBadge } from '../../components/AchievementBadge';
import { GradientButton } from '../../components/GradientButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { AmbientBackground } from '../../components/AmbientBackground';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Event } from '../../types';

export function CreatorHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(0); // 0 = upcoming, 1 = past

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>('/api/events?status=upcoming');
      setEvents(data.events || []);
    } catch (err) {
      if (__DEV__) console.log('Failed to fetch events:', err);
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

  // Gamification data (derived from user stats)
  const eventsAttended = user?.eventsAttended || 0;
  const contentScore = user?.contentScore || 0;
  const currentXP = eventsAttended * GAMIFICATION.xpValues.eventAttended + contentScore * GAMIFICATION.xpValues.contentSubmitted;
  const currentStreak = Math.min(eventsAttended, 7); // Simulated — would come from API
  const unlockedAchievements = new Set<string>();
  if (eventsAttended >= 1) unlockedAchievements.add('first_event');
  if (contentScore >= 5) unlockedAchievements.add('content_creator');
  if (currentStreak >= 7) unlockedAchievements.add('streak_7');
  if (eventsAttended >= 10) unlockedAchievements.add('social_butterfly');

  const firstName = user?.name?.split(' ')[0] || 'Creator';

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Welcome Header */}
        <AnimatedEntry delay={0} direction="down" distance={20}>
          <View style={styles.header}>
            <GradientAvatarRing
              uri={user?.profilePhoto}
              name={user?.name}
              size={64}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>
                {firstName}<Text style={styles.glowDot}>.</Text>
              </Text>
              {user?.instagram && (
                <Text style={styles.handle}>@{user.instagram}</Text>
              )}
            </View>
          </View>
        </AnimatedEntry>

        {/* XP Bar */}
        <AnimatedEntry delay={100}>
          <View style={styles.section}>
            <XPBar currentXP={currentXP} currentTier={user?.tier || 'New'} />
          </View>
        </AnimatedEntry>

        {/* Stats Grid */}
        <AnimatedEntry delay={200}>
          <View style={styles.statsGrid}>
            <View style={{ flex: 1 }}>
              <StatCard icon="🎪" label="Events" value={eventsAttended} accentColor={COLORS.primary} delay={200} />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard icon="⭐" label="Content" value={contentScore} accentColor={COLORS.purple} delay={300} />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard icon="🎯" label="Reliability" value={`${user?.reliabilityScore || 0}%`} accentColor={COLORS.success} delay={400} animateValue={false} />
            </View>
          </View>
        </AnimatedEntry>

        {/* Streak */}
        <AnimatedEntry delay={300}>
          <View style={styles.section}>
            <StreakCounter currentStreak={currentStreak} bestStreak={Math.max(currentStreak, eventsAttended)} />
          </View>
        </AnimatedEntry>

        {/* Achievements */}
        <AnimatedEntry delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
              {GAMIFICATION.achievements.slice(0, 6).map((a, i) => (
                <AchievementBadge
                  key={a.id}
                  icon={a.icon}
                  label={a.label}
                  description={a.description}
                  unlocked={unlockedAchievements.has(a.id)}
                  delay={i * 100}
                />
              ))}
            </ScrollView>
          </View>
        </AnimatedEntry>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
          </View>
          <SegmentedControl
            segments={['Upcoming', 'Past']}
            activeIndex={viewMode}
            onChange={setViewMode}
          />

          <View style={{ marginTop: SPACING.md }}>
            {events.length === 0 ? (
              <GlassCard depth={1}>
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No upcoming events</Text>
                  <Text style={styles.emptySubtext}>New events will appear here</Text>
                </View>
              </GlassCard>
            ) : (
              events.map((event, i) => {
                const myRsvp = event.rsvps?.find((r) => r.memberId === user?.id);
                return (
                  <AnimatedEntry key={event.id} delay={i * 100} direction="right">
                    <EventCard
                      event={{
                        id: event.id as unknown as number,
                        name: event.title,
                        date: event.date,
                        time: event.time,
                        venue_name: event.venueName,
                        image_url: event.imageUrl,
                        capacity: event.capacity,
                        spots_left: event.capacity - (event.rsvps?.length || 0),
                        perks: event.perks,
                        status: event.status,
                      }}
                      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                      style={{ marginBottom: SPACING.md }}
                    />
                    {!myRsvp && (
                      <GradientButton
                        title="Apply to Join"
                        onPress={() => handleRSVP(event.id)}
                        size="sm"
                        icon="✦"
                        style={{ marginTop: -SPACING.sm, marginBottom: SPACING.md }}
                      />
                    )}
                    {myRsvp && (
                      <View style={styles.rsvpStatus}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.rsvpText}>{myRsvp.status}</Text>
                      </View>
                    )}
                  </AnimatedEntry>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  headerInfo: { marginLeft: SPACING.md, flex: 1 },
  greeting: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 0.5 },
  name: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  glowDot: { color: COLORS.primary },
  handle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  achievementsRow: { gap: SPACING.sm, paddingVertical: SPACING.sm },
  emptyState: { alignItems: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600', marginTop: SPACING.sm },
  emptySubtext: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  rsvpText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
