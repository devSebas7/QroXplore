import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlacesProvider } from './context/PlacesContext';

// Importa tus pantallas
import LocationSearchScreen from './screens/LocationSearchScreen';
import RouteScreen from './screens/RouteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PlacesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LocationSearch">
          <Stack.Screen
            name="LocationSearch"
            component={LocationSearchScreen}
            options={{ title: 'Configurar Ruta' }}
          />
          <Stack.Screen
            name="RouteScreen"
            component={RouteScreen}
            options={{ title: 'Ruta Peatonal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PlacesProvider>
  );
}