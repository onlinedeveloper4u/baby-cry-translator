import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyEmailScreen() {
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
            <TextInput key={index} className="flex-1 bg-red-50 rounded-2xl text-center text-2xl py-4 text-neutral-900" maxLength={1} keyboardType="number-pad" />
          ))}
        </View>

        <TouchableOpacity className="bg-red-500 py-4 rounded-2xl items-center mt-8">
          <Text className="text-white text-lg font-semibold">Submit Code</Text>
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


