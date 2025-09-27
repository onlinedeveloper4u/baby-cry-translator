import { Stack } from 'expo-router';
import '../global.css';
import React from 'react';
import { QueryClientProvider, useIsFetching } from '@tanstack/react-query';
import queryClient from '../src/config/queryClient';
import LoadingOverlay from '../src/components/LoadingOverlay';
import { supabase } from '../src/config/supabase';
import Snackbar from '../src/components/Snackbar';

export default function RootLayout() {
  const [initializing, setInitializing] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().finally(() => {
      if (mounted) setInitializing(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function OverlayWrapper({ children }: { children: React.ReactNode }) {
    const isFetching = useIsFetching();
    const visible = initializing || (typeof isFetching === 'number' && isFetching > 0);
    return (
      <>
        {children}
        <LoadingOverlay visible={!!visible} message={visible ? 'Loading data…' : 'Preparing…'} />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OverlayWrapper>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="babies" options={{ headerShown: false }} />
          <Stack.Screen name="analyze" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
        <Snackbar />
      </OverlayWrapper>
    </QueryClientProvider>
  );
}
