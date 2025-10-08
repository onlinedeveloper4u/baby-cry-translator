import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { AUDIO_CONFIG } from '../config/audio';

/**
 * Comprehensive audio recording diagnostic utility
 * Tests each step of the audio recording pipeline
 */
export interface RecordingTestResult {
  timestamp: string;
  overall: 'success' | 'failed' | 'partial';
  error?: string;
  steps: Array<{
    step: string;
    status: 'pending' | 'completed' | 'failed';
    data?: any;
    error?: string;
    duration?: number;
  }>;
}

export class RecordingDiagnostics {
  private static instance: RecordingDiagnostics;

  static getInstance(): RecordingDiagnostics {
    if (!RecordingDiagnostics.instance) {
      RecordingDiagnostics.instance = new RecordingDiagnostics();
    }
    return RecordingDiagnostics.instance;
  }

  /**
   * Comprehensive test of audio recording functionality
   */
  async runFullDiagnostic(): Promise<RecordingTestResult> {
    console.log('🔊 Starting comprehensive audio recording diagnostic...');

    const results: RecordingTestResult = {
      timestamp: new Date().toISOString(),
      overall: 'failed',
      steps: []
    };

    // Step 1: Test Audio Mode Configuration
    results.steps.push({ step: 'Testing Audio Mode Configuration', status: 'pending' });
    const startTime = Date.now();

    try {
      await setAudioModeAsync(AUDIO_CONFIG.RECORDING_MODE);
      results.steps[0].status = 'completed';
      results.steps[0].duration = Date.now() - startTime;
      console.log('✅ Audio mode configuration: SUCCESS');
    } catch (error) {
      results.steps[0].status = 'failed';
      results.steps[0].error = error instanceof Error ? error.message : 'Unknown error';
      results.steps[0].duration = Date.now() - startTime;
      console.error('❌ Audio mode configuration: FAILED', error);
      results.overall = 'failed';
      results.error = 'Audio mode configuration failed';
      return results;
    }

    // Step 2: Test Microphone Permissions
    results.steps.push({ step: 'Testing Microphone Permissions', status: 'pending' });
    const permStartTime = Date.now();

    try {
      const permissionResult = await requestRecordingPermissionsAsync();
      results.steps[1].status = permissionResult.granted ? 'completed' : 'failed';
      results.steps[1].data = permissionResult;
      results.steps[1].duration = Date.now() - permStartTime;

      if (!permissionResult.granted) {
        console.error('❌ Microphone permissions: DENIED', permissionResult);
        results.overall = 'failed';
        results.error = 'Microphone permission not granted';
        return results;
      }

      console.log('✅ Microphone permissions: GRANTED');
    } catch (error) {
      results.steps[1].status = 'failed';
      results.steps[1].error = error instanceof Error ? error.message : 'Unknown error';
      results.steps[1].duration = Date.now() - permStartTime;
      console.error('❌ Microphone permissions: ERROR', error);
      results.overall = 'failed';
      results.error = 'Permission request failed';
      return results;
    }

    // Step 3: Test Basic Recording with Simple Configuration
    results.steps.push({ step: 'Testing Basic Recording (Simple Config)', status: 'pending' });
    const recordStartTime = Date.now();

    try {
      // Use a simple recorder configuration first
      const { useAudioRecorder } = await import('expo-audio');
      const testRecorder = (useAudioRecorder as any)(RecordingPresets.LOW_QUALITY);

      console.log('📋 Preparing simple recorder...');
      await testRecorder.prepareToRecordAsync();

      console.log('🎙️ Starting test recording...');
      await testRecorder.record();

      // Record for 3 seconds to ensure we capture something
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('⏹️ Stopping test recording...');
      await testRecorder.stop();

      const testUri = testRecorder.uri;
      results.steps[2].status = testUri ? 'completed' : 'failed';
      results.steps[2].data = { uri: testUri };
      results.steps[2].duration = Date.now() - recordStartTime;

      if (!testUri) {
        console.error('❌ Basic recording: NO URI GENERATED');
        results.overall = 'failed';
        results.error = 'Recording failed - no file URI generated';
        return results;
      }

      console.log('✅ Basic recording: URI generated', testUri);

      // Step 4: Validate the recorded file
      results.steps.push({ step: 'Validating Recorded File', status: 'pending' });
      const fileStartTime = Date.now();

      try {
        const fileInfo = await FileSystem.getInfoAsync(testUri, { size: true });

        results.steps[3].status = fileInfo.exists && (fileInfo.size || 0) > 1024 ? 'completed' : 'failed';
        results.steps[3].data = {
          exists: fileInfo.exists,
          size: fileInfo.exists ? fileInfo.size : 0,
          uri: testUri,
          modificationTime: fileInfo.exists && 'modificationTime' in fileInfo ? fileInfo.modificationTime : null
        };
        results.steps[3].duration = Date.now() - fileStartTime;

        if (!fileInfo.exists) {
          console.error('❌ File validation: FILE DOES NOT EXIST');
          results.overall = 'failed';
          results.error = 'Recording file was not created';
          return results;
        }

        if ((fileInfo.size || 0) <= 1024) {
          console.error('❌ File validation: FILE TOO SMALL', { size: fileInfo.size, threshold: 1024 });
          results.overall = 'failed';
          results.error = `Recording file is too small (${fileInfo.size} bytes). Expected > 1KB.`;
          return results;
        }

        console.log('✅ File validation: FILE EXISTS and is valid size', fileInfo.size, 'bytes');

        // Step 5: Check file content for audio signatures
        results.steps.push({ step: 'Checking Audio Content', status: 'pending' });
        const contentStartTime = Date.now();

        try {
          const fileContent = await FileSystem.readAsStringAsync(testUri, {
            encoding: FileSystem.EncodingType.Base64,
            length: 200
          });

          // Check for audio file signatures
          const hasAudioSignature = fileContent.length > 100 && (
            fileContent.startsWith('RIFF') || // WAV
            fileContent.includes('MP4') ||   // MP4/M4A
            fileContent.startsWith('ID3') ||  // MP3
            fileContent.length > 500 // Fallback for other formats
          );

          results.steps[4].status = hasAudioSignature ? 'completed' : 'failed';
          results.steps[4].data = {
            contentLength: fileContent.length,
            startsWith: fileContent.substring(0, 20),
            hasAudioSignature
          };
          results.steps[4].duration = Date.now() - contentStartTime;

          if (!hasAudioSignature) {
            console.warn('⚠️ File content check: No clear audio signature detected');
            results.overall = 'partial';
            results.error = 'File created but may not contain valid audio data';
          } else {
            console.log('✅ File content check: Audio signature detected');
            results.overall = 'success';
          }

        } catch (contentError) {
          results.steps[4].status = 'failed';
          results.steps[4].error = contentError instanceof Error ? contentError.message : 'Unknown error';
          results.steps[4].duration = Date.now() - contentStartTime;
          console.error('❌ File content check: ERROR', contentError);
          results.overall = 'failed';
          results.error = 'Failed to read file content for validation';
        }

      } catch (fileError) {
        results.steps[3].status = 'failed';
        results.steps[3].error = fileError instanceof Error ? fileError.message : 'Unknown error';
        results.steps[3].duration = Date.now() - fileStartTime;
        console.error('❌ File validation: ERROR', fileError);
        results.overall = 'failed';
        results.error = 'Failed to access recording file';
      }

    } catch (recordError) {
      results.steps[2].status = 'failed';
      results.steps[2].error = recordError instanceof Error ? recordError.message : 'Unknown error';
      results.steps[2].duration = Date.now() - recordStartTime;
      console.error('❌ Basic recording test: ERROR', recordError);
      results.overall = 'failed';
      results.error = 'Recording test failed: ' + (recordError instanceof Error ? recordError.message : 'Unknown error');
    }

    console.log('🔊 Audio diagnostic completed:', results.overall);
    return results;
  }

  /**
   * Quick test for basic recording functionality
   */
  async quickTest(): Promise<boolean> {
    try {
      console.log('🚀 Running quick audio recording test...');

      // Set audio mode
      await setAudioModeAsync(AUDIO_CONFIG.RECORDING_MODE);

      // Check permissions
      const permissionResult = await requestRecordingPermissionsAsync();
      if (!permissionResult.granted) {
        console.error('❌ Quick test: Permissions denied');
        return false;
      }

      // Try to record for 2 seconds
      const { useAudioRecorder } = await import('expo-audio');
      const testRecorder = (useAudioRecorder as any)(RecordingPresets.LOW_QUALITY);

      await testRecorder.prepareToRecordAsync();
      await testRecorder.record();

      await new Promise(resolve => setTimeout(resolve, 2000));

      await testRecorder.stop();
      const uri = testRecorder.uri;

      if (!uri) {
        console.error('❌ Quick test: No URI generated');
        return false;
      }

      // Check if file exists and has content
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });

      if (!fileInfo.exists || (fileInfo.size || 0) < 1024) {
        console.error('❌ Quick test: File empty or too small', fileInfo);
        return false;
      }

      console.log('✅ Quick test: Recording successful');
      return true;

    } catch (error) {
      console.error('❌ Quick test: Failed', error);
      return false;
    }
  }
}
