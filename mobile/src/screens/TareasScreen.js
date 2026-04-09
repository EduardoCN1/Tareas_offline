import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import TareasService from '../services/tareasService';
import TareaCard from '../components/tareaCard';
import EmptyState from '../components/empyState'

// ============================================================
// TAREAS SCREEN - Lista principal de tareas
// ============================================================

export default function TareasScreen({ navigation }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------------------------------
  // Cargar tareas desde la API
  // ----------------------------------------------------------
  const fetchTareas = async (showLoader = true) => {
    // Flujo de carga principal:
    // UI pide datos -> tareasService llama GET /tareas -> estado local se actualiza.
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await TareasService.getAll();
      // La API puede devolver { data: [...] } o directamente [...]
      const tareasData = response.data || response;
      setTareas(tareasData);
    } catch (err) {
      setError('No se pudieron cargar las tareas');
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ----------------------------------------------------------
  // Cargar tareas cuando la pantalla obtiene el foco
  // ----------------------------------------------------------
  // Esto es importante: cada vez que vuelves a esta pantalla
  // (después de crear/editar tarea), se recargan los datos
  useFocusEffect(
    useCallback(() => {
      fetchTareas();
    }, [])
  );

  // ----------------------------------------------------------
  // Pull to refresh
  // ----------------------------------------------------------
  const onRefresh = () => {
    setRefreshing(true);
    fetchTareas(false);
  };

  // ----------------------------------------------------------
  // Marcar/desmarcar tarea como completada
  // ----------------------------------------------------------
  const handleToggleCompletada = async (id, completada) => {
    try {
      // Actualización optimista: actualizar UI inmediatamente
      // (la experiencia se siente rápida aunque la red tarde).
      setTareas(prevTareas =>
        prevTareas.map(t =>
          t.id === id ? { ...t, completada } : t
        )
      );

      // Luego actualizar en el servidor
      await TareasService.toggleCompletada(id, completada);
    } catch (err) {
      console.error('Error actualizando tarea:', err);
      // Revertir si falla
      fetchTareas(false);
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  // ----------------------------------------------------------
  // Eliminar tarea
  // ----------------------------------------------------------
  const handleDelete = async (id) => {
    try {
      // Actualización optimista
      // Primero quitamos en pantalla, luego confirmamos en backend.
      setTareas(prevTareas => prevTareas.filter(t => t.id !== id));
      
      await TareasService.delete(id);
    } catch (err) {
      console.error('Error eliminando tarea:', err);
      fetchTareas(false);
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  // ----------------------------------------------------------
  // Navegar a editar tarea
  // ----------------------------------------------------------
  const handleEdit = (tarea) => {
    // Navega al formulario en modo edición, enviando la tarea actual.
    navigation.navigate('TareaForm', { tarea });
  };

  // ----------------------------------------------------------
  // Navegar a crear tarea
  // ----------------------------------------------------------
  const handleCreate = () => {
    // Navega al formulario en modo creación (sin tarea en params).
    navigation.navigate('TareaForm');
  };

  // ----------------------------------------------------------
  // Renderizar cada item de la lista
  // ----------------------------------------------------------
  const renderItem = ({ item }) => (
    <TareaCard
      tarea={item}
      onToggleCompletada={handleToggleCompletada}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  // ----------------------------------------------------------
  // Separar tareas pendientes y completadas
  // ----------------------------------------------------------
  const tareasPendientes = tareas.filter(t => !t.completada);
  const tareasCompletadas = tareas.filter(t => t.completada);
  const tareasOrdenadas = [...tareasPendientes, ...tareasCompletadas];

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Tareas</Text>
        <Text style={styles.headerSubtitle}>
          {tareasPendientes.length} pendiente{tareasPendientes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de tareas */}
      {tareas.length === 0 ? (
        <EmptyState
          icon="checkbox-outline"
          title="No tienes tareas"
          message="Toca el botón + para crear tu primera tarea"
        />
      ) : (
        <FlatList
          data={tareasOrdenadas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 100, // Espacio para el FAB
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
