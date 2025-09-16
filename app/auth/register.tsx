import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <Text className="text-3xl">←</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-6 pt-4">
        <Text className="text-center text-4xl font-extrabold text-neutral-900">Sign Up</Text>

        <View className="mt-10 gap-4">
          <TextInput placeholder="Name" className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />
          <TextInput placeholder="Email" className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />
          <TextInput placeholder="Password" secureTextEntry className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />
          <TextInput placeholder="Confirm Password" secureTextEntry className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />

          <Text className="text-neutral-900 text-xl font-extrabold mt-4">Add Baby Profile (Optional)</Text>

          <TextInput placeholder="Baby's Name" className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />
          <TextInput placeholder="Baby's Gender" className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />
          <TextInput placeholder="Baby's Birth  Date" className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" placeholderTextColor="#9F6B6B" />

          <TouchableOpacity className="bg-red-500 py-4 rounded-2xl items-center mt-6" onPress={() => router.push('/auth/verify-email')}>
            <Text className="text-white text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mt-6" onPress={() => router.replace('/auth/login')}>
            <Text className="text-neutral-900">Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


