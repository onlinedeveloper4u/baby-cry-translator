import { router } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';

export default function TranslateScreen() {
  const handleNext = () => {
    router.push('/onboarding/trends');
  };

  return (
    <OnboardingLayout
      title="We'll translate your baby's cry"
      description="Our AI analyzes the sound waves and provides insights into your baby's needs."
      buttonText="Next"
      onButtonPress={handleNext}
    >
    <Image 
        source={require('../../assets/images/onboarding/translate.png')}
        className="w-full h-90"
        resizeMode="cover"
    />
    </OnboardingLayout>
  );
}
