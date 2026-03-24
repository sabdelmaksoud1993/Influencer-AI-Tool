import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CreatorTabs } from './CreatorTabs';
import { VenueTabs } from './VenueTabs';
import { AdminTabs } from './AdminTabs';

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
          <Stack.Screen name="Login" component={LoginScreen} />
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
