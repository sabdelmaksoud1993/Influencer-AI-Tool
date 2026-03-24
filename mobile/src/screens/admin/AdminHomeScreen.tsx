import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { DashboardStats } from '../../types';

export function AdminHomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<DashboardStats>('/api/stats');
      setStats(data);
    } catch (err) {
      console.log('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>Glow Pass</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={24} color="#000" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="document-text" label="Applications" value={stats?.totalApplications || 0} subValue={`${stats?.pendingApplications || 0} pending`} color={COLORS.primary} />
        <StatCard icon="people" label="Members" value={stats?.totalMembers || 0} subValue={`${stats?.activeMembers || 0} active`} color={COLORS.success} />
        <StatCard icon="calendar" label="Events" value={stats?.totalEvents || 0} subValue={`${stats?.upcomingEvents || 0} upcoming`} color="#3B82F6" />
        <StatCard icon="business" label="Venues" value={stats?.totalVenues || 0} subValue="registered" color={COLORS.warning} />
        <StatCard icon="trending-up" label="Attendance" value={`${stats?.avgAttendanceRate || 0}%`} subValue="avg rate" color="#8B5CF6" />
        <StatCard icon="checkmark-circle" label="Content" value={stats?.totalContentVerified || 0} subValue="verified" color="#EC4899" />
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, subValue, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  subValue: string;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.iconBg, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{subValue}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingTop: SPACING.xl,
  },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg, gap: SPACING.sm,
  },
  statCard: {
    width: '48%' as any,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});
