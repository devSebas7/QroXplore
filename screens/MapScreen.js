import React, { useEffect, useState, useCallback, useContext } from 'react';
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
import { PlacesContext } from '../context/PlacesContext';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const route = useRoute();
  const { origin, destination } = route.params || {};
  const { 
    optimizedRoute, 
    generateRoute, 
    selectedCategories,
    isLoading: contextLoading
  } = useContext(PlacesContext);

  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ';

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) {
      setErrorMessage('No se recibió origen o destino válidos.');
      setLoading(false);
      return;
    }

    try {
      const originParam = `${origin.latitude},${origin.longitude}`;
      const destParam = `${destination.latitude},${destination.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&key=${GOOGLE_API_KEY}`;

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
  }, [origin, destination]);

  const handleGenerateRoute = async () => {
    if (!origin || !destination) {
      setErrorMessage('Selecciona origen y destino primero');
      return;
    }
    if (!selectedCategories || selectedCategories.length === 0) {
      setErrorMessage('Selecciona al menos una categoría');
      return;
    }

    setLoading(true);
    try {
      await generateRoute();
      
      const coords = optimizedRoute.map(place => ({
        latitude: typeof place.Latitud === 'string' ? parseFloat(place.Latitud) : place.Latitud,
        longitude: typeof place.Longitud === 'string' ? parseFloat(place.Longitud) : place.Longitud,
      }));
      setRouteCoords(coords);
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoute();
    }, [fetchRoute])
  );

  if (loading || contextLoading) {
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
          description={origin.name}
          pinColor="green"
        />
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title="Destino"
          description={destination.name}
          pinColor="red"
        />

        {optimizedRoute.map((place, index) => {
          const lat = typeof place.Latitud === 'string' ? parseFloat(place.Latitud) : place.Latitud;
          const lng = typeof place.Longitud === 'string' ? parseFloat(place.Longitud) : place.Longitud;
          
          return (
            <Marker
              key={`stop-${index}`}
              coordinate={{ latitude: lat, longitude: lng }}
              title={`${index + 1}. ${place.Nombre}`}
              description={place.Categoria}
              pinColor="#3498db"
            />
          );
        })}

        {routeCoords.length > 0 && (
          <Polyline 
            coordinates={routeCoords} 
            strokeWidth={4} 
            strokeColor="blue" 
          />
        )}
      </MapView>

      <View style={styles.bottomPanel}>
        <Text style={styles.selectedCategoriesText}>
          Itinerario: {selectedCategories.map((cat, i) => `${i + 1}. ${cat}`).join(', ')}
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGenerateRoute}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>GENERAR RUTA RECOMENDADA</Text>
          )}
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
  selectedCategoriesText: {
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    marginTop: 10,
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
