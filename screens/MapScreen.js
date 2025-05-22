// screens/MapScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const route = useRoute();
  const { origin, destination } = route.params || {};

  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ'; // Reemplaza si necesitas protegerlo

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
          description={origin.name}
          pinColor="green"
        />
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title="Destino"
          description={destination.name}
          pinColor="red"
        />
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
