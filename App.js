// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa tus pantallas
import LocationSearchScreen from './screens/LocationSearchScreen';
import MapScreen from './screens/MapScreen';
import LocationSearchScreenTest from './screens/LocationSearchScreenTest';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
        <Stack.Screen
          name="LocationSearchTest"
          component={LocationSearchScreenTest}
          options={{ title: 'Buscar Ruta Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
