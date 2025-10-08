import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  AudioRecorder,
  RecordingStatus
} from 'expo-audio';
import { router } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { AUDIO_CONFIG } from '../../src/config/audio';
import Waveform from '../../src/components/ui/Waveform';
import { useWaveformData } from '../../src/hooks/useWaveformData';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  canRecord: boolean;
}

export default function ListenScreen() {
  const MIN_SECONDS = 5;
  const MAX_SECONDS = 15;
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Waveform data hook
  const { waveformData, reset: resetWaveform } = useWaveformData(isRecording);

  React.useEffect(() => {
    let isMounted = true;
    let recorderInstance: any = null;

    // Store the recorder instance to avoid closure issues
    const cleanup = async () => {
      // Clear any active intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset waveform data
      resetWaveform();

      // Safely clean up the recorder
      if (recorder) {
        try {
          // Check if we need to stop the recording
          if (recorder.isRecording) {
            await recorder.stop().catch(error => {
              console.warn('Error stopping recording on unmount:', error);
            });
          }
          
          // Clean up any resources (not all recorders have removeAllListeners)
          if (typeof recorder.removeAllListeners === 'function') {
            try {
              recorder.removeAllListeners('recordingStatusUpdate');
            } catch (e) {
              console.warn('Error removing listeners:', e);
            }
          }
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
      }
    };

    // Clean up on unmount
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [recorder]);

  function formatTime(total: number) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const progress = Math.min((seconds / MAX_SECONDS) * 100, 100);

  async function handleStop() {
    let recordingUri = '';
    try {
      console.log('Stopping recording...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (recorder?.isRecording) {
        console.log('Stopping recording, recorder state:', {
          isRecording: recorder.isRecording,
          uri: recorder.uri,
          hasUri: !!recorder.uri
        });

        await recorder.stop();
        recordingUri = recorder.uri ?? '';
        console.log('Recording stopped, URI:', recordingUri);
        console.log('Recorder status after stop:', {
          isRecording: recorder.isRecording,
          uri: recordingUri
        });

        // Check if file exists and has content
        if (recordingUri) {
          try {
            const FileSystem = require('expo-file-system');
            const fileInfo = await FileSystem.getInfoAsync(recordingUri, { size: true });
            console.log('Recording file info:', {
              exists: fileInfo.exists,
              size: fileInfo.size,
              uri: recordingUri,
              isDirectory: fileInfo.isDirectory,
              modificationTime: fileInfo.modificationTime
            });

            // If file is empty or doesn't exist, show error
            if (!fileInfo.exists || !fileInfo.size || fileInfo.size < 1024) { // Minimum 1KB for valid audio
              console.error('Recording file is empty, too small, or missing!', {
                exists: fileInfo.exists,
                size: fileInfo.size,
                threshold: 1024
              });
              Alert.alert(
                'Recording Error',
                'The audio file was not created properly or is too small. Please try recording again.',
                [{ text: 'OK' }]
              );
              setIsRecording(false);
              resetWaveform();
              return;
            }

            console.log('✅ Audio file created successfully with size:', fileInfo.size, 'bytes');

            // Additional validation - check if file has actual audio content
            try {
              const fileContent = await FileSystem.readAsStringAsync(recordingUri, {
                encoding: FileSystem.EncodingType.Base64,
                length: 200 // Check first 200 bytes for header info
              });
              console.log('File content preview (first 200 bytes):', fileContent.substring(0, 100) + '...');
              console.log('Base64 length:', fileContent.length);

              // Check for common audio file signatures
              const isValidAudio = fileContent.length > 100 && (
                fileContent.startsWith('RIFF') || // WAV file
                fileContent.includes('MP4') ||   // MP4/M4A file
                fileContent.startsWith('ID3') ||  // MP3 file
                fileContent.length > 500 // Fallback for other formats
              );

              console.log('Audio file validation:', {
                isValidAudio,
                contentLength: fileContent.length,
                startsWith: fileContent.substring(0, 20)
              });

              if (!isValidAudio) {
                console.warn('⚠️ File may not contain valid audio data');
                Alert.alert(
                  'Audio Validation Warning',
                  'The file was created but may not contain valid audio data. This could indicate a recording issue.',
                  [{ text: 'OK' }]
                );
              } else {
                console.log('✅ Audio file validation passed');
              }

            } catch (contentError) {
              console.warn('Error reading file content for validation:', contentError);
            }

            // Validate file format by checking extension
            if (!recordingUri.toLowerCase().endsWith('.m4a') && !recordingUri.toLowerCase().endsWith('.wav')) {
              console.warn('Recording file does not have expected audio extension:', recordingUri);
            }

          } catch (fileError) {
            console.warn('Error checking recording file:', fileError);
            Alert.alert(
              'File Check Error',
              'Unable to verify the recording file. Please try again.',
              [{ text: 'OK' }]
            );
            setIsRecording(false);
            resetWaveform();
            return;
          }
        } else {
          console.error('❌ No recording URI available!', {
            recorderUri: recorder.uri,
            recorderIsRecording: recorder.isRecording
          });
          Alert.alert(
            'Recording Error',
            'Failed to get recording file. Please try again.',
            [{ text: 'OK' }]
          );
          setIsRecording(false);
          resetWaveform();
          return;
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
      setIsRecording(false);
      resetWaveform();
      return;
    } finally {
      setIsRecording(false);
      resetWaveform();
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Use the captured URI instead of accessing recorder.uri again
      router.replace({ pathname: '/analyze/analyzing', params: { uri: recordingUri, ts } });
    }
  }

  async function handleStart() {
    if (isRecording) return;
    setSeconds(0);
    resetWaveform();

    try {
      // Set audio mode BEFORE requesting permissions
      console.log('🔧 Setting recording audio mode...');
      await setAudioModeAsync(AUDIO_CONFIG.RECORDING_MODE);
      console.log('✅ Audio mode set successfully');

      // Request permissions after setting audio mode
      console.log('🎤 Requesting microphone permissions...');
      const permissionResult = await requestRecordingPermissionsAsync();
      console.log('📱 Permission result:', permissionResult);

      if (!permissionResult.granted) {
        console.error('❌ Microphone permission not granted:', permissionResult);
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record audio. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Permissions granted, initializing recorder...');

      // Test basic recording functionality first
      console.log('🎙️ Testing basic recording functionality...');
      try {
        // Check if recorder can prepare
        console.log('📋 Preparing recorder...');
        await recorder.prepareToRecordAsync();
        console.log('✅ Recorder prepared successfully');

        // Check recorder status before recording
        console.log('🔍 Recorder status before recording:', {
          isRecording: recorder.isRecording,
          uri: recorder.uri,
          hasUri: !!recorder.uri
        });

        console.log('🚀 Starting recording...');
        await recorder.record();
        console.log('✅ Recording started successfully');

        // Check recorder state after starting
        console.log('📊 Recorder state after start:', {
          isRecording: recorder.isRecording,
          uri: recorder.uri,
          hasUri: !!recorder.uri
        });

        setIsRecording(true);
      } catch (recordError) {
        console.error('❌ Recording start failed:', recordError);
        Alert.alert(
          'Recording Failed',
          `Failed to start audio recording: ${recordError instanceof Error ? recordError.message : 'Unknown error'}. Please check microphone permissions and try again.`,
          [{ text: 'OK' }]
        );
        throw recordError;
      }

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start new interval
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds: number) => {
          const nextSeconds = prevSeconds + 1;
          if (nextSeconds >= MAX_SECONDS) {
            // Stop the interval when max seconds is reached
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Trigger stop after state update
            setTimeout(handleStop, 0);
            return MAX_SECONDS;
          }
          return nextSeconds;
        });
      }, 1000) as unknown as NodeJS.Timeout;
      intervalRef.current = intervalId;
    } catch (error) {
      console.error('Recording failed to start:', error);
      setIsRecording(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Recording Error',
        `Failed to start recording: ${errorMessage}`
      );
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

        {/* Waveform visualization - only show when recording */}
        {isRecording && waveformData.length > 0 && (
          <View className="mt-8 mb-4 items-center">
            <Waveform
              data={waveformData}
              width={360}
              height={140}
              barWidth={4}
              barGap={2}
              barColor="#ef4444"
              backgroundColor="transparent"
              animated={true}
              showGradient={true}
            />
            <View className="mt-3 h-1 w-80 bg-red-200 rounded-full opacity-50" />
          </View>
        )}

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


