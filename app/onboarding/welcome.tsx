import { router } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';

export default function WelcomeScreen() {
  const handleNext = () => {
    router.push('/onboarding/record');
  };

  return (
    <OnboardingLayout
      title="Instantly Translate Your Baby's Cries"
      description="Understand your baby's needs in real-time with our AI-powered cry analysis. No more guesswork, just clear insights."
      buttonText="Next"
      onButtonPress={handleNext}
    >
    <Image 
        source={require('../../assets/images/onboarding/welocome.png')}
        className="w-full h-80"
        resizeMode="cover"
    />
    </OnboardingLayout>
  );
}
