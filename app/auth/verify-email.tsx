import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { verifyEmail, loading } = useAuthStore();
  const params = useLocalSearchParams<{ email?: string }>();

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    const email = params.email ?? '';
    if (!email) {
      Alert.alert('Error', 'Missing email for verification');
      return;
    }

    const { error } = await verifyEmail(email, fullCode);
    if (error) {
      Alert.alert('Verification Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <Text className="text-3xl">←</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-6 pt-4">
        <Text className="text-center text-2xl font-extrabold text-neutral-900">Verify Email</Text>

        <Text className="text-3xl font-extrabold text-neutral-900 mt-10">Enter the code we sent to your email</Text>

        <View className="flex-row gap-3 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput 
              key={index} 
              value={code[index]}
              onChangeText={(value) => handleCodeChange(value, index)}
              className="flex-1 bg-red-50 rounded-2xl text-center text-2xl py-4 text-neutral-900" 
              maxLength={1} 
              keyboardType="number-pad" 
            />
          ))}
        </View>

        <TouchableOpacity 
          className="bg-red-500 py-4 rounded-2xl items-center mt-8"
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? 'Verifying...' : 'Submit Code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-12 items-center gap-2">
        <Text className="text-neutral-500">Didn't receive a code?</Text>
        <TouchableOpacity>
          <Text className="text-neutral-900">Resend</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


