import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { AnimatedEntry } from '../../components/AnimatedEntry';
import { api } from '../../api/client';
import { Member } from '../../types';

export function AdminMembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await api.get<{ members: Member[] }>('/api/members');
      setMembers(data.members || []);
      setFiltered(data.members || []);
    } catch (err) {
      console.log('Failed to fetch members:', err);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(members);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.instagram.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.tier.toLowerCase().includes(q) ||
          m.accessCode.toLowerCase().includes(q)
      )
    );
  }, [search, members]);

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
      <View style={styles.bottomRow}>
        <Badge text={item.status} variant={item.status === 'active' ? 'success' : 'error'} />
        <Text style={styles.cityText}>{item.city}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <AnimatedEntry delay={0} direction="down" distance={15}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search by name, IG, email, city, tier..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          <Text style={styles.resultCount}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
      </AnimatedEntry>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No members found" subtitle={search ? 'Try a different search' : 'Members will appear here'} />}
      />
    </View>
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
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  resultCount: { fontSize: 12, color: COLORS.textMuted, marginTop: -SPACING.sm, marginBottom: SPACING.sm },
  list: { padding: SPACING.lg, paddingTop: 0 },
  card: { marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  handle: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  stats: { flexDirection: 'row', gap: SPACING.sm, marginVertical: SPACING.sm, flexWrap: 'wrap' },
  pill: { backgroundColor: COLORS.surfaceLight, borderRadius: 8, paddingHorizontal: SPACING.sm, paddingVertical: 4, alignItems: 'center' },
  pillValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  pillLabel: { fontSize: 10, color: COLORS.textMuted },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityText: { fontSize: 12, color: COLORS.textMuted },
});
