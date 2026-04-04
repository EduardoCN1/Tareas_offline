import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// TAG SELECTOR - Selección múltiple de tags
// ============================================================
// Props:
//   - tags: array de todos los tags disponibles
//   - selectedIds: array de IDs seleccionados
//   - onSelectionChange: función que recibe el nuevo array de IDs

export default function TagSelector({ tags, selectedIds = [], onSelectionChange }) {
  
  const toggleTag = (tagId) => {
    if (selectedIds.includes(tagId)) {
      // Quitar tag
      onSelectionChange(selectedIds.filter(id => id !== tagId));
    } else {
      // Agregar tag
      onSelectionChange([...selectedIds, tagId]);
    }
  };

  const isSelected = (tagId) => selectedIds.includes(tagId);

  if (!tags || tags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay etiquetas disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              { borderColor: tag.color },
              isSelected(tag.id) && { backgroundColor: tag.color },
            ]}
            onPress={() => toggleTag(tag.id)}
          >
            {isSelected(tag.id) && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.tagText,
                { color: isSelected(tag.id) ? '#FFFFFF' : tag.color },
              ]}
            >
              {tag.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});