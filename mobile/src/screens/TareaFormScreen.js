import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import tareasService from '../services/tareasService';
import tagsService from '../services/tagsService';
import notificationService from '../services/notificationService';
import useLocation from '../hooks/useLocation';
import TagSelector from '../components/tagSelector';

// ============================================================
// TAREA FORM SCREEN - Crear y Editar tareas
// ============================================================

export default function TareaFormScreen({ route, navigation }) {
  // Si viene tarea en params, estamos editando
  const tareaToEdit = route.params?.tarea;
  const isEditing = !!tareaToEdit;

  // Vista mental rápida de este formulario:
  // - Modo crear: POST /tareas + opcional ubicación + notificación.
  // - Modo editar: PUT /tareas/:id + sincronización de tags + notificación.

  // ----------------------------------------------------------
  // Estado del formulario
  // ----------------------------------------------------------
  const [titulo, setTitulo] = useState(tareaToEdit?.titulo || '');
  const [descripcion, setDescripcion] = useState(tareaToEdit?.descripcion || '');
  const [fechaLimite, setFechaLimite] = useState(
    tareaToEdit?.fecha_limite ? new Date(tareaToEdit.fecha_limite) : null
  );
  const [selectedTagIds, setSelectedTagIds] = useState(
    tareaToEdit?.tags?.map(t => t.id) || []
  );

  // ----------------------------------------------------------
  // Estado de la UI
  // ----------------------------------------------------------
  const [tags, setTags] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);

  // ----------------------------------------------------------
  // Hook de ubicación (solo para crear, no editar)
  // ----------------------------------------------------------
  const { location, loading: loadingLocation, requestLocation } = useLocation();

  // ----------------------------------------------------------
  // Cargar tags disponibles
  // ----------------------------------------------------------
  useEffect(() => {
    fetchTags();
  }, []);

  // ----------------------------------------------------------
  // Obtener ubicación al crear tarea
  // ----------------------------------------------------------
  useEffect(() => {
    if (!isEditing) {
      requestLocation();
    }
  }, []);

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      // Carga catálogo de etiquetas para selección múltiple.
      const response = await tagsService.getAll();
      const tagsData = response.data || response;
      setTags(tagsData);
    } catch (err) {
      console.error('Error cargando tags:', err);
    } finally {
      setLoadingTags(false);
    }
  };

  // ----------------------------------------------------------
  // Manejar cambio de fecha
  // ----------------------------------------------------------
  const handleDateChange = (event, selectedDate) => {
    // En Android, el picker se cierra automáticamente
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      setFechaLimite(selectedDate);
    }
  };

  // Cerrar picker en iOS
  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  // Quitar fecha límite
  const clearFechaLimite = () => {
    setFechaLimite(null);
  };

  // ----------------------------------------------------------
  // Guardar tarea
  // ----------------------------------------------------------
  const handleSave = async () => {
    // Validación
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    if (titulo.trim().length > 150) {
      Alert.alert('Error', 'El título no puede exceder 150 caracteres');
      return;
    }

    setSaving(true);

    try {
      // Preparar datos
      const tareaData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        fecha_limite: fechaLimite 
          ? format(fechaLimite, 'yyyy-MM-dd')
          : null,
      };

      // Agregar ubicación solo si estamos creando y la tenemos
      if (!isEditing && location) {
        tareaData.latitud = location.latitud;
        tareaData.longitud = location.longitud;
      }

      let savedTarea;

      if (isEditing) {
        // Actualizar tarea existente
        // Llama PUT /tareas/:id
        savedTarea = await tareasService.update(tareaToEdit.id, tareaData);
      } else {
        // Crear nueva tarea
        // Llama POST /tareas
        savedTarea = await tareasService.create(tareaData);
      }

      // Obtener el ID de la tarea guardada
      const tareaId = savedTarea.data?.id || savedTarea.id || tareaToEdit?.id;

      // Asignar tags si hay seleccionados
      // El backend maneja relación muchos-a-muchos en endpoint de tags.
      if (selectedTagIds.length > 0 && tareaId) {
        await tareasService.assignTags(tareaId, selectedTagIds);
      } else if (isEditing && tareaId) {
        // Si estamos editando y no hay tags seleccionados, limpiar tags
        await tareasService.assignTags(tareaId, []);
      }

      // Manejar notificación
      // Si hay fecha límite: programar recordatorio local.
      // Si se quita fecha: cancelar recordatorio previo.
      if (fechaLimite && tareaId) {
        await notificationService.scheduleTaskNotification(
          tareaId,
          titulo.trim(),
          fechaLimite
        );
      } else if (tareaId) {
        // Si no hay fecha límite, cancelar notificación existente
        await notificationService.cancelTaskNotification(tareaId);
      }

      // Volver a la lista
      navigation.goBack();

    } catch (err) {
      console.error('Error guardando tarea:', err);
      const message = err.response?.data?.message || 'No se pudo guardar la tarea';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Campo: Título */}
        <View style={styles.field}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor="#9CA3AF"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={150}
          />
          <Text style={styles.charCount}>{titulo.length}/150</Text>
        </View>

        {/* Campo: Descripción */}
        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega más detalles (opcional)"
            placeholderTextColor="#9CA3AF"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Campo: Fecha límite */}
        <View style={styles.field}>
          <Text style={styles.label}>Fecha límite</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>
                {fechaLimite
                  ? format(fechaLimite, "d 'de' MMMM, yyyy", { locale: es })
                  : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>

            {fechaLimite && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFechaLimite}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <View>
              <DateTimePicker
                value={fechaLimite || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                locale="es-ES"
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.doneButton} onPress={closeDatePicker}>
                  <Text style={styles.doneButtonText}>Listo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Campo: Tags */}
        <View style={styles.field}>
          <Text style={styles.label}>Etiquetas</Text>
          {loadingTags ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <TagSelector
              tags={tags}
              selectedIds={selectedTagIds}
              onSelectionChange={setSelectedTagIds}
            />
          )}
        </View>

        {/* Indicador de ubicación (solo al crear) */}
        {!isEditing && (
          <View style={styles.locationInfo}>
            <Ionicons 
              name="location" 
              size={18} 
              color={location ? '#10B981' : '#9CA3AF'} 
            />
            <Text style={styles.locationText}>
              {loadingLocation
                ? 'Obteniendo ubicación...'
                : location
                  ? 'Ubicación obtenida'
                  : 'Sin ubicación (permiso denegado)'}
            </Text>
          </View>
        )}

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Guardar cambios' : 'Crear tarea'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  charCount: {
    textAlign: 'right',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 12,
    padding: 4,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  doneButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});