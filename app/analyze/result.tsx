import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadAudioAndCreateRecording } from '../../src/api/recordings';
import { useAuthStore } from '../../src/store/auth';
import { useBabiesStore } from '../../src/store/babies';
import { useCustomAudioPlayer } from '../../src/hooks/useAudioPlayer';

export default function AnalyzeResultScreen() {
  const { uri = '', ts = '' } = useLocalSearchParams<{ uri?: string; ts?: string }>();
  const [notes, setNotes] = React.useState('');
  const { user } = useAuthStore();
  const { activeBabyId } = useBabiesStore();

  // Ensure URI is properly formatted for audio player
  const audioUri = React.useMemo(() => {
    if (uri && uri !== 'undefined' && typeof uri === 'string') {
      return uri.startsWith('file://') ? uri : `file://${uri}`;
    }
    return null;
  }, [uri]);

  const { isPlaying, audioError, audioLoaded, togglePlay } = useCustomAudioPlayer(audioUri);
  const [showBabyRequired, setShowBabyRequired] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    // Check if audio file exists and is valid
    const checkAudioFile = async () => {
      if (audioUri) {
        try {
          const FileSystem = require('expo-file-system');
          const fileInfo = await FileSystem.getInfoAsync(audioUri);
          console.log('Result screen - Audio file check:', {
            audioUri,
            exists: fileInfo.exists,
            size: fileInfo.size,
            isDirectory: fileInfo.isDirectory
          });

          if (!fileInfo.exists || fileInfo.size < 1024) {
            console.warn('Audio file does not exist or is too small');
          }
        } catch (error) {
          console.warn('Error checking audio file in result screen:', error);
        }
      }
    };

    checkAudioFile();
  }, [audioUri]);



  async function handleSave() {
    if (!user?.id || !activeBabyId || !audioUri) {
      if (!activeBabyId) {
        setShowBabyRequired(true);
        return;
      }
      console.warn('Missing required data for saving:', { userId: user?.id, activeBabyId, audioUri });
      return;
    }

    try {
      setSaving(true);
      console.log('Saving recording:', { userId: user.id, babyId: activeBabyId, fileUri: audioUri, notes });
      await uploadAudioAndCreateRecording({ userId: user.id, babyId: activeBabyId, fileUri: audioUri, notes });
      console.log('Recording saved successfully');
      router.replace('/(tabs)/logs');
    } catch (error) {
      console.error('Error saving recording:', error);
      // TODO: Show user-friendly error message
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
        <View className="bg-rose-100 rounded-2xl p-6 flex-row items-center justify-between mb-8">
          <View style={{ flex: 1 }}>
            <Text className="text-xl font-extrabold text-neutral-900">Cry Recording</Text>
            <Text className="text-lg text-rose-600 mt-1">{ts ? String(ts) : 'Just now'}</Text>
          </View>
          <TouchableOpacity
            onPress={togglePlay}
            disabled={audioError || !audioLoaded}
            className={`w-16 h-16 rounded-full items-center justify-center ml-4 ${audioError ? 'bg-gray-400' : 'bg-red-600'}`}
          >
            <Ionicons
              name={audioError ? 'alert-circle' : isPlaying ? 'pause' : 'play'}
              size={30}
              color={audioError ? '#fff' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-extrabold text-neutral-900 mb-4">Prediction Breakdown</Text>
        <View className="flex-row justify-between mb-10">
          <View style={{ flex: 1 }}>
            <Text className="text-lg text-rose-600">Hunger</Text>
            <Text className="text-2xl text-neutral-900">85%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-lg text-rose-600">Discomfort</Text>
            <Text className="text-2xl text-neutral-900">10%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-lg text-rose-600">Other</Text>
            <Text className="text-2xl text-neutral-900">5%</Text>
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
          <TouchableOpacity
            className="bg-red-600 px-6 py-4 rounded-2xl"
            onPress={handleSave}
            disabled={saving || !audioUri || audioError || showBabyRequired}
          >
            <Text className="text-white text-lg font-bold">{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        {audioError && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text className="text-red-800 text-lg font-semibold ml-2">Audio Error</Text>
            </View>
            <Text className="text-red-700 mb-3">
              Unable to load the audio file. The recording may be corrupted or the file format is not supported.
            </Text>
            <Text className="text-red-600 text-sm font-mono">
              URI: {audioUri ? audioUri.substring(0, 50) + '...' : 'No URI'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


