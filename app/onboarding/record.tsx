import { router } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';

export default function RecordScreen() {
  const handleNext = () => {
    router.push('/onboarding/translate');
  };

  return (
    <OnboardingLayout
      title="Record your baby's cry"
      description="Press and hold the button to record your baby's cry. Release to stop recording."
      buttonText="Next"
      onButtonPress={handleNext}
    >
    <Image 
        source={require('../../assets/images/onboarding/record.png')}
        className="w-full h-80"
        resizeMode="cover"
    />
    </OnboardingLayout>
  );
}
