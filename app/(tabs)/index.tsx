import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function HomeScreen() {
  const { user, signOut, isGuest } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  React.useEffect(() => {
    let isMounted = true;
    async function requestPermissionsOnce() {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const asked = await AsyncStorage.getItem('askedPerms');
        if (asked === 'true') return;

        await new Promise<void>((resolve) => {
          Alert.alert(
            'Microphone Access',
            "To analyze your baby's cries, we need access to your microphone. This allows us to process audio in real-time and provide insights into your baby's needs.",
            [{ text: 'Allow Microphone', onPress: () => resolve() }],
            { cancelable: false }
          );
        });
        await Audio.requestPermissionsAsync();

        await new Promise<void>((resolve) => {
          Alert.alert(
            'Notifications',
            'Enable notifications to receive real-time alerts about your baby\'s cries and important updates from the app.',
            [{ text: 'Allow Notifications', onPress: () => resolve() }],
            { cancelable: false }
          );
        });
        await Notifications.requestPermissionsAsync();

        if (!isMounted) return;
        await AsyncStorage.setItem('askedPerms', 'true');
      } catch {
        // ignore
      }
    }
    requestPermissionsOnce();
    return () => { isMounted = false; };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Text className="text-3xl font-extrabold text-neutral-900">Analyze</Text>
        <TouchableOpacity onPress={handleSignOut} accessibilityRole="button">
          <Ionicons name="settings-outline" size={28} color="#0b0b0b" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-6 pt-6">
        <TouchableOpacity className="bg-red-500 py-5 rounded-2xl items-center">
          <View className="flex-row items-center gap-3">
            <Ionicons name="mic-outline" size={22} color="#fff" />
            <Text className="text-white text-xl font-bold">Start Listening</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
