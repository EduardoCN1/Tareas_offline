import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ============================================================
// TAG BADGE - Muestra una etiqueta con su color
// ============================================================
// Props:
//   - nombre: string (texto del tag)
//   - color: string (color hex, ej: "#3B82F6")

export default function TagBadge({ nombre, color }) {
  // Determinar si el color de fondo es oscuro para ajustar el texto
  const isColorDark = (hexColor) => {
    // Convertir hex a RGB y calcular luminosidad
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminosity = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminosity < 0.5;
  };

  const textColor = isColorDark(color) ? '#FFFFFF' : '#1F2937';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.text, { color: textColor }]}>{nombre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});