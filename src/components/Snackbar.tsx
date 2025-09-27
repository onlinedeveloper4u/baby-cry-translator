import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import useToastStore from '../store/toast';

export default function Snackbar() {
  const { message, type, visible, hide } = useToastStore();
  const translateY = React.useRef(new Animated.Value(80)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      const t = setTimeout(() => hide(), 3000);
      return () => clearTimeout(t);
    } else {
      Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!message) return null;

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-neutral-800';

  return (
    <Animated.View style={{ transform: [{ translateY }] }} className={`absolute left-4 right-4 bottom-6 ${bg} rounded-2xl p-4`}>
      <View className="flex-row items-center justify-between">
        <Text className="text-white font-medium">{message}</Text>
        <TouchableOpacity onPress={hide} className="ml-3">
          <Text className="text-white opacity-80">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
