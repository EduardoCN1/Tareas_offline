// src/components/OfflineBanner.js
import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

export function OfflineBanner({ syncing }) {
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.text}>
        {syncing ? ' Sincronizando cambios...' : ' Sin conexión a internet'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1F2937',
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'left',
    zIndex: 999,
  },
  text: {
    color: '#F9FAFB',
    fontSize: 13,
  },
});