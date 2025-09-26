import { Ionicons } from '@expo/vector-icons';
import { Audio, Sound } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadAudioAndCreateRecording } from '../../src/api/recordings';
import { useAuthStore } from '../../src/store/auth';
import { useBabiesStore } from '../../src/store/babies';

export default function AnalyzeResultScreen() {
  const { uri = '', ts = '' } = useLocalSearchParams<{ uri?: string; ts?: string }>();
  const [notes, setNotes] = React.useState('');
  const { user } = useAuthStore();
  const { activeBabyId } = useBabiesStore();
  const [sound, setSound] = React.useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uri) return;
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: String(uri) });
        if (mounted) setSound(sound);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
      if (sound) sound.unloadAsync().catch(() => undefined);
    };
  }, [uri]);

  async function togglePlay() {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!('isLoaded' in status) || !status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  async function handleSave() {
    if (!user?.id || !activeBabyId || !uri) return;
    try {
      setSaving(true);
      await uploadAudioAndCreateRecording({ userId: user.id, babyId: activeBabyId, fileUri: String(uri), notes });
      router.replace('/(tabs)/logs');
    } catch {
      // ignore for now
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#0b0b0b" />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-neutral-900">Cry Analysis</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text className="text-3xl font-extrabold text-neutral-900 mb-6">Cry Timeline</Text>
        <View className="mb-8">
          <Text className="text-2xl text-neutral-900">Cry Detected</Text>
          <Text className="text-xl text-rose-600 mt-2">{ts ? String(ts) : 'Just now'}</Text>
        </View>

        <Text className="text-3xl font-extrabold text-neutral-900 mb-4">Audio Thumbnail</Text>
        <View className="bg-rose-100 rounded-2xl p-5 flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-xl font-extrabold text-neutral-900">Cry Recording</Text>
            <Text className="text-lg text-rose-600 mt-1">{ts ? String(ts) : 'Just now'}</Text>
          </View>
          <TouchableOpacity onPress={togglePlay} className="w-14 h-14 rounded-full bg-red-600 items-center justify-center">
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-extrabold text-neutral-900 mb-4">Prediction Breakdown</Text>
        <View className="flex-row justify-between mb-10">
          <View>
            <Text className="text-2xl text-neutral-900">Hunger</Text>
            <Text className="text-xl text-neutral-900">85%</Text>
          </View>
          <View>
            <Text className="text-2xl text-neutral-900">Discomfort</Text>
            <Text className="text-xl text-neutral-900">10%</Text>
          </View>
          <View>
            <Text className="text-2xl text-neutral-900">Other</Text>
            <Text className="text-xl text-neutral-900">5%</Text>
          </View>
        </View>

        <Text className="text-3xl font-extrabold text-neutral-900 mb-4">Notes</Text>
        <TextInput
          className="border border-rose-200 rounded-2xl p-4 h-40 bg-white"
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any observations…"
          placeholderTextColor="#9CA3AF"
        />

        <View className="flex-row items-center justify-between mt-8 mb-12">
          <TouchableOpacity className="bg-rose-100 px-6 py-4 rounded-2xl">
            <Text className="text-neutral-900 text-lg font-semibold">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-600 px-6 py-4 rounded-2xl" onPress={handleSave} disabled={saving}>
            <Text className="text-white text-lg font-bold">{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


