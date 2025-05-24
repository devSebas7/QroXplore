import React, { useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { PlacesContext } from '../context/PlacesContext';
import polyline from '@mapbox/polyline';

const RouteScreen = () => {
  const { 
    origin, 
    destination, 
    optimizedRoute,
    generateRoute,
    isLoading,
    error
  } = useContext(PlacesContext);

  const mapRef = useRef(null);

  // Generar ruta automáticamente al entrar a la pantalla
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        await generateRoute();
      } catch (err) {
        console.error("Error generando ruta:", err);
      }
    };

    fetchRoute();
  }, []);

  // Centrar el mapa cuando hay datos
  useEffect(() => {
    if (origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    }
  }, [origin, destination]);

  const renderRoute = () => {
    if (!optimizedRoute?.polyline) return null;
    
    try {
      const decodedPoints = polyline.decode(optimizedRoute.polyline).map(point => ({
        latitude: point[0],
        longitude: point[1]
      }));

      return (
        <>
          <Polyline
            coordinates={decodedPoints}
            strokeColor="#3498db"
            strokeWidth={4}
          />
          {optimizedRoute.waypoints?.map((place, index) => (
            <Marker
              key={`waypoint-${index}`}
              coordinate={{
                latitude: place.latitude || place.Latitud,
                longitude: place.longitude || place.Longitud
              }}
              title={`${index + 1}. ${place.Nombre}`}
              description={place.Categoria}
              pinColor="#FFA500"
            />
          ))}
        </>
      );
    } catch (e) {
      console.error("Error renderizando ruta:", e);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: origin?.latitude || 20.5881,
          longitude: origin?.longitude || -100.3881,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {origin && (
          <Marker
            coordinate={origin}
            title="Origen"
            description={origin.name}
            pinColor="green"
          />
        )}
        
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            description={destination.name}
            pinColor="red"
          />
        )}
        
        {renderRoute()}
      </MapView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
  }
});

export default RouteScreen;