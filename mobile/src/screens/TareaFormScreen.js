import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TareaFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Formulario de Tarea</Text>
      <Text style={styles.subtext}>Próximamente...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});