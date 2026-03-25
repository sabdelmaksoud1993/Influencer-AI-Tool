import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './PressableScale';
import { CapacityGauge } from './CapacityGauge';
import { GradientAvatarRing } from './GradientAvatarRing';
import { COLORS, GLASS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  event: {
    id: number;
    name: string;
    date: string;
    time?: string;
    venue_name?: string;
    address?: string;
    image_url?: string;
    capacity: number;
    spots_left: number;
    perks?: string[];
    status?: string;
  };
  onPress?: () => void;
  style?: object;
}

const PERK_ICONS: Record<string, string> = {
  'Free Entry': '🎟️',
  'Free Drinks': '🍸',
  'VIP Access': '👑',
  'Photo Opp': '📸',
  'Backstage': '🎤',
  'Gift Bag': '🎁',
  'Meet & Greet': '🤝',
  'Plus One': '👯',
};

export function EventCard({ event, onPress, style }: Props) {
  const hasImage = !!event.image_url;

  return (
    <PressableScale onPress={onPress} style={style}>
      <View style={[styles.card, SHADOWS.md]}>
        {hasImage ? (
          <ImageBackground
            source={{ uri: event.image_url }}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(15, 10, 26, 0.85)', 'rgba(15, 10, 26, 0.98)']}
              style={styles.imageOverlay}
            >
              {renderContent(event)}
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[GLASS.background, 'rgba(15, 10, 26, 0.9)']}
            style={styles.noImageBg}
          >
            {renderContent(event)}
          </LinearGradient>
        )}
      </View>
    </PressableScale>
  );
}

function renderContent(event: Props['event']) {
  return (
    <View style={styles.content}>
      <Text style={styles.name} numberOfLines={1}>{event.name}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
        <Text style={styles.detail}>{event.date}</Text>
        {event.time && (
          <>
            <Ionicons name="time-outline" size={13} color={COLORS.primary} style={{ marginLeft: 10 }} />
            <Text style={styles.detail}>{event.time}</Text>
          </>
        )}
      </View>

      {event.venue_name && (
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.primary} />
          <Text style={styles.detail} numberOfLines={1}>{event.venue_name}</Text>
        </View>
      )}

      {event.perks && event.perks.length > 0 && (
        <View style={styles.perksRow}>
          {event.perks.slice(0, 4).map((perk) => (
            <View key={perk} style={styles.perkBadge}>
              <Text style={styles.perkText}>
                {PERK_ICONS[perk] || '✨'} {perk}
              </Text>
            </View>
          ))}
        </View>
      )}

      <CapacityGauge
        spotsLeft={event.spots_left}
        capacity={event.capacity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  imageBackground: {
    width: '100%',
    minHeight: 180,
  },
  imageStyle: {
    borderRadius: BORDER_RADIUS.lg,
    opacity: 0.6,
  },
  imageOverlay: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  noImageBg: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  content: {
    gap: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  perkBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  perkText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '600',
  },
});
