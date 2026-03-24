import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../api/client';
import { Venue } from '../../types';

export function AdminVenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVenues = useCallback(async () => {
    try {
      const data = await api.get<{ venues: Venue[] }>('/api/venues');
      setVenues(data.venues || []);
    } catch (err) {
      console.log('Failed to fetch venues:', err);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  }, [fetchVenues]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/venues/${id}/approve`);
      Alert.alert('Success', 'Venue approved');
      fetchVenues();
    } catch (err) {
      Alert.alert('Error', 'Failed to approve venue');
    }
  };

  const renderItem = ({ item }: { item: Venue }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subText}>{item.venueType} - {item.location}</Text>
        </View>
        <Badge text={item.status} variant={item.status === 'active' ? 'success' : 'warning'} />
      </View>
      <View style={styles.info}>
        <Text style={styles.infoText}>{item.contactName}</Text>
        <Text style={styles.infoText}>{item.totalEvents} events</Text>
        <Text style={styles.infoText}>{item.totalMembersSent} members sent</Text>
      </View>
      {item.status === 'pending' && (
        <Button title="Approve Venue" onPress={() => handleApprove(item.id)} size="sm" style={{ marginTop: SPACING.sm }} />
      )}
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={venues}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListEmptyComponent={<EmptyState icon="business-outline" title="No venues" subtitle="Venues will appear here" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
  card: { marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  subText: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  info: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm, flexWrap: 'wrap' },
  infoText: { fontSize: 13, color: COLORS.textSecondary },
});
