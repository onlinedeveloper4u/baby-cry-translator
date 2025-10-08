import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WaveformProps {
  data: number[];
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
  backgroundColor?: string;
  animated?: boolean;
  showGradient?: boolean;
}

export default function Waveform({
  data,
  width = 380,
  height = 120,
  barWidth = 4,
  barGap = 2,
  barColor = '#ef4444',
  backgroundColor = 'transparent',
  animated = true,
  showGradient = true,
}: WaveformProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Normalize data to fit within the height with more dynamic range
  const normalizedData = data.map(value => {
    const normalized = Math.abs(value) * (height / 2) / 150; // Increased range for more dynamic bars
    return Math.max(normalized, 2); // Minimum height for visibility
  });

  // Calculate bar positions
  const totalBarWidth = barWidth + barGap;
  const maxBars = Math.floor(width / totalBarWidth);
  const displayData = normalizedData.slice(-maxBars);

  // Fill with zeros if we don't have enough data
  while (displayData.length < maxBars) {
    displayData.unshift(0);
  }

  // Start animation when component mounts or data changes
  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);
      scaleValue.setValue(0.8);

      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [data.length, animated]);

  // Create bars for the waveform
  const bars = displayData.map((amplitude, index) => {
    const x = index * totalBarWidth;
    const barHeight = amplitude;
    const y = (height - barHeight) / 2;

    // Animate opacity and scale for smooth appearance
    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Animated.View key={index} style={{ opacity, transform: [{ scaleY: scale }] }}>
        <Rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={barColor}
          rx={barWidth / 2}
        />
      </Animated.View>
    );
  });

  return (
    <View className="items-center justify-center">
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Svg width={width} height={height} style={{ backgroundColor }}>
          {showGradient && (
            <Defs>
              <LinearGradient id="waveformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={barColor} stopOpacity={0.9} />
                <Stop offset="50%" stopColor={barColor} stopOpacity={1} />
                <Stop offset="100%" stopColor={barColor} stopOpacity={0.7} />
              </LinearGradient>
            </Defs>
          )}

          {/* Background waveform (static, lighter) */}
          {displayData.map((amplitude, index) => {
            const x = index * totalBarWidth;
            const barHeight = Math.max(amplitude * 0.4, 1); // 40% height, faded
            const y = (height - barHeight) / 2;

            return (
              <Rect
                key={`bg-${index}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                opacity={0.15}
                rx={barWidth / 2}
              />
            );
          })}

          {/* Foreground waveform (animated) */}
          {bars}

          {/* Center line for reference */}
          <Rect
            x={0}
            y={height / 2 - 1}
            width={width}
            height={2}
            fill={barColor}
            opacity={0.2}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
