import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlacesProvider } from './context/PlacesContext'; // Asegúrate que la ruta sea correcta

// Importa tus pantallas
import LocationSearchScreen from './screens/LocationSearchScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PlacesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LocationSearch">
          <Stack.Screen
            name="LocationSearch"
            component={LocationSearchScreen}
            options={{ title: 'Buscar Ruta' }}
          />
          <Stack.Screen
            name="MapScreen"
            component={MapScreen}
            options={{ title: 'Mapa de Ruta' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PlacesProvider>
  );
}