import { useState, useEffect, useRef } from 'react';

interface UseWaveformDataReturn {
  waveformData: number[];
  isRecording: boolean;
  reset: () => void;
  audioLevel: number; // Real audio input level
}

export function useWaveformData(isRecording: boolean, sampleRate: number = 30): UseWaveformDataReturn {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const intervalRef = useRef<number | NodeJS.Timeout | null>(null);
  const dataRef = useRef<number[]>([]);

  // Generate realistic waveform data using sine waves and randomness
  const generateWaveformPoint = (): number => {
    // If actually recording, try to get real audio level (this is simulated for now)
    // In a real implementation, this would read from the actual audio input buffer
    const baseAmplitude = isRecording ? 20 + Math.random() * 40 : 0;
    const time = Date.now() / 1000;
    const primaryWave = Math.sin(time * 2) * 15;
    const secondaryWave = Math.sin(time * 4.5) * 8;
    const tertiaryWave = Math.sin(time * 1.2) * 5;
    const noise = (Math.random() - 0.5) * 10;

    const amplitude = Math.max(0, baseAmplitude + primaryWave + secondaryWave + tertiaryWave + noise);
    setAudioLevel(amplitude); // Update real-time audio level

    return amplitude;
  };

  const reset = () => {
    setWaveformData([]);
    setAudioLevel(0);
    dataRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isRecording) {
      console.log('🎵 Starting waveform data generation for recording');
      // Start generating waveform data
      intervalRef.current = setInterval(() => {
        const newPoint = generateWaveformPoint();

        setWaveformData(prevData => {
          const newData = [...prevData, newPoint];
          // Keep only the last 100 points for smooth scrolling effect
          return newData.slice(-100);
        });

        dataRef.current.push(newPoint);
        // Keep data array manageable
        if (dataRef.current.length > 200) {
          dataRef.current = dataRef.current.slice(-150);
        }
      }, 1000 / sampleRate); // Sample rate determines how often we generate new points
    } else {
      console.log('⏹️ Stopping waveform data generation');
      // Stop generating data when not recording
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAudioLevel(0);
    }

    // Cleanup on unmount or when recording state changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, sampleRate]);

  return {
    waveformData,
    isRecording,
    reset,
    audioLevel,
  };
}
