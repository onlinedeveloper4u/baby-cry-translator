import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AuthLandingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-center text-4xl font-extrabold text-neutral-900">
          Understand your baby's needs
        </Text>
        <Text className="text-center text-base text-neutral-600 mt-6">
          Decode your baby's cries with AI-powered analysis. Gain insights into their needs and patterns.
        </Text>

        <View className="mt-10 gap-4">
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-2xl items-center"
            onPress={() => router.push('/auth/login')}
          >
            <Text className="text-white text-lg font-semibold">Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-50 py-4 rounded-2xl items-center"
            onPress={() => router.push('/auth/register')}
          >
            <Text className="text-neutral-900 text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 rounded-2xl items-center"
            onPress={() => router.replace('/')}
          >
            <Text className="text-neutral-900 text-lg font-semibold">Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pb-8">
        <Text className="text-center text-neutral-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}


