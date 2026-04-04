import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// ============================================================
// HOOK DE UBICACIÓN
// ============================================================
// Encapsula la lógica de solicitar permisos y obtener coordenadas.
// Retorna: { location, error, loading, requestLocation }

export default function useLocation(requestOnMount = false) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------
  // Solicitar permisos y obtener ubicación
  // ----------------------------------------------------------
  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Paso 1: Solicitar permiso
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        setLoading(false);
        return null;
      }

      // Paso 2: Obtener ubicación actual
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balance entre precisión y velocidad
      });

      const coords = {
        latitud: currentLocation.coords.latitude,
        longitud: currentLocation.coords.longitude,
      };

      setLocation(coords);
      setLoading(false);
      return coords;

    } catch (err) {
      console.error('Error obteniendo ubicación:', err);
      setError('No se pudo obtener la ubicación');
      setLoading(false);
      return null;
    }
  };

  // Si requestOnMount es true, obtener ubicación al montar
  useEffect(() => {
    if (requestOnMount) {
      requestLocation();
    }
  }, []);

  return {
    location,
    error,
    loading,
    requestLocation,
  };
}