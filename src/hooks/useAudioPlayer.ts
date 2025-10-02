import { useEffect, useState, useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer } from 'expo-audio';
import { setAudioModeAsync } from 'expo-audio';
import { AUDIO_CONFIG, PLAYER_CONFIG } from '../config/audio';

interface UseAudioPlayerOptions {
  uri: string | null;
  pollingInterval?: number;
}

export function useCustomAudioPlayer(uri: string | null, pollingInterval = PLAYER_CONFIG.STATUS_POLLING_INTERVAL) {
  const player = useAudioPlayer(uri, pollingInterval);
  const status = useAudioPlayerStatus(player);
  const [audioError, setAudioError] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const isPlaying = !!(status && status.isPlaying);

  // Configure audio mode on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync(AUDIO_CONFIG.PLAYBACK_MODE);
      } catch (error) {
        console.warn('Error configuring audio mode:', error);
      }
    };

    configureAudio();
  }, []);

  // Check audio file validity
  useEffect(() => {
    const checkAudioFile = async () => {
      if (uri && uri !== 'undefined') {
        try {
          const FileSystem = require('expo-file-system');
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
            setAudioLoaded(true);
            setAudioError(false);
          } else {
            setAudioError(true);
            console.warn('Audio file does not exist or is empty:', fileInfo);
          }
        } catch (error) {
          console.warn('Error checking audio file:', error);
          setAudioError(true);
        }
      }
    };

    checkAudioFile();
  }, [uri]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        // The expo-audio library handles player cleanup automatically
        // Only log if there are any issues, don't try to manually remove
        console.log('Audio player cleanup - handled by expo-audio');
      } catch (error) {
        console.warn('Error during audio player cleanup:', error);
      }
    };
  }, []);

  const togglePlay = useCallback(async () => {
    try {
      if (!player || audioError || !audioLoaded) {
        console.warn('Audio player not available, error occurred, or audio not loaded:', {
          player: !!player,
          audioError,
          audioLoaded
        });
        return;
      }

      // Ensure audio mode is set for playback
      await setAudioModeAsync(AUDIO_CONFIG.PLAYBACK_MODE);

      // Toggle play/pause
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (err) {
      console.warn('Error toggling audio playback:', err);
      setAudioError(true);
    }
  }, [player, audioError, audioLoaded, isPlaying]);

  return {
    player,
    status,
    isPlaying,
    audioError,
    audioLoaded,
    togglePlay,
  };
}
