import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import TagBadge from './tagBadge';

// ============================================================
// TAREA CARD - Renderiza una tarea en la lista
// ============================================================
// Props:
//   - tarea: objeto con los datos de la tarea
//   - onToggleCompletada: función para marcar/desmarcar
//   - onEdit: función para editar
//   - onDelete: función para eliminar

export default function TareaCard({ tarea, onToggleCompletada, onEdit, onDelete }) {
  const { id, titulo, descripcion, completada, fecha_limite, tags } = tarea;

  // Formatear fecha límite si existe
  const formatFecha = (fecha) => {
    if (!fecha) return null;
    try {
      const date = new Date(fecha);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  // Verificar si la fecha ya pasó
  const isVencida = () => {
    if (!fecha_limite || completada) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(fecha_limite);
    return limite < hoy;
  };

  // Confirmar eliminación
  const handleDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      `¿Estás seguro de eliminar "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(id) },
      ]
    );
  };

  return (
    <View style={[styles.card, completada && styles.cardCompletada]}>
      {/* Checkbox y contenido principal */}
      <View style={styles.mainContent}>
        {/* Botón de completar */}
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => onToggleCompletada(id, !completada)}
        >
          <Ionicons 
            name={completada ? 'checkbox' : 'square-outline'} 
            size={28} 
            color={completada ? '#10B981' : '#9CA3AF'} 
          />
        </TouchableOpacity>

        {/* Contenido de la tarea */}
        <View style={styles.content}>
          <Text style={[styles.titulo, completada && styles.tituloCompletada]}>
            {titulo}
          </Text>
          
          {descripcion ? (
            <Text style={styles.descripcion} numberOfLines={2}>
              {descripcion}
            </Text>
          ) : null}

          {/* Fecha límite */}
          {fecha_limite && (
            <View style={styles.fechaContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={isVencida() ? '#EF4444' : '#6B7280'} 
              />
              <Text style={[styles.fecha, isVencida() && styles.fechaVencida]}>
                {formatFecha(fecha_limite)}
              </Text>
            </View>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TagBadge key={tag.id} nombre={tag.nombre} color={tag.color} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(tarea)}>
          <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Sombra para Android
    elevation: 2,
  },
  cardCompletada: {
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tituloCompletada: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  descripcion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fecha: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  fechaVencida: {
    color: '#EF4444',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
});