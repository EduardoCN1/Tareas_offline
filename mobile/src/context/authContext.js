import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// ============================================================
// CONTEXT DE AUTENTICACIÓN
// ============================================================
// Cualquier componente puede acceder al usuario actual y funciones de auth.

// Crear el contexto
const AuthContext = createContext(null);

// ============================================================
// PROVIDER - Envuelve toda la app y provee el estado
// ============================================================
export function AuthProvider({ children }) {
  // Estado de autenticación
  const [user, setUser] = useState(null);           // Usuario actual
  const [isLoading, setIsLoading] = useState(true); // Verificando sesión inicial
  const [error, setError] = useState(null);         // Errores de auth

  // ----------------------------------------------------------
  // Al iniciar la app, verificar si hay sesión guardada
  // ----------------------------------------------------------
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => { 
    try {
      const hasToken = await authService.hasToken();
      if (hasToken) {
        const userData = await authService.getMe(); // Obtener datos del usuario con el token guardado
        setUser(userData.user || userData); // Guardar usuario en estado global
      }
    } catch (err) {
      // Token inválido o expirado
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Función de login
  // ----------------------------------------------------------
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ----------------------------------------------------------
  // Función de registro
  // ----------------------------------------------------------
  const register = async (name, email, password) => {
    // Flujo de registro: mismo patrón que login.
    // Si backend responde OK, el usuario queda autenticado de inmediato.
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      // Manejar errores de validación de Laravel
      const errors = err.response?.data?.errors;
      const message = errors 
        ? Object.values(errors).flat().join('\n')
        : err.response?.data?.message || 'Error al registrarse';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ----------------------------------------------------------
  // Función de logout
  // ----------------------------------------------------------
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // ----------------------------------------------------------
  // Actualizar datos del usuario (después de cambiar avatar, etc)
  // ----------------------------------------------------------
  const refreshUser = async () => {
    // Se usa cuando cambia algo del perfil (por ejemplo avatar)
    // para sincronizar el estado local con el backend.
    try {
      const userData = await authService.getMe();
      setUser(userData.user || userData);
    } catch (err) {
      console.log('Error actualizando usuario:', err);
    }
  };

  // Valor que se comparte con toda la app
  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK PERSONALIZADO - Para usar el contexto fácilmente
// ============================================================
// En lugar de: const context = useContext(AuthContext)
// Usamos: const { user, login, logout } = useAuth()

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}