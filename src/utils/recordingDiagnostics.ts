import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useState, useEffect } from 'react';
import { AUDIO_CONFIG } from '../config/audio';

/**
 * Diagnostic utility to test audio recording functionality
 * Use this to troubleshoot recording issues
 */
export function useRecordingDiagnostics() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testRecording = async () => {
    setIsTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Check audio mode
      results.steps.push({ step: 'Setting audio mode', status: 'pending' });
      await setAudioModeAsync(AUDIO_CONFIG.RECORDING_MODE);
      results.steps[0].status = 'completed';

      // Step 2: Request permissions
      results.steps.push({ step: 'Requesting permissions', status: 'pending' });
      const permissionResult = await requestRecordingPermissionsAsync();
      results.steps[1].status = permissionResult.granted ? 'completed' : 'failed';
      results.steps[1].data = permissionResult;

      if (!permissionResult.granted) {
        results.overall = 'failed';
        results.error = 'Microphone permission not granted';
        setTestResults(results);
        setIsTesting(false);
        return results;
      }

      // Step 3: Create recorder and test recording
      results.steps.push({ step: 'Testing recording', status: 'pending' });
      const testRecorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        android: {
          ...RecordingPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: 'mpeg_4',
          audioEncoder: 'aac',
        },
        ios: {
          ...RecordingPresets.HIGH_QUALITY.ios,
          extension: '.m4a',
          audioQuality: 'high',
        },
        web: {},
      });

      await testRecorder.prepareToRecordAsync();
      await testRecorder.startRecording();

      // Record for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      await testRecorder.stopRecording();

      const testUri = testRecorder.uri;
      results.steps[2].status = testUri ? 'completed' : 'failed';
      results.steps[2].data = { uri: testUri };

      if (testUri) {
        // Step 4: Check file
        results.steps.push({ step: 'Validating file', status: 'pending' });
        const FileSystem = require('expo-file-system');
        const fileInfo = await FileSystem.getInfoAsync(testUri, { size: true });

        results.steps[3].status = fileInfo.exists && fileInfo.size > 1024 ? 'completed' : 'failed';
        results.steps[3].data = {
          exists: fileInfo.exists,
          size: fileInfo.size,
          uri: testUri
        };

        if (!fileInfo.exists || fileInfo.size <= 1024) {
          results.overall = 'failed';
          results.error = 'Recording file is empty or too small';
        } else {
          results.overall = 'success';
        }
      } else {
        results.overall = 'failed';
        results.error = 'No recording URI generated';
      }

    } catch (error) {
      results.overall = 'failed';
      results.error = error.message;
      results.steps[results.steps.length - 1].status = 'failed';
      results.steps[results.steps.length - 1].error = error.message;
    }

    setTestResults(results);
    setIsTesting(false);
    return results;
  };

  return {
    testRecording,
    isTesting,
    testResults
  };
}
