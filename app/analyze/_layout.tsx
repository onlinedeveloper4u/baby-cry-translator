import { Stack } from 'expo-router';
import React from 'react';

export default function AnalyzeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'fullScreenModal' }} />
  );
}


