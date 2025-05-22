// screens/LocationSearchScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LocationSearchScreenTest({ navigation }) {
  // Datos de prueba
  const defaultOrigin = {
    name: 'Plaza de Armas, Querétaro',
    latitude: 20.5870,
    longitude: -100.3926,
    category: 'Plaza'
  };

  const defaultDestination = {
    name: 'Tecnológico de Monterrey, Querétaro',
    latitude: 20.6517,
    longitude: -100.4329,
    category: 'Universidad'
  };

  // Puedes usar esto para navegar automáticamente después de cargar la pantalla
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate('MapScreen', {
        origin: defaultOrigin,
        destination: defaultDestination
      });
    }, 1000); // Espera un segundo para visualizar algo antes de navegar

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de búsqueda de ubicación</Text>
      <Text>Usando datos de prueba por defecto</Text>
      <Button
        title="Ver ruta en el mapa"
        onPress={() =>
          navigation.navigate('MapScreen', {
            origin: defaultOrigin,
            destination: defaultDestination
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 20,
    marginBottom: 10
  }
});
