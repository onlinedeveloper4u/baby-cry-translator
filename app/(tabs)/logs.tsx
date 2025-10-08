import React from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useAuthStore } from '../../src/store/auth';
import { useBabiesStore } from '../../src/store/babies';
import { getRecordings, deleteRecording } from '../../src/api/recordings';
import { Ionicons } from '@expo/vector-icons';
import { useCustomAudioPlayer } from '../../src/hooks/useAudioPlayer';
export default function LogsScreen() {
  const { user } = useAuthStore();
  const { activeBabyId, profiles } = useBabiesStore();
  const [recordings, setRecordings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const [audioErrors, setAudioErrors] = React.useState<Set<string>>(new Set());
  const [currentPlayingUrl, setCurrentPlayingUrl] = React.useState<string | null>(null);

  // Use the audio player for the currently selected recording
  const { isPlaying, audioError, audioLoaded, togglePlay } = useCustomAudioPlayer(
    currentPlayingUrl && currentPlayingUrl !== 'undefined' ? currentPlayingUrl : null
  );

  const fetchRecordings = async () => {
    if (!user?.id) return;

    try {
      const data = await getRecordings(user.id, activeBabyId || undefined);
      setRecordings(data || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchRecordings();
  }, [user?.id, activeBabyId]);

  // Cleanup: stop playback when component unmounts
  React.useEffect(() => {
    return () => {
      if (isPlaying) {
        togglePlay();
      }
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecordings();
  };

  const handleDeleteRecording = (recordingId: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(recordingId);
              setRecordings(prev => prev.filter(r => r.id !== recordingId));
              // Stop playing if this recording was playing
              if (playingId === recordingId) {
                setPlayingId(null);
              }
            } catch (error) {
              console.error('Error deleting recording:', error);
              Alert.alert('Error', 'Failed to delete recording. Please try again.');
            }
          },
        },
      ]
    );
  };

  const togglePlayback = async (recording: any) => {
    try {
      // If this recording is already playing, stop it
      if (playingId === recording.id && isPlaying) {
        await togglePlay();
        setPlayingId(null);
        setCurrentPlayingUrl(null);
        return;
      }

      // If a different recording is playing, stop it first
      if (playingId && playingId !== recording.id && isPlaying) {
        await togglePlay();
      }

      // Check if audio URL exists and is valid
      if (!recording.url) {
        setAudioErrors(prev => new Set(prev).add(recording.id));
        Alert.alert('Error', 'Audio file not found');
        return;
      }

      // Ensure URL has proper format for audio player
      const audioUrl = recording.url.startsWith('http') ? recording.url : `file://${recording.url}`;

      console.log('Attempting to play recording:', {
        id: recording.id,
        originalUrl: recording.url,
        formattedUrl: audioUrl
      });

      // Clear any previous errors for this recording
      setAudioErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(recording.id);
        return newErrors;
      });

      // Set the new recording as the current playing one
      setPlayingId(recording.id);
      setCurrentPlayingUrl(audioUrl);

      // Small delay to allow the player to initialize with the new URL
      setTimeout(async () => {
        if (currentPlayingUrl === audioUrl) {
          await togglePlay();
        }
      }, 100);

      console.log('Playing recording:', recording.id, recording.url);

    } catch (error) {
      console.error('Error toggling playback:', error);
      setAudioErrors(prev => new Set(prev).add(recording.id));
      setPlayingId(null);
      setCurrentPlayingUrl(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileSizeText = (url: string) => {
    // This would need to be calculated from actual file size
    // For now, return estimated size based on typical audio files
    return '~2.1 MB';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-neutral-600 mt-4 text-lg">Loading recordings...</Text>
          <Text className="text-neutral-400 mt-2 text-center px-8">
            Fetching your cry analysis history
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-extrabold text-neutral-900">Recordings</Text>
            <Text className="text-neutral-500 text-lg mt-1">
              {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-full bg-rose-50"
          >
            <Ionicons
              name={refreshing ? "ellipsis-horizontal" : "refresh"}
              size={24}
              color={refreshing ? '#9CA3AF' : '#374151'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {recordings.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-24 h-24 bg-rose-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="mic-outline" size={40} color="#dc2626" />
              </View>
              <Text className="text-2xl text-neutral-500 text-center font-semibold mb-2">
                No recordings yet
              </Text>
              <Text className="text-neutral-400 text-center px-8 mb-6 leading-6">
                Start analyzing your baby's cries to see detailed insights and patterns here
              </Text>
              <TouchableOpacity
                className="bg-red-600 px-8 py-4 rounded-2xl"
                onPress={() => {/* Navigate to analyze screen */}}
              >
                <Text className="text-white text-lg font-bold">Start Recording</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recordings.map((recording) => (
              <View key={recording.id} className="bg-white rounded-3xl p-6 mb-4 border border-rose-100 shadow-sm">
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-rose-100 rounded-full items-center justify-center mr-3">
                        <Ionicons name="person" size={16} color="#dc2626" />
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-neutral-900">
                          {recording.babies?.name || 'Unknown Baby'}
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                          {formatDate(recording.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteRecording(recording.id)}
                    className="p-2 rounded-full bg-red-50"
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>

                {recording.notes && (
                  <View className="bg-rose-50 rounded-2xl p-4 mb-4">
                    <Text className="text-neutral-700 leading-5">{recording.notes}</Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-neutral-600 text-sm mb-1">Duration</Text>
                    <Text className="text-neutral-900 font-semibold">3:24</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-600 text-sm mb-1">File Size</Text>
                    <Text className="text-neutral-900 font-semibold">{getFileSizeText(recording.url)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => togglePlayback(recording)}
                    disabled={audioErrors.has(recording.id) || (currentPlayingUrl !== recording.url && !audioLoaded)}
                    className={`px-6 py-3 rounded-2xl flex-row items-center justify-center ml-4 ${playingId === recording.id && isPlaying ? 'bg-green-600' : 'bg-red-600'} ${audioErrors.has(recording.id) ? 'bg-gray-400' : ''}`}
                  >
                    <Ionicons
                      name={audioErrors.has(recording.id) ? 'alert-circle' : playingId === recording.id && isPlaying ? 'pause' : 'play'}
                      size={16}
                      color="#fff"
                    />
                    <Text className="text-white font-medium ml-2">
                      {audioErrors.has(recording.id) ? 'Error' : playingId === recording.id && isPlaying ? 'Playing' : 'Play'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {audioErrors.has(recording.id) && (
                  <View className="mt-3 p-3 bg-red-50 rounded-xl">
                    <Text className="text-red-600 text-sm text-center">
                      Audio file could not be loaded
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
