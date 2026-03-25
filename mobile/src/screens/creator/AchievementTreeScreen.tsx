import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, GRADIENTS, GLASS, SHADOWS, BORDER_RADIUS, GAMIFICATION } from '../../constants/config';
import { GlassCard } from '../../components/GlassCard';
import { GradientButton } from '../../components/GradientButton';
import { AmbientBackground } from '../../components/AmbientBackground';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOWER_WIDTH = 80;
const NODE_SIZE = 56;

// Extended achievement data with requirements
const ACHIEVEMENT_DATA = [
  {
    ...GAMIFICATION.achievements[0], // First Event
    xpReward: 100,
    requirements: ['Sign up for an event', 'Show up and check in', 'Complete your first night out'],
    tier: 1,
  },
  {
    ...GAMIFICATION.achievements[1], // Content Creator
    xpReward: 200,
    requirements: ['Submit content proof after 5 events', 'Photos or stories from the night', 'Get verified by the venue'],
    tier: 2,
  },
  {
    ...GAMIFICATION.achievements[2], // Week Warrior
    xpReward: 300,
    requirements: ['Attend events 7 days in a row', 'Each day counts from check-in', 'Missing a day resets the streak'],
    tier: 2,
  },
  {
    ...GAMIFICATION.achievements[7], // Social Butterfly
    xpReward: 400,
    requirements: ['Attend 10 different events', 'Each unique event counts once', 'Any venue, any city'],
    tier: 3,
  },
  {
    ...GAMIFICATION.achievements[4], // Inner Circle
    xpReward: 500,
    requirements: ['Earn 500 XP total', 'Maintain 80%+ reliability', 'Unlock exclusive event access'],
    tier: 3,
  },
  {
    ...GAMIFICATION.achievements[6], // Five Star
    xpReward: 600,
    requirements: ['Achieve 100% reliability score', 'Never miss an RSVP\'d event', 'Submit content on time every time'],
    tier: 4,
  },
  {
    ...GAMIFICATION.achievements[8], // VIP Access
    xpReward: 750,
    requirements: ['Get accepted to 3 exclusive events', 'Exclusive events are invite-only', 'High reliability score required'],
    tier: 4,
  },
  {
    ...GAMIFICATION.achievements[3], // Monthly Maven
    xpReward: 1000,
    requirements: ['Maintain a 30-day event streak', 'Attend at least one event per day', 'The ultimate consistency badge'],
    tier: 5,
  },
  {
    ...GAMIFICATION.achievements[9], // Globe Trotter
    xpReward: 1200,
    requirements: ['Attend events in 3+ different cities', 'Explore venues beyond your hometown', 'Become a global creator'],
    tier: 5,
  },
  {
    ...GAMIFICATION.achievements[5], // Muse Status
    xpReward: 2000,
    requirements: ['Reach Muse tier (2000 XP)', 'The highest creator status', 'Priority access to all events'],
    tier: 6,
  },
];

interface AchievementNodeProps {
  achievement: typeof ACHIEVEMENT_DATA[0];
  index: number;
  isUnlocked: boolean;
  isNext: boolean;
  onPress: () => void;
}

function AchievementNode({ achievement, index, isUnlocked, isNext, onPress }: AchievementNodeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isNext) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [isNext]);

  const isLeft = index % 2 === 0;
  const nodeLeft = isLeft
    ? SCREEN_WIDTH * 0.15 - NODE_SIZE / 2
    : SCREEN_WIDTH * 0.85 - NODE_SIZE / 2;

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(236,72,153,0)', 'rgba(236,72,153,0.4)'],
  });

  return (
    <View style={[styles.nodeContainer, { height: 120 }]}>
      {/* Connection line to tower */}
      <View
        style={[
          styles.connectionLine,
          {
            left: isLeft ? SCREEN_WIDTH * 0.15 : SCREEN_WIDTH / 2,
            width: isLeft ? SCREEN_WIDTH / 2 - SCREEN_WIDTH * 0.15 : SCREEN_WIDTH * 0.85 - SCREEN_WIDTH / 2,
          },
        ]}
      >
        <LinearGradient
          colors={isUnlocked
            ? [COLORS.primary, COLORS.gold]
            : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
          start={{ x: isLeft ? 0 : 1, y: 0 }}
          end={{ x: isLeft ? 1 : 0, y: 0 }}
          style={styles.connectionGradient}
        />
      </View>

      {/* Achievement node */}
      <Animated.View
        style={[
          styles.nodePosition,
          { left: nodeLeft, transform: [{ scale: isNext ? pulseAnim : 1 }] },
        ]}
      >
        <PressableScale onPress={onPress}>
          {isNext && (
            <Animated.View style={[styles.nodeGlow, { backgroundColor: glowColor as any }]} />
          )}
          <LinearGradient
            colors={
              isUnlocked
                ? [COLORS.gold, '#D97706']
                : isNext
                ? GRADIENTS.pinkPurple as unknown as string[]
                : ['rgba(45,37,69,0.6)', 'rgba(30,21,53,0.8)']
            }
            style={[
              styles.nodeCircle,
              isUnlocked && styles.nodeUnlocked,
              !isUnlocked && !isNext && styles.nodeLocked,
            ]}
          >
            <Text style={styles.nodeIcon}>{achievement.icon}</Text>
          </LinearGradient>
          <Text
            style={[
              styles.nodeLabel,
              isUnlocked && styles.nodeLabelUnlocked,
              isNext && styles.nodeLabelNext,
            ]}
            numberOfLines={2}
          >
            {achievement.label}
          </Text>
          {isUnlocked && (
            <View style={styles.checkBadge}>
              <Text style={{ fontSize: 10 }}>✅</Text>
            </View>
          )}
        </PressableScale>
      </Animated.View>
    </View>
  );
}

function AchievementDetailModal({
  achievement,
  isUnlocked,
  isNext,
  visible,
  onClose,
}: {
  achievement: typeof ACHIEVEMENT_DATA[0] | null;
  isUnlocked: boolean;
  isNext: boolean;
  visible: boolean;
  onClose: () => void;
}) {
  if (!achievement) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(45,37,69,0.98)', 'rgba(15,10,26,0.98)']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <LinearGradient
                colors={isUnlocked ? [COLORS.gold, '#D97706'] : GRADIENTS.pinkPurple as unknown as string[]}
                style={styles.modalIconCircle}
              >
                <Text style={styles.modalIcon}>{achievement.icon}</Text>
              </LinearGradient>

              <Text style={styles.modalTitle}>{achievement.label}</Text>
              <Text style={styles.modalDescription}>{achievement.description}</Text>

              {/* Status badge */}
              <View style={[styles.statusBadge, isUnlocked ? styles.statusUnlocked : isNext ? styles.statusNext : styles.statusLocked]}>
                <Text style={styles.statusText}>
                  {isUnlocked ? '✅ Unlocked' : isNext ? '🔓 In Progress' : '🔒 Locked'}
                </Text>
              </View>

              {/* XP Reward */}
              <View style={styles.xpRow}>
                <Text style={styles.xpLabel}>XP Reward</Text>
                <LinearGradient
                  colors={[COLORS.gold, '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.xpBadge}
                >
                  <Text style={styles.xpValue}>+{achievement.xpReward} XP</Text>
                </LinearGradient>
              </View>

              {/* Requirements */}
              <Text style={styles.requirementsTitle}>How to unlock</Text>
              {achievement.requirements.map((req, i) => (
                <View key={i} style={styles.requirementRow}>
                  <View style={[styles.requirementDot, isUnlocked && styles.requirementDotDone]} />
                  <Text style={[styles.requirementText, isUnlocked && styles.requirementTextDone]}>
                    {req}
                  </Text>
                </View>
              ))}

              {/* Tier info */}
              <View style={styles.tierRow}>
                <Text style={styles.tierLabel}>Tier {achievement.tier}</Text>
                <View style={styles.tierDots}>
                  {[1, 2, 3, 4, 5, 6].map((t) => (
                    <View
                      key={t}
                      style={[
                        styles.tierDot,
                        t <= achievement.tier && styles.tierDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <GradientButton
                title="Got It"
                onPress={onClose}
                variant={isUnlocked ? 'gold' : 'primary'}
                style={{ marginTop: SPACING.lg }}
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function AchievementTreeScreen() {
  const { user } = useAuth();
  const [selectedAchievement, setSelectedAchievement] = useState<typeof ACHIEVEMENT_DATA[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Calculate unlocked achievements
  const eventsAttended = user?.eventsAttended || 0;
  const contentScore = user?.contentScore || 0;
  const currentXP = eventsAttended * GAMIFICATION.xpValues.eventAttended + contentScore * GAMIFICATION.xpValues.contentSubmitted;

  const unlockedIds = new Set<string>();
  if (eventsAttended >= 1) unlockedIds.add('first_event');
  if (contentScore >= 5) unlockedIds.add('content_creator');
  if (eventsAttended >= 7) unlockedIds.add('streak_7');
  if (eventsAttended >= 10) unlockedIds.add('social_butterfly');
  if (currentXP >= 500) unlockedIds.add('inner_circle');
  if ((user?.reliabilityScore || 0) >= 100) unlockedIds.add('five_stars');
  if (eventsAttended >= 30) unlockedIds.add('streak_30');
  if (currentXP >= 2000) unlockedIds.add('muse');

  const unlockedCount = ACHIEVEMENT_DATA.filter((a) => unlockedIds.has(a.id)).length;
  const nextIndex = Math.min(unlockedCount, ACHIEVEMENT_DATA.length - 1);

  const handleNodePress = (achievement: typeof ACHIEVEMENT_DATA[0]) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  useEffect(() => {
    // Scroll to bottom (start of tower) on mount
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  return (
    <AmbientBackground>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {unlockedCount}/{ACHIEVEMENT_DATA.length} Unlocked
            </Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={GRADIENTS.pinkPurple as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(unlockedCount / ACHIEVEMENT_DATA.length) * 100}%` as any }]}
              />
            </View>
          </View>
        </View>

        {/* Tower */}
        <ScrollView
          ref={scrollRef}
          style={styles.towerScroll}
          contentContainerStyle={styles.towerContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Crown at top */}
          <View style={styles.crownContainer}>
            <LinearGradient
              colors={[COLORS.gold, '#D97706']}
              style={styles.crownCircle}
            >
              <Text style={styles.crownIcon}>👑</Text>
            </LinearGradient>
            <Text style={styles.crownLabel}>Muse Status</Text>
            <Text style={styles.crownSub}>The Ultimate Creator</Text>
          </View>

          {/* Tower spine */}
          <View style={styles.towerSpine}>
            <LinearGradient
              colors={['rgba(236,72,153,0.3)', 'rgba(139,92,246,0.3)', 'rgba(236,72,153,0.1)']}
              style={styles.towerGradient}
            />
            {/* Glow segments for unlocked portion */}
            <View
              style={[
                styles.towerUnlocked,
                { height: `${(unlockedCount / ACHIEVEMENT_DATA.length) * 100}%` as any },
              ]}
            >
              <LinearGradient
                colors={[COLORS.gold, COLORS.primary]}
                style={{ flex: 1, borderRadius: 4 }}
              />
            </View>
          </View>

          {/* Achievement nodes - reversed so bottom = first */}
          {[...ACHIEVEMENT_DATA].reverse().map((achievement, reverseIndex) => {
            const originalIndex = ACHIEVEMENT_DATA.length - 1 - reverseIndex;
            const isUnlocked = unlockedIds.has(achievement.id);
            const isNext = originalIndex === nextIndex && !isUnlocked;
            return (
              <AchievementNode
                key={achievement.id}
                achievement={achievement}
                index={reverseIndex}
                isUnlocked={isUnlocked}
                isNext={isNext}
                onPress={() => handleNodePress(achievement)}
              />
            );
          })}

          {/* Base */}
          <View style={styles.baseContainer}>
            <LinearGradient
              colors={['rgba(45,37,69,0.8)', 'rgba(30,21,53,0.6)']}
              style={styles.basePlatform}
            >
              <Text style={styles.baseIcon}>🚀</Text>
              <Text style={styles.baseLabel}>Start Here</Text>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Detail Modal */}
        <AchievementDetailModal
          achievement={selectedAchievement}
          isUnlocked={selectedAchievement ? unlockedIds.has(selectedAchievement.id) : false}
          isNext={selectedAchievement ? ACHIEVEMENT_DATA.indexOf(selectedAchievement) === nextIndex : false}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    width: 120,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  towerScroll: { flex: 1 },
  towerContent: {
    paddingBottom: SPACING.xxl,
    minHeight: ACHIEVEMENT_DATA.length * 120 + 200,
  },
  towerSpine: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 4,
    top: 80,
    bottom: 60,
    width: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  towerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  towerUnlocked: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  crownContainer: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  crownIcon: { fontSize: 36 },
  crownLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gold,
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  crownSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  nodeContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  connectionLine: {
    position: 'absolute',
    top: '50%',
    height: 2,
    marginTop: -1,
  },
  connectionGradient: {
    flex: 1,
    borderRadius: 1,
  },
  nodePosition: {
    position: 'absolute',
    alignItems: 'center',
    width: NODE_SIZE + 40,
  },
  nodeGlow: {
    position: 'absolute',
    width: NODE_SIZE + 20,
    height: NODE_SIZE + 20,
    borderRadius: (NODE_SIZE + 20) / 2,
    top: -10,
    left: (NODE_SIZE + 40) / 2 - (NODE_SIZE + 20) / 2,
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  nodeUnlocked: {
    borderColor: COLORS.gold,
    ...SHADOWS.md,
  },
  nodeLocked: {
    opacity: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  nodeIcon: { fontSize: 24 },
  nodeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    width: NODE_SIZE + 30,
  },
  nodeLabelUnlocked: { color: COLORS.gold },
  nodeLabelNext: { color: COLORS.primary },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  modalGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: BORDER_RADIUS.xl,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  modalIcon: { fontSize: 40 },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  statusUnlocked: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusNext: { backgroundColor: 'rgba(236,72,153,0.15)' },
  statusLocked: { backgroundColor: 'rgba(255,255,255,0.06)' },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  xpLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  xpBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    alignSelf: 'flex-start',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: SPACING.sm,
  },
  requirementDotDone: {
    backgroundColor: COLORS.success,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  requirementTextDone: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tierLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tierDots: {
    flexDirection: 'row',
    gap: 4,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tierDotActive: {
    backgroundColor: COLORS.primary,
  },
  baseContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  basePlatform: {
    width: 120,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  baseIcon: { fontSize: 24 },
  baseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
