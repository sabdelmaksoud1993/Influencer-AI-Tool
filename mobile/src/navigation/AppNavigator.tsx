import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ApplyScreen } from '../screens/auth/ApplyScreen';
import { RegisterVenueScreen } from '../screens/auth/RegisterVenueScreen';
import { CreatorTabs } from './CreatorTabs';
import { VenueTabs } from './VenueTabs';
import { AdminTabs } from './AdminTabs';
import { COLORS } from '../constants/config';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Apply"
              component={ApplyScreen}
              options={{
                headerShown: true,
                title: 'Apply as Creator',
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.text,
              }}
            />
            <Stack.Screen
              name="RegisterVenue"
              component={RegisterVenueScreen}
              options={{
                headerShown: true,
                title: 'Register Venue',
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.text,
              }}
            />
          </>
        ) : user?.role === 'venue' ? (
          <Stack.Screen name="VenuePortal" component={VenueTabs} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminPortal" component={AdminTabs} />
        ) : (
          <Stack.Screen name="CreatorPortal" component={CreatorTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
