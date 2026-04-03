import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/authContext';

// Pantallas de autenticación
import LoginScreen from '../screens/loginScreen';
import RegisterScreen from '../screens/registerScreen';

// Pantallas principales
import TareasScreen from '../screens/tareasScreen';
import TareaFormScreen from '../screens/tareaFormScreen';
import PerfilScreen from '../screens/perfilScreen';

// Crear navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================
// TAB NAVIGATOR - Navegación inferior (Tareas | Perfil)
// ============================================================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Tareas') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Tareas" component={TareasScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ============================================================
// MAIN STACK - Pantallas cuando el usuario está autenticado
// ============================================================
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#3B82F6' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TareaForm" 
        component={TareaFormScreen}
        options={({ route }) => ({
          title: route.params?.tarea ? 'Editar Tarea' : 'Nueva Tarea',
        })}
      />
    </Stack.Navigator>
  );
}

// ============================================================
// AUTH STACK - Pantallas cuando NO hay sesión
// ============================================================
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ============================================================
// APP NAVIGATOR - Decide qué stack mostrar
// ============================================================
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras verifica si hay sesión guardada, mostrar loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}