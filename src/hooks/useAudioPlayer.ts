import { useEffect, useState, useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer } from 'expo-audio';
import { setAudioModeAsync } from 'expo-audio';
import { AUDIO_CONFIG, PLAYER_CONFIG } from '../config/audio';

interface UseAudioPlayerOptions {
  uri: string | null;
  pollingInterval?: number;
}

export function useCustomAudioPlayer(uri: string | null, pollingInterval = PLAYER_CONFIG.STATUS_POLLING_INTERVAL) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const [audioError, setAudioError] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const isPlaying = !!(status && status.playing);

  // Configure audio mode on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync(AUDIO_CONFIG.PLAYBACK_MODE);
        console.log('Audio mode configured for playback');
      } catch (error) {
        console.warn('Error configuring audio mode:', error);
      }
    };

    configureAudio();
  }, []);

  // Monitor player status changes
  useEffect(() => {
    if (player && status) {
      console.log('Audio player status:', {
        playing: status.playing,
        duration: status.duration,
        isBuffering: status.isBuffering || false
      });
    }
  }, [status, player]);

  // Check audio file validity
  useEffect(() => {
    const checkAudioFile = async () => {
      if (uri && uri !== 'undefined') {
        try {
          const FileSystem = require('expo-file-system');

          // Handle different URI types
          if (uri.startsWith('http')) {
            // This is a remote URL (Supabase)
            console.log('Checking remote audio URL:', uri);
            try {
              const response = await fetch(uri, { method: 'HEAD' });
              const contentLength = response.headers.get('content-length');
              console.log('Remote file check:', {
                uri,
                status: response.status,
                contentLength,
                contentType: response.headers.get('content-type')
              });

              if (response.ok && contentLength && parseInt(contentLength) > 1024) {
                setAudioLoaded(true);
                setAudioError(false);
                console.log('Remote audio file loaded successfully');
              } else {
                setAudioError(true);
                console.warn('Remote audio file is too small or inaccessible');
              }
            } catch (remoteError) {
              console.warn('Error checking remote audio file:', remoteError);
              setAudioError(true);
            }
          } else {
            // This is a local file
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('Audio file check:', {
              uri,
              exists: fileInfo.exists,
              size: fileInfo.size,
              isDirectory: fileInfo.isDirectory
            });

            if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
              setAudioLoaded(true);
              setAudioError(false);
              console.log('Audio file loaded successfully');
            } else {
              setAudioError(true);
              console.warn('Audio file does not exist or is empty:', fileInfo);
            }
          }
        } catch (error) {
          console.warn('Error checking audio file:', error);
          setAudioError(true);
        }
      } else {
        console.log('No audio URI provided or URI is undefined');
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
          audioLoaded,
          uri,
          playerStatus: player ? 'exists' : 'null'
        });
        return;
      }

      // Ensure audio mode is set for playback
      await setAudioModeAsync(AUDIO_CONFIG.PLAYBACK_MODE);
      console.log('Audio mode set for playback');

      // Check if player is ready
      if (!player) {
        console.error('Player is null or undefined');
        setAudioError(true);
        return;
      }

      // Toggle play/pause
      if (isPlaying) {
        console.log('Pausing audio...');
        await player.pause();
        console.log('Audio paused successfully');
      } else {
        console.log('Starting audio playback...', { uri });
        await player.play();
        console.log('Audio playback started successfully');
      }
    } catch (err) {
      console.error('Error toggling audio playback:', err);
      setAudioError(true);
    }
  }, [player, audioError, audioLoaded, isPlaying, uri]);

  return {
    player,
    status,
    isPlaying,
    audioError,
    audioLoaded,
    togglePlay,
  };
}
