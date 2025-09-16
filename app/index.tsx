import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from "expo-router";
import React from 'react';
import { View } from 'react-native';
import { useAuthStore } from '../src/store/auth';

export default function Index() {
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);
  const { user, loading, initialize, isGuest } = useAuthStore();

  React.useEffect(() => {
    async function determineStartRoute() {
      try {
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(hasOnboarded === 'true');
      } catch {
        setHasOnboarded(false);
      }
    }
    
    initialize();
    determineStartRoute();
  }, [initialize]);

  if (hasOnboarded === null || loading) {
    return <View />;
  }

  // If user is authenticated or guest, go to main app
  if (user || isGuest) {
    return <Redirect href="/(tabs)" />;
  }

  // If not onboarded, show onboarding
  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  // If onboarded but not authenticated, show auth
  return <Redirect href="/auth" />;
}
