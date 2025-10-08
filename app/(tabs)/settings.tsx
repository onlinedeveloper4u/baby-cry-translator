import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RecordingDiagnostics } from '../../src/utils/recordingDiagnostics';

export default function SettingsScreen() {
  const runQuickDiagnostic = async () => {
    try {
      const success = await RecordingDiagnostics.getInstance().quickTest();
      Alert.alert(
        'Quick Diagnostic',
        success ? '✅ Audio recording appears to be working!' : '❌ Audio recording issues detected',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Diagnostic Failed',
        'Failed to run quick diagnostic. Check console for details.',
        [{ text: 'OK' }]
      );
    }
  };

  const runFullDiagnostic = () => {
    router.push('/diagnostics/audio');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* Audio Diagnostics Section */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">🔊 Audio Diagnostics</Text>

          <TouchableOpacity
            onPress={runQuickDiagnostic}
            className="bg-blue-600 p-3 rounded-lg mb-3"
          >
            <Text className="text-white font-semibold text-center">🚀 Quick Audio Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={runFullDiagnostic}
            className="bg-green-600 p-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-center">📊 Full Audio Diagnostic</Text>
          </TouchableOpacity>
        </View>

        {/* Other settings sections */}
        <View className="bg-white rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">General Settings</Text>
          <Text className="text-gray-600">More settings coming soon...</Text>
        </View>
      </View>
    </ScrollView>
  );
}


