import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface ChurchIconProps {
  size?: number;
}

export default function ChurchIcon({ size = 80 }: ChurchIconProps) {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});