import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import polyline from '@mapbox/polyline';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const route = useRoute();
  const { origin, destination } = route.params || {};

  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['', '', '']);

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ';

  const fetchRoute = async () => {
    if (!origin || !destination) {
      setErrorMessage('No se recibió origen o destino válidos.');
      setLoading(false);
      return;
    }

    const originParam = `${origin.latitude},${origin.longitude}`;
    const destParam = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      } else {
        setErrorMessage('No se encontró una ruta entre los puntos.');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
      setErrorMessage('Ocurrió un error al obtener la ruta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value, index) => {
    const updated = [...selectedCategories];
    updated[index] = value;
    setSelectedCategories(updated);
  };

  const handleGenerateRoute = () => {
    console.log('Categorías seleccionadas:', selectedCategories);
    // Aquí puedes llamar a tu modelo de IA con las categorías en orden
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoute();
    }, [origin, destination])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 10 }}>Cargando mapa...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red', fontSize: 16 }}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 2 || 0.05,
          longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 2 || 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
          title="Origen"
          description={origin.Nombre}
          pinColor="green"
        />
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title="Destino"
          description={destination.Nombre}
          pinColor="red"
        />
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      {/* Panel de selección de categorías */}
      <View style={styles.bottomPanel}>
        <Text style={styles.label}>Categoría #1</Text>
        <Picker
          selectedValue={selectedCategories[0]}
          style={styles.picker}
          onValueChange={(itemValue) => handleCategoryChange(itemValue, 0)}
        >
          <Picker.Item label="Selecciona una categoría" value="" />
          <Picker.Item label="Museos" value="museos" />
          <Picker.Item label="Restaurantes" value="restaurantes" />
          <Picker.Item label="Templos" value="templos" />
        </Picker>

        <Text style={styles.label}>Categoría #2</Text>
        <Picker
          selectedValue={selectedCategories[1]}
          style={styles.picker}
          onValueChange={(itemValue) => handleCategoryChange(itemValue, 1)}
        >
          <Picker.Item label="Selecciona una categoría" value="" />
          <Picker.Item label="Museos" value="museos" />
          <Picker.Item label="Restaurantes" value="restaurantes" />
          <Picker.Item label="Templos" value="templos" />
        </Picker>

        <Text style={styles.label}>Categoría #3</Text>
        <Picker
          selectedValue={selectedCategories[2]}
          style={styles.picker}
          onValueChange={(itemValue) => handleCategoryChange(itemValue, 2)}
        >
          <Picker.Item label="Selecciona una categoría" value="" />
          <Picker.Item label="Museos" value="museos" />
          <Picker.Item label="Restaurantes" value="restaurantes" />
          <Picker.Item label="Templos" value="templos" />
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleGenerateRoute}>
          <Text style={styles.buttonText}>GENERAR RUTA RECOMENDADA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  picker: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
