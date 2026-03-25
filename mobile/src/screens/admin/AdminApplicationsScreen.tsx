import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/config';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../api/client';
import { Application } from '../../types';

export function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await api.get<{ applications: Application[] }>('/api/applications');
      setApplications(data.applications || []);
    } catch (err) {
      if (__DEV__) console.log('Failed to fetch applications:', err);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }, [fetchApplications]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await api.patch(`/api/applications/${id}`, { status: action });
      Alert.alert('Done', `Application ${action}`);
      fetchApplications();
    } catch (err) {
      Alert.alert('Error', 'Failed to update application');
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'waitlisted': return 'warning';
      default: return 'gold';
    }
  };

  const renderItem = ({ item }: { item: Application }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.handle}>@{item.instagram}</Text>
        </View>
        <Badge text={item.status} variant={statusVariant(item.status) as any} />
      </View>
      <View style={styles.info}>
        <Text style={styles.infoText}>{item.followerCount?.toLocaleString()} followers</Text>
        <Text style={styles.infoText}>{item.city}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <Button title="Approve" onPress={() => handleAction(item.id, 'approved')} size="sm" style={{ flex: 1 }} />
          <Button title="Reject" onPress={() => handleAction(item.id, 'rejected')} variant="danger" size="sm" style={{ flex: 1 }} />
        </View>
      )}
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={applications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListEmptyComponent={<EmptyState icon="document-text-outline" title="No applications" subtitle="Applications will appear here" />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
  card: { marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  handle: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  info: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  infoText: { fontSize: 13, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
});
