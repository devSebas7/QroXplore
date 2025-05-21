import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [routeCoords, setRouteCoords] = useState([]);
  const [touristPlaces, setTouristPlaces] = useState([]);

  // Centro histórico de Querétaro
  const origin = { latitude: 20.5888, longitude: -100.3899 };
  const destination = { latitude: 20.6042, longitude: -100.4028 };

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ';

  const fetchRoute = async () => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
      } else {
        console.warn('No se encontraron rutas');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  };

  const fetchTouristPlaces = async () => {
    const location = `${origin.latitude},${origin.longitude}`;
    const radius = 3000; // 3km
    const type = 'tourist_attraction';

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        setTouristPlaces(data.results);
      }
    } catch (error) {
      console.error('Error al obtener lugares turísticos:', error);
    }
  };

  useEffect(() => {
    fetchRoute();
    fetchTouristPlaces();
  }, []);

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
        {/* Marcadores de origen y destino */}
        <Marker coordinate={origin} title="Origen" />
        <Marker coordinate={destination} title="Destino" />

        {/* Ruta */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}

        {/* Lugares turísticos */}
        {touristPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
            pinColor="orange"
          />
        ))}
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
});
