import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';
import { CreatorHomeScreen } from '../screens/creator/CreatorHomeScreen';
import { CreatorEventDetailScreen } from '../screens/creator/CreatorEventDetailScreen';
import { ContentSubmitScreen } from '../screens/creator/ContentSubmitScreen';
import { CreatorProfileScreen } from '../screens/creator/CreatorProfileScreen';

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

export function CreatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Events"
        component={CreatorEventsStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
