import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-3xl font-extrabold text-neutral-900">Settings</Text>
      </View>
    </SafeAreaView>
  );
}


