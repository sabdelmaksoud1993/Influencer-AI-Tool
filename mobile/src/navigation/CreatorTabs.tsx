import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS, SHADOWS } from '../constants/config';
import { CreatorHomeScreen } from '../screens/creator/CreatorHomeScreen';
import { CreatorEventDetailScreen } from '../screens/creator/CreatorEventDetailScreen';
import { ContentSubmitScreen } from '../screens/creator/ContentSubmitScreen';
import { CreatorProfileScreen } from '../screens/creator/CreatorProfileScreen';
import { AchievementTreeScreen } from '../screens/creator/AchievementTreeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CreatorEventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="CreatorHome" component={CreatorHomeScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="EventDetail" component={CreatorEventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="ContentSubmit" component={ContentSubmitScreen} options={{ title: 'Submit Content' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name as any} size={22} color={color} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export function CreatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Events"
        component={CreatorEventsStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementTreeScreen}
        options={{
          title: 'Achievements',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="trophy" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CreatorProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(26, 18, 48, 0.95)',
    borderTopColor: GLASS.border,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
    ...SHADOWS.sm,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderRadius: 12,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
