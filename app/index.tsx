import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from "expo-router";
import React from 'react';
import { View } from 'react-native';

export default function Index() {
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function determineStartRoute() {
      try {
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(hasOnboarded === 'true');
      } catch {
        setHasOnboarded(false);
      }
    }
    determineStartRoute();
  }, []);

  if (hasOnboarded === null) {
    return <View />;
  }

  return hasOnboarded ? (
    <Redirect href="/auth" />
  ) : (
    <Redirect href="/onboarding" />
  );
}
