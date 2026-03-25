import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, GRADIENTS, GLASS, SHADOWS, BORDER_RADIUS } from '../../constants/config';
import { GlassCard } from '../../components/GlassCard';
import { StatCard } from '../../components/StatCard';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { AmbientBackground } from '../../components/AmbientBackground';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Event } from '../../types';

export function VenueAnalyticsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.get<{ events: Event[] }>(
        `/api/events?venueId=${user?.id}`
      );
      setEvents(data.events || []);
    } catch (err) {
      if (__DEV__) console.log('Failed to fetch events:', err);
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

  // Calculate analytics
  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.status === 'completed').length;
  const totalRsvps = events.reduce((acc, e) => acc + (e.rsvps?.length || 0), 0);
  const totalAttended = events.reduce(
    (acc, e) => acc + (e.rsvps?.filter((r) => r.status === 'attended').length || 0), 0
  );
  const totalNoShows = events.reduce(
    (acc, e) => acc + (e.rsvps?.filter((r) => r.status === 'no_show').length || 0), 0
  );
  const totalCapacity = events.reduce((acc, e) => acc + e.capacity, 0);
  const attendanceRate = totalRsvps > 0 ? Math.round((totalAttended / totalRsvps) * 100) : 0;
  const fillRate = totalCapacity > 0 ? Math.round((totalRsvps / totalCapacity) * 100) : 0;
  const contentSubmitted = events.reduce(
    (acc, e) => acc + (e.rsvps?.filter((r) => r.contentStatus === 'submitted' || r.contentStatus === 'verified').length || 0), 0
  );
  const contentVerified = events.reduce(
    (acc, e) => acc + (e.rsvps?.filter((r) => r.contentStatus === 'verified').length || 0), 0
  );

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <AnimatedEntry delay={0} direction="down" distance={20}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <LinearGradient
              colors={GRADIENTS.pinkPurple as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subtitleBadge}
            >
              <Text style={styles.subtitleText}>{user?.name}</Text>
            </LinearGradient>
          </View>
        </AnimatedEntry>

        {/* Overview Stats */}
        <AnimatedEntry delay={150}>
          <View style={styles.statsRow}>
            <View style={styles.statFlex}>
              <StatCard icon="🎪" label="Total Events" value={totalEvents} accentColor={COLORS.primary} delay={0} />
            </View>
            <View style={styles.statFlex}>
              <StatCard icon="✅" label="Completed" value={completedEvents} accentColor={COLORS.success} delay={80} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statFlex}>
              <StatCard icon="👥" label="Total RSVPs" value={totalRsvps} accentColor="#3B82F6" delay={160} />
            </View>
            <View style={styles.statFlex}>
              <StatCard icon="🚶" label="Attended" value={totalAttended} accentColor={COLORS.purple} delay={240} />
            </View>
          </View>
        </AnimatedEntry>

        {/* Performance Metrics */}
        <AnimatedEntry delay={300}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <GlassCard depth={2} noPadding>
              <LinearGradient
                colors={['rgba(236,72,153,0.12)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccentBar}
              />
              <View style={styles.metricsBody}>
                <MetricBar label="Attendance Rate" value={attendanceRate} color={COLORS.success} />
                <MetricBar label="Fill Rate" value={fillRate} color={COLORS.primary} isLast />
              </View>
            </GlassCard>
          </View>
        </AnimatedEntry>

        {/* Content & Accountability */}
        <AnimatedEntry delay={450}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Content & Accountability</Text>
            <View style={styles.statsRow}>
              <View style={styles.statFlex}>
                <StatCard icon="📸" label="Submitted" value={contentSubmitted} accentColor="#EC4899" delay={0} />
              </View>
              <View style={styles.statFlex}>
                <StatCard icon="✔️" label="Verified" value={contentVerified} accentColor={COLORS.success} delay={80} />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statFlex}>
                <StatCard icon="❌" label="No-Shows" value={totalNoShows} accentColor={COLORS.error} delay={160} />
              </View>
              <View style={styles.statFlex}>
                <StatCard
                  icon="📊"
                  label="Avg Capacity"
                  value={totalEvents > 0 ? Math.round(totalCapacity / totalEvents) : 0}
                  accentColor={COLORS.warning}
                  delay={240}
                />
              </View>
            </View>
          </View>
        </AnimatedEntry>

        {/* Recent Events Performance */}
        <AnimatedEntry delay={600}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            {events.slice(0, 5).map((event, index) => {
              const rsvpCount = event.rsvps?.length || 0;
              const attended = event.rsvps?.filter((r) => r.status === 'attended').length || 0;
              const rate = rsvpCount > 0 ? Math.round((attended / rsvpCount) * 100) : 0;
              return (
                <AnimatedEntry key={event.id} delay={640 + index * 60}>
                  <GlassCard depth={1} style={styles.eventCard} noPadding>
                    <View style={styles.eventRow}>
                      <View style={styles.eventIconBg}>
                        <Ionicons name="calendar" size={16} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventDate}>{event.date}</Text>
                      </View>
                      <View style={styles.eventStats}>
                        <Text style={styles.eventStatValue}>{rsvpCount}/{event.capacity}</Text>
                        <Text style={styles.eventStatLabel}>RSVPs</Text>
                      </View>
                      <View style={styles.eventStats}>
                        <Text style={[styles.eventStatValue, { color: rate >= 70 ? COLORS.success : COLORS.warning }]}>
                          {rate}%
                        </Text>
                        <Text style={styles.eventStatLabel}>Rate</Text>
                      </View>
                    </View>
                  </GlassCard>
                </AnimatedEntry>
              );
            })}
            {events.length === 0 && (
              <GlassCard depth={1}>
                <Text style={styles.noEventsText}>No events to display</Text>
              </GlassCard>
            )}
          </View>
        </AnimatedEntry>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </AmbientBackground>
  );
}

function MetricBar({
  label,
  value,
  color,
  isLast = false,
}: {
  label: string;
  value: number;
  color: string;
  isLast?: boolean;
}) {
  const animWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animWidth, {
      toValue: value,
      duration: 1000,
      delay: 500,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.metricRow, !isLast && styles.metricRowBorder]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.metricBarBg}>
        <Animated.View style={{ width: width as any, height: '100%', borderRadius: 4, overflow: 'hidden' }}>
          <LinearGradient
            colors={[color, `${color}99`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.metricBarFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
    marginBottom: SPACING.xs,
  },
  subtitleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statFlex: {
    flex: 1,
  },
  cardAccentBar: {
    height: 3,
    width: '100%',
  },
  metricsBody: {
    padding: SPACING.md,
  },
  metricRow: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
  },
  metricRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    flex: 1,
    borderRadius: 4,
  },
  eventCard: {
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  eventIconBg: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(236,72,153,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  eventStats: {
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  eventStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  eventStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noEventsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
});
