import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function SettingsScreen() {
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-neutral-900">Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Baby Profiles Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-neutral-900 mb-4">Baby Profiles</Text>
          <TouchableOpacity className="flex-row items-center py-4" onPress={() => router.push('/babies')}>
            <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="happy-outline" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-medium text-neutral-900">Manage Baby Profiles</Text>
              <Text className="text-sm text-amber-800 mt-1">Baby's name, age, and other details</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-neutral-900 mb-4">Account</Text>
          <View className="">
            <TouchableOpacity className="flex-row items-center py-4">
              <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="person-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-lg font-medium text-neutral-900 flex-1">Account Details</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4">
              <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="star-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-lg font-medium text-neutral-900 flex-1">Subscription Status</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4">
              <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="card-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-lg font-medium text-neutral-900 flex-1">Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Controls Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-neutral-900 mb-4">Data Controls</Text>
          <View>
            <TouchableOpacity className="flex-row items-center py-4">
              <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="download-outline" size={24} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-medium text-neutral-900">
                  Export Data <Text className="text-amber-800">(Premium)</Text>
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4"
              onPress={handleSignOut}
            >
              <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="log-out-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-lg font-medium text-neutral-900 flex-1">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Links */}
        <View className="flex-row justify-center space-x-6 mb-8">
          <TouchableOpacity>
            <Text className="text-amber-800 text-base">Privacy</Text>
          </TouchableOpacity>
          <Text className="text-amber-800 text-base">/</Text>
          <TouchableOpacity>
            <Text className="text-amber-800 text-base">Terms</Text>
          </TouchableOpacity>
          <Text className="text-amber-800 text-base">/</Text>
          <TouchableOpacity>
            <Text className="text-amber-800 text-base">About</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


