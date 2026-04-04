import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

// ============================================================
// SERVICIO DE IMÁGENES
// ============================================================
// Maneja la selección de imágenes desde cámara o galería
// y extracción de metadatos EXIF

const imageService = {
  // ----------------------------------------------------------
  // Solicitar permiso de cámara
  // ----------------------------------------------------------
  async requestCameraPermission() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para tomar fotos de perfil.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error solicitando permiso de cámara:', error.message);
      return false;
    }
  },

  // ----------------------------------------------------------
  // Solicitar permiso de galería
  // ----------------------------------------------------------
  async requestGalleryPermission() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para seleccionar fotos.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error solicitando permiso de galería:', error.message);
      return false;
    }
  },

  // ----------------------------------------------------------
  // Tomar foto con la cámara
  // ----------------------------------------------------------
  async takePhoto() {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Cuadrado para foto de perfil
        quality: 0.8,
        exif: true, // Solicitar metadatos EXIF
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        exif: asset.exif || null,
      };
    } catch (error) {
      console.log('Error tomando foto:', error.message);
      Alert.alert('Error', 'No se pudo tomar la foto');
      return null;
    }
  },

  // ----------------------------------------------------------
  // Seleccionar imagen de la galería
  // ----------------------------------------------------------
  async pickFromGallery() {
    const hasPermission = await this.requestGalleryPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: true,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        exif: asset.exif || null,
      };
    } catch (error) {
      console.log('Error seleccionando imagen:', error.message);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      return null;
    }
  },

  // ----------------------------------------------------------
  // Mostrar opciones de selección (cámara o galería)
  // ----------------------------------------------------------
  showImageOptions() {
    return new Promise((resolve) => {
      Alert.alert(
        'Cambiar foto de perfil',
        'Elige una opción',
        [
          {
            text: 'Tomar foto',
            onPress: async () => {
              const result = await this.takePhoto();
              resolve(result);
            },
          },
          {
            text: 'Elegir de galería',
            onPress: async () => {
              const result = await this.pickFromGallery();
              resolve(result);
            },
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  },

  // ----------------------------------------------------------
  // Formatear datos EXIF para mostrar
  // ----------------------------------------------------------
  formatExifData(exif) {
    if (!exif) return null;

    const formatted = {};

    // Fecha de captura
    if (exif.DateTimeOriginal) {
      formatted.fechaCaptura = exif.DateTimeOriginal;
    } else if (exif.DateTime) {
      formatted.fechaCaptura = exif.DateTime;
    }

    // Modelo del dispositivo
    if (exif.Model) {
      formatted.modelo = exif.Model;
    }
    if (exif.Make) {
      formatted.fabricante = exif.Make;
    }

    // Coordenadas GPS
    if (exif.GPSLatitude && exif.GPSLongitude) {
      formatted.gps = {
        latitud: exif.GPSLatitude,
        longitud: exif.GPSLongitude,
      };
    }

    // Dimensiones
    if (exif.ImageWidth && exif.ImageLength) {
      formatted.dimensiones = `${exif.ImageWidth} x ${exif.ImageLength}`;
    }

    // Configuración de cámara
    if (exif.FNumber) {
      formatted.apertura = `f/${exif.FNumber}`;
    }
    if (exif.ExposureTime) {
      formatted.exposicion = `${exif.ExposureTime}s`;
    }
    if (exif.ISOSpeedRatings) {
      formatted.iso = exif.ISOSpeedRatings;
    }

    return Object.keys(formatted).length > 0 ? formatted : null;
  },
};

export default imageService;