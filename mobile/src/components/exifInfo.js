import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// EXIF INFO - Muestra metadatos de la imagen
// ============================================================

export default function ExifInfo({ exif }) {
  if (!exif) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            Sin metadatos EXIF disponibles
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metadatos EXIF</Text>
      
      {exif.fechaCaptura && (
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{exif.fechaCaptura}</Text>
        </View>
      )}

      {(exif.fabricante || exif.modelo) && (
        <View style={styles.row}>
          <Ionicons name="phone-portrait-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>Dispositivo:</Text>
          <Text style={styles.value}>
            {[exif.fabricante, exif.modelo].filter(Boolean).join(' ')}
          </Text>
        </View>
      )}

      {exif.gps && (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>GPS:</Text>
          <Text style={styles.value}>
            {exif.gps.latitud.toFixed(4)}, {exif.gps.longitud.toFixed(4)}
          </Text>
        </View>
      )}

      {exif.dimensiones && (
        <View style={styles.row}>
          <Ionicons name="resize-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>Tamaño:</Text>
          <Text style={styles.value}>{exif.dimensiones}</Text>
        </View>
      )}

      {(exif.apertura || exif.exposicion || exif.iso) && (
        <View style={styles.row}>
          <Ionicons name="camera-outline" size={16} color="#6B7280" />
          <Text style={styles.label}>Cámara:</Text>
          <Text style={styles.value}>
            {[exif.apertura, exif.exposicion, exif.iso ? `ISO ${exif.iso}` : null]
              .filter(Boolean)
              .join(' | ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 4,
  },
  value: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});