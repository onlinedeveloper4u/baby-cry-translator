import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
}

export function OnboardingLayout({
  children,
  title,
  description,
  buttonText,
  onButtonPress,
}: OnboardingLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top Section */}
        <View className="flex-1">
          {children}
        </View>
        
        {/* Bottom Section */}
        <View className="flex-1 bg-white px-8 justify-center">
          <Text className="text-gray-800 text-2xl font-bold text-center mb-4">
            {title}
          </Text>
          <Text className="text-gray-600 text-base text-center mb-8">
            {description}
          </Text>
        </View>
        
        {/* Navigation Button */}
        <View className="px-8 pb-8">
          <TouchableOpacity
            onPress={onButtonPress}
            className="bg-red-500 py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-semibold">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
