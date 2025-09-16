import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Login Failed', error.message);
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
        <Text className="text-center text-2xl font-extrabold text-neutral-900">Baby Cry Analyzer</Text>
        <Text className="text-center text-4xl font-extrabold text-neutral-900 mt-6">Welcome back</Text>

        <View className="mt-10 gap-4">
          <TextInput 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />
          <TextInput 
            placeholder="Password" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry 
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />

          <TouchableOpacity className="items-center mt-2">
            <Text className="text-neutral-500">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-500 py-4 rounded-2xl items-center mt-4"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Signing In...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-neutral-500 mt-6">Or continue with</Text>

          <View className="flex-row gap-4 mt-4">
            <TouchableOpacity className="flex-1 bg-red-50 py-4 rounded-2xl items-center">
              <Text className="text-neutral-900 font-semibold">Continue with Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-red-50 py-4 rounded-2xl items-center">
              <Text className="text-neutral-900 font-semibold">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="items-center mt-8" onPress={() => router.replace('/auth/register')}>
            <Text className="text-neutral-900">Don't have an account? Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


