import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface Props {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message = 'Loading' }: Props) {
  if (!visible) return null;
  return (
    <View className="absolute inset-0 items-center justify-center pointer-events-none">
      <View className="items-center justify-center bg-white/90 rounded-2xl px-5 py-4 shadow">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-2 text-red-600 font-semibold">{message}</Text>
      </View>
    </View>
  );
}
