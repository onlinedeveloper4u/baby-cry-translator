import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RecordingDiagnostics, RecordingTestResult } from '../../src/utils/recordingDiagnostics';

export default function AudioDiagnosticScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RecordingTestResult | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const diagnosticResults = await RecordingDiagnostics.getInstance().runFullDiagnostic();
      setResults(diagnosticResults);

      // Show summary alert
      Alert.alert(
        'Diagnostic Results',
        `Overall: ${diagnosticResults.overall.toUpperCase()}\nSteps completed: ${diagnosticResults.steps.filter(s => s.status === 'completed').length}/${diagnosticResults.steps.length}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Diagnostic error:', error);
      Alert.alert(
        'Diagnostic Failed',
        'Failed to run audio diagnostics. Check console for details.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#10b981'; // green
      case 'failed': return '#ef4444'; // red
      case 'pending': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
        🔊 Audio Recording Diagnostics
      </Text>

      <TouchableOpacity
        onPress={runDiagnostics}
        disabled={isRunning}
        className={`p-4 rounded-xl mb-6 ${isRunning ? 'bg-gray-400' : 'bg-blue-600'}`}
      >
        <Text className="text-white text-lg font-semibold text-center">
          {isRunning ? '🔄 Running Diagnostics...' : '🚀 Run Full Diagnostic'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            📊 Results Summary
          </Text>

          {results.overall && (
            <View className="flex-row items-center mb-4">
              <Text className="text-lg font-semibold mr-2">Overall Status:</Text>
              <Text
                className={`text-lg font-bold ${
                  results.overall === 'success' ? 'text-green-600' :
                  results.overall === 'partial' ? 'text-yellow-600' :
                  'text-red-600'
                }`}
              >
                {results.overall.toUpperCase()}
              </Text>
            </View>
          )}

          {results.error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-800 font-semibold">❌ Error:</Text>
              <Text className="text-red-700">{results.error}</Text>
            </View>
          )}

          {results.steps && (
            <Text className="text-lg font-semibold mb-3">📋 Step Details:</Text>
          )}

          {results.steps && results.steps.map((step: any, index: number) => (
            <View key={index} className="bg-gray-50 rounded-lg p-3 mb-3">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">
                  {step.status === 'completed' ? '✅' :
                   step.status === 'failed' ? '❌' :
                   step.status === 'pending' ? '⏳' : '⏳'}
                </Text>
                <Text className="text-base font-semibold text-gray-900 flex-1">
                  {step.step}
                </Text>
                <Text
                  className="text-sm font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: getStatusColor(step.status) + '20',
                    color: getStatusColor(step.status)
                  }}
                >
                  {step.status.toUpperCase()}
                </Text>
              </View>

              {step.duration && (
                <Text className="text-sm text-gray-600 mb-2">
                  ⏱️ Duration: {step.duration}ms
                </Text>
              )}

              {step.error && (
                <View className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                  <Text className="text-red-800 text-sm font-semibold">Error:</Text>
                  <Text className="text-red-700 text-sm">{step.error}</Text>
                </View>
              )}

              {step.data && (
                <View className="bg-blue-50 border border-blue-200 rounded p-2">
                  <Text className="text-blue-800 text-sm font-semibold mb-1">Data:</Text>
                  <Text className="text-blue-700 text-sm font-mono">
                    {JSON.stringify(step.data, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <Text className="text-yellow-800 font-semibold mb-2">💡 Troubleshooting Tips:</Text>
        <Text className="text-yellow-700 text-sm mb-2">
          • Check microphone permissions in device settings
        </Text>
        <Text className="text-yellow-700 text-sm mb-2">
          • Ensure no other apps are using the microphone
        </Text>
        <Text className="text-yellow-700 text-sm mb-2">
          • Try recording in a quiet environment
        </Text>
        <Text className="text-yellow-700 text-sm">
          • Check console logs for detailed error messages
        </Text>
      </View>
    </ScrollView>
  );
}
