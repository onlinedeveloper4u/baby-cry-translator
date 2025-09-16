import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyGender, setBabyGender] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const { signUp, loading } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const { error } = await signUp(email, password, name);
    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      router.push({ pathname: '/auth/verify-email', params: { email } });
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
        <Text className="text-center text-4xl font-extrabold text-neutral-900">Sign Up</Text>

        <View className="mt-10 gap-4">
          <TextInput 
            placeholder="Name" 
            value={name}
            onChangeText={setName}
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />
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
          <TextInput 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry 
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />

          <Text className="text-neutral-900 text-xl font-extrabold mt-4">Add Baby Profile (Optional)</Text>

          <TextInput 
            placeholder="Baby's Name" 
            value={babyName}
            onChangeText={setBabyName}
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />
          <TextInput 
            placeholder="Baby's Gender" 
            value={babyGender}
            onChangeText={setBabyGender}
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />
          <TextInput 
            placeholder="Baby's Birth Date" 
            value={babyBirthDate}
            onChangeText={setBabyBirthDate}
            className="bg-red-50 rounded-2xl px-4 py-4 text-neutral-900" 
            placeholderTextColor="#9F6B6B" 
          />

          <TouchableOpacity 
            className="bg-red-500 py-4 rounded-2xl items-center mt-6" 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mt-6" onPress={() => router.replace('/auth/login')}>
            <Text className="text-neutral-900">Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


