import { AudioMode } from 'expo-audio';

// Audio configuration constants
export const AUDIO_CONFIG = {
  // Audio mode for playback
  PLAYBACK_MODE: {
    allowsRecording: false,
    playsInSilentMode: false, // Changed to false to allow audio playback even in silent mode
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
    interruptionMode: 'mixWithOthers' as const,
    interruptionModeAndroid: 'duckOthers' as const,
  } as AudioMode,

  // Audio mode for recording - optimized for microphone input
  RECORDING_MODE: {
    allowsRecording: true,
    playsInSilentMode: true, // Allow recording in silent mode
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
    interruptionMode: 'mixWithOthers' as const,
    interruptionModeAndroid: 'duckOthers' as const,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: false,
  } as AudioMode,
  
  // Additional recording configuration for better audio capture
  RECORDING_OPTIONS: {
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg_4',
      audioEncoder: 'aac',
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: 'high' as const,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {},
  },
};

// Audio player configuration
export const PLAYER_CONFIG = {
  // Polling interval for status updates (ms)
  STATUS_POLLING_INTERVAL: 500,
} as const;
