import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from './src/api/notifications';

function AppContent() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Handle notification taps (deep linking)
    const sub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (__DEV__) console.log('Notification tapped:', data);
      // Deep linking: navigate based on notification type
    });

    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
