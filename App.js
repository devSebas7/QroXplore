import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

const origin = { latitude: 20.5888, longitude: -100.3899 };
const destination = { latitude: 20.5736, longitude: -100.3836 };

export default function App() {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      const apiKey = "AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ";

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Directions API response:", data);
        if (data.routes.length) {
          const points = data.routes[0].overview_polyline.points;
          const coords = polyline.decode(points).map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(coords);
        } else {
          console.warn("No se encontró ruta");
        }
      } catch (error) {
        console.error("Error al obtener la ruta:", error);
      }
    };

    fetchRoute();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={origin} title="Origen" />
        <Marker coordinate={destination} title="Destino" />
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
