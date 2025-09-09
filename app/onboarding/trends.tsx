import { router } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';

export default function TrendsScreen() {
  const handleGetStarted = () => {
    // Navigate to main app
    router.replace('/');
  };

  return (
    <OnboardingLayout
      title="Learn Your Baby's Cry Trends"
      description="Over time, the app helps you understand your baby's cry patterns, providing insights into their needs and routines."
      buttonText="Get Started"
      onButtonPress={handleGetStarted}
    >
    <Image 
        source={require('../../assets/images/onboarding/trends.png')}
        className="w-full h-80"
        resizeMode="cover"
    />
    </OnboardingLayout>
  );
}
