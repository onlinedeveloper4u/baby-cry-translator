import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AnalyzingScreen() {
  const { uri = '', ts = '' } = useLocalSearchParams<{ uri?: string; ts?: string }>();

  React.useEffect(() => {
    const id = setTimeout(() => {
      router.replace({ pathname: '/analyze/result', params: { uri: String(uri), ts: String(ts) } });
    }, 1500);
    return () => clearTimeout(id);
  }, [uri, ts]);
  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      <View className="flex-row items-center justify-between px-6 pt-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0b0b0b" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-neutral-900">Analyze</Text>
        <View style={{ width: 28 }} />
      </View>

      <View className="px-6 pt-6">
        <View className="rounded-3xl overflow-hidden">
          <Image
            source={require('../../assets/images/analysis/analyzing.png')}
            resizeMode="cover"
            style={{ width: '100%', height: 260 }}
          />
        </View>
        <Text className="text-neutral-900 text-4xl font-extrabold text-center mt-10">Analyzing...</Text>
      </View>
    </SafeAreaView>
  );
}


