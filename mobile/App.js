import {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//Contexto de autenticación
import { AuthProvider } from './src/context/authContext';
//Navegación
import AppNavigator from './src/navigation/appNavigator';

//Inicialización de la base de datos SQLite
import { initDatabase } from './src/database/dataBase.js';
//Hook personalizado para sincronización automatica
import { useNetworkSync } from './src/hooks/useNetworkSync';
// Hook personalizado carga de tareas que llama al repositorio
import { useTareas } from './src/hooks/useTareas';
// Componente de banner de conexción offline
import {OfflineBanner} from './src/components/offlineBanner';

//  Componente interno - vive DENTRO del AuthProvider 
function AppContent() {

  //Estados de sincronización y conexión
  const { recargar } = useTareas();
  const { isOnline, syncing } = useNetworkSync(recargar);

  //Inicializar la base de datos al montar la aplicación
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <>
      {!isOnline && <OfflineBanner syncing={syncing} />}
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

//Raiz de la aplicación - proovedores de contexto y navegción
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
    </SafeAreaProvider>
  );
}