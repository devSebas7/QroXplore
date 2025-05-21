// screens/MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const route = useRoute();
  const { origin, destination } = route.params;

  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ';

  const fetchRoute = async () => {
    const originParam = `${origin.latitude},${origin.longitude}`;
    const destParam = `${destination.latitude},${destination.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      } else {
        console.warn('No se encontraron rutas');
      }
    } catch (error) {
      console.error('Error al obtener ruta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Marcadores */}
        <Marker coordinate={origin} title="Origen" description={origin.name} />
        <Marker coordinate={destination} title="Destino" description={destination.name} />

        {/* Ruta */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
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
});
