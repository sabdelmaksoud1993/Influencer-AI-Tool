import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../api/client';
import { Member } from '../../types';

export function AdminMembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await api.get<{ members: Member[] }>('/api/members');
      setMembers(data.members || []);
    } catch (err) {
      console.log('Failed to fetch members:', err);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  }, [fetchMembers]);

  const renderItem = ({ item }: { item: Member }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.handle}>@{item.instagram}</Text>
        </View>
        <Badge text={item.tier} variant="gold" />
      </View>
      <View style={styles.stats}>
        <StatPill label="Events" value={item.eventsAttended} />
        <StatPill label="Score" value={item.contentScore} />
        <StatPill label="Reliable" value={`${item.reliabilityScore}%`} />
        <StatPill label="Strikes" value={item.strikes} />
      </View>
      <Badge text={item.status} variant={item.status === 'active' ? 'success' : 'error'} />
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={members}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListEmptyComponent={<EmptyState icon="people-outline" title="No members" subtitle="Members will appear here" />}
    />
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
  card: { marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  handle: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  stats: { flexDirection: 'row', gap: SPACING.sm, marginVertical: SPACING.sm, flexWrap: 'wrap' },
  pill: { backgroundColor: COLORS.surfaceLight, borderRadius: 8, paddingHorizontal: SPACING.sm, paddingVertical: 4, alignItems: 'center' },
  pillValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  pillLabel: { fontSize: 10, color: COLORS.textMuted },
});
