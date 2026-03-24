import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';
import { VenueHomeScreen } from '../screens/venue/VenueHomeScreen';
import { VenueProfileScreen } from '../screens/venue/VenueProfileScreen';
import { CreateEventScreen } from '../screens/venue/CreateEventScreen';
import { EventDetailScreen } from '../screens/venue/EventDetailScreen';
import { QRScannerScreen } from '../screens/venue/QRScannerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VenueEventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="VenueHome" component={VenueHomeScreen} options={{ title: 'My Events' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR', headerShown: false }} />
    </Stack.Navigator>
  );
}

export function VenueTabs() {
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
        component={VenueEventsStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanQR"
        component={QRScannerScreen}
        options={{
          title: 'Scan QR',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={VenueProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
