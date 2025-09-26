import { Ionicons } from '@expo/vector-icons';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  function openSettings() {
    router.push('/(tabs)/settings');
  }

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
        await requestRecordingPermissionsAsync();

        // Only prompt for notifications when supported in the current runtime
        const isSupportedRuntime = Platform.OS === 'ios' || Constants.appOwnership !== 'expo';
        if (isSupportedRuntime) {
          await new Promise<void>((resolve) => {
            Alert.alert(
              'Notifications',
              'Enable notifications to receive real-time alerts about your baby\'s cries and important updates from the app.',
              [{ text: 'Allow Notifications', onPress: () => resolve() }],
              { cancelable: false }
            );
          });
          const Notifications = await import('expo-notifications');
          await Notifications.requestPermissionsAsync();
        }

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
    <SafeAreaView className="flex-1 bg-rose-50">
      <View className="flex-row items-center justify-between px-6 pt-6">
        <View style={{ width: 28 }} />
        <Text className="text-3xl font-extrabold text-neutral-900">Analyze</Text>
        <TouchableOpacity onPress={openSettings} accessibilityRole="button">
          <Ionicons name="settings-outline" size={28} color="#0b0b0b" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-extrabold text-neutral-900 mb-6">Today</Text>

        <View>
          <View className="flex-row items-center mb-5">
            <View className="w-16 h-16 bg-rose-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="fast-food-outline" size={26} color="#0b0b0b" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-900">Hungry</Text>
              <Text className="text-lg text-rose-600 mt-1">10:30 AM</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5">
            <View className="w-16 h-16 bg-rose-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="moon-outline" size={26} color="#0b0b0b" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-900">Sleepy</Text>
              <Text className="text-lg text-rose-600 mt-1">11:45 AM</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5">
            <View className="w-16 h-16 bg-rose-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="fast-food-outline" size={26} color="#0b0b0b" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-900">Hungry</Text>
              <Text className="text-lg text-rose-600 mt-1">1:15 PM</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-8">
            <View className="w-16 h-16 bg-rose-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="moon-outline" size={26} color="#0b0b0b" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-900">Sleepy</Text>
              <Text className="text-lg text-rose-600 mt-1">2:30 PM</Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl overflow-hidden">
          <View>
            <Image
              source={require('../../assets/images/analysis/baby.png')}
              resizeMode="cover"
              style={{ width: '100%', height: 280 }}
            />
            <View style={{ position: 'absolute', left: 20, bottom: 20, right: 20 }}>
              <View className="flex-row items-end justify-between">
                <Text className="text-white text-3xl font-extrabold pr-4" style={{ flexShrink: 1 }}>
                  Is your baby{"\n"}crying now?
                </Text>
                <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-full" onPress={() => router.push('/analyze/listen')}>
                  <Text className="text-white text-lg font-bold">Record Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
