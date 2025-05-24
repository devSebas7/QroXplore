import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { PlacesContext } from '../context/PlacesContext';
import polyline from '@mapbox/polyline';

const RouteScreen = () => {
  const { 
    origin, 
    destination, 
    optimizedRoute, 
    generateRoute,
    error
  } = useContext(PlacesContext);

  const handleGenerateRoute = async () => {
    await generateRoute();
  };

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
          {/* Marcadores para los waypoints */}
          {optimizedRoute.waypoints?.map((place, index) => (
            <Marker
              key={`waypoint-${index}`}
              coordinate={{
                latitude: place.latitude || place.Latitud,
                longitude: place.longitude || place.Longitud
              }}
              title={`Parada ${index + 1}`}
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

  return (
    <View style={styles.container}>
      <MapView
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
            pinColor="green"
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            pinColor="red"
          />
        )}
        {renderRoute()}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          title="Generar Ruta"
          onPress={handleGenerateRoute}
        />
      </View>

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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
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