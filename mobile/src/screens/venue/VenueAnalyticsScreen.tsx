import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { AnimatedEntry } from '../../components/AnimatedEntry';
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <AnimatedEntry delay={0} direction="down" distance={20}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{user?.name}</Text>
        </View>
      </AnimatedEntry>

      {/* Overview Stats */}
      <AnimatedEntry delay={150}>
        <View style={styles.statsGrid}>
          <StatCard icon="calendar" label="Total Events" value={totalEvents} color={COLORS.primary} />
          <StatCard icon="checkmark-circle" label="Completed" value={completedEvents} color={COLORS.success} />
          <StatCard icon="people" label="Total RSVPs" value={totalRsvps} color="#3B82F6" />
          <StatCard icon="walk" label="Attended" value={totalAttended} color="#8B5CF6" />
        </View>
      </AnimatedEntry>

      {/* Performance Metrics */}
      <AnimatedEntry delay={300}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <Card style={styles.metricsCard}>
          <MetricBar label="Attendance Rate" value={attendanceRate} color={COLORS.success} />
          <MetricBar label="Fill Rate" value={fillRate} color={COLORS.primary} />
        </Card>
      </AnimatedEntry>

      {/* Content & Accountability */}
      <AnimatedEntry delay={450}>
        <Text style={styles.sectionTitle}>Content & Accountability</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="camera" label="Content Submitted" value={contentSubmitted} color="#EC4899" />
          <StatCard icon="checkmark-done" label="Content Verified" value={contentVerified} color={COLORS.success} />
          <StatCard icon="close-circle" label="No-Shows" value={totalNoShows} color={COLORS.error} />
          <StatCard icon="resize" label="Avg Capacity" value={totalEvents > 0 ? Math.round(totalCapacity / totalEvents) : 0} color={COLORS.warning} />
        </View>
      </AnimatedEntry>

      {/* Recent Events Performance */}
      <AnimatedEntry delay={600}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {events.slice(0, 5).map((event) => {
          const rsvpCount = event.rsvps?.length || 0;
          const attended = event.rsvps?.filter((r) => r.status === 'attended').length || 0;
          const rate = rsvpCount > 0 ? Math.round((attended / rsvpCount) * 100) : 0;
          return (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
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
            </Card>
          );
        })}
      </AnimatedEntry>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.iconBg, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
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
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.metricBarBg}>
        <Animated.View style={[styles.metricBarFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, paddingTop: SPACING.xl },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  statCard: { width: '47%' as any, alignItems: 'center', paddingVertical: SPACING.md },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  metricsCard: { marginHorizontal: SPACING.lg },
  metricRow: { marginBottom: SPACING.md },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  metricLabel: { fontSize: 14, color: COLORS.textSecondary },
  metricValue: { fontSize: 14, fontWeight: '700' },
  metricBarBg: { height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  metricBarFill: { height: 8, borderRadius: 4 },
  eventCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  eventDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  eventStats: { alignItems: 'center', marginLeft: SPACING.md },
  eventStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  eventStatLabel: { fontSize: 10, color: COLORS.textMuted },
});
