import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/authContext';
import authService from '../services/authService';
import imageService from '../services/imageService';
import ExifInfo from '../components/exifInfo';

import { BASE_URL } from '../config/config';

// ============================================================
// PERFIL SCREEN
// ============================================================

export default function PerfilScreen() {
  const { user, logout, refreshUser } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [showExif, setShowExif] = useState(false);

  // ----------------------------------------------------------
  // Obtener URL completa del avatar
  // ----------------------------------------------------------
 const getAvatarUrl = () => {

  if (selectedImage) {
    return selectedImage.uri;
  }
  
  if (user?.avatar) {
   
    let url = user.avatar;
    
    // Si ya es URL completa, usarla
    if (url.startsWith('http')) {
      // Agregar timestamp para evitar cache
      return `${url}?t=${Date.now()}`;
    }
    
    // Si empieza con /, quitar la barra inicial
    if (url.startsWith('/')) {
      url = url.substring(1);
    }
    
    // Construir URL completa - CAMBIA TU_IP_LOCAL por tu IP real
    const finalUrl = `${BASE_URL}/storage/${user.avatar}?t=${Date.now()}`;
    return finalUrl;
  }
  return null;
};

  // ----------------------------------------------------------
  // Seleccionar imagen (cámara o galería)
  // ----------------------------------------------------------
  const handleSelectImage = async () => {
    const result = await imageService.showImageOptions();
    
    if (result) {
      setSelectedImage(result);
      
      // Formatear y mostrar EXIF
      const formatted = imageService.formatExifData(result.exif);
      setExifData(formatted);
      setShowExif(true);
    }
  };

  // ----------------------------------------------------------
  // Subir imagen al servidor
  // ----------------------------------------------------------
  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setUploading(true);

    try {
      // Preparar datos EXIF para enviar al backend
      const exifToSend = exifData ? JSON.stringify(exifData) : null;
      
      await authService.uploadAvatar(selectedImage.uri, exifToSend);
      
      // Refrescar datos del usuario
      await refreshUser();
      
      Alert.alert('Éxito', 'Foto de perfil actualizada');
      
      // Limpiar selección
      setSelectedImage(null);
      setExifData(null);
      setShowExif(false);
      
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // ----------------------------------------------------------
  // Cancelar selección de imagen
  // ----------------------------------------------------------
  const handleCancelSelection = () => {
    setSelectedImage(null);
    setExifData(null);
    setShowExif(false);
  };

  // ----------------------------------------------------------
  // Confirmar cierre de sesión
  // ----------------------------------------------------------
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  const avatarUrl = getAvatarUrl();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con foto de perfil */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleSelectImage}
          disabled={uploading}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#9CA3AF" />
            </View>
          )}
          
          {/* Icono de editar */}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Preview de imagen seleccionada */}
      {selectedImage && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Nueva foto seleccionada</Text>
          
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          
          {/* Mostrar EXIF si está disponible */}
          {showExif && <ExifInfo exif={exifData} />}
          
          {/* Botones de acción */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSelection}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Subir foto</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Información de la cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Versión de la app */}
      <Text style={styles.version}>Tareas App v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1F2937',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#BFDBFE',
  },
  previewSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 12,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 30,
  },
});