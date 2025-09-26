import { Ionicons } from '@expo/vector-icons';
import { Audio, Recording, requestPermissionsAsync, setAudioModeAsync, RecordingOptionsPresets } from 'expo-audio';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function ListenScreen() {
  const MIN_SECONDS = 5;
  const MAX_SECONDS = 15;
  const [seconds, setSeconds] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const recordingRef = React.useRef<Recording | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    let id: any;

    return () => {
      isMounted = false;
      if (id) clearInterval(id);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  function formatTime(total: number) {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(1, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const progress = Math.min((seconds / MAX_SECONDS) * 100, 100);

  async function handleStop() {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        // TODO: send uri to analysis pipeline
      }
    } finally {
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      router.replace({ pathname: '/analyze/analyzing', params: { uri: String(recordingRef.current?.getURI() ?? ''), ts } });
    }
  }

  async function handleStart() {
    if (isRecording) return;
    setSeconds(0);
    setIsRecording(true);
    try {
      await requestPermissionsAsync();
      await setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Recording();
      await recording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      const id = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) {
            clearInterval(id);
            setTimeout(() => handleStop(), 0);
            return MAX_SECONDS;
          }
          return next;
        });
      }, 1000);
    } catch {
      setIsRecording(false);
    }
  }

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
        <View className="flex-row items-center justify-between mb-3">
          <View style={{ width: 16 }} />
          <Text className="text-neutral-900 text-xl">{formatTime(seconds)}</Text>
        </View>
        <View className="w-full h-3 bg-rose-200 rounded-full overflow-hidden">
          <View style={{ width: `${progress}%` }} className="h-3 bg-red-600" />
        </View>
        <Text className="text-neutral-700 mt-3">Please record between 5 and 15 seconds. Recording will auto-stop at 15s.</Text>
      </View>

      <View className="flex-1 items-center justify-start pt-10">
        {isRecording ? (
          <>
            <TouchableOpacity
              disabled={seconds < MIN_SECONDS}
              onPress={handleStop}
              className="px-8 py-4 rounded-full"
              style={{ backgroundColor: seconds < MIN_SECONDS ? '#f5b5b5' : '#dc2626' }}
            >
              <Text className="text-white text-xl font-bold">
                {seconds < MIN_SECONDS ? `Stop in ${MIN_SECONDS - seconds}s` : 'Stop Listening'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} className="mt-10">
              <Text className="text-neutral-900 text-xl font-semibold">Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleStart} className="bg-red-600 px-8 py-4 rounded-full">
            <Text className="text-white text-xl font-bold">Start Listening</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}


