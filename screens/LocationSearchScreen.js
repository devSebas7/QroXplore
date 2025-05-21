// screens/LocationSearchScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';

export default function LocationSearchScreen() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const navigation = useNavigation();

  const GOOGLE_API_KEY = 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ';

  const handleConfirm = () => {
    if (origin && destination) {
      navigation.navigate('MapScreen', {
        origin,
        destination,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿A dónde quieres ir?</Text>

      <GooglePlacesAutocomplete
        placeholder="Punto de partida"
        onPress={(data, details = null) => {
          const location = details.geometry.location;
          setOrigin({
            name: data.description,
            latitude: location.lat,
            longitude: location.lng,
          });
        }}
        fetchDetails
        query={{
          key: GOOGLE_API_KEY,
          language: 'es',
          region: 'mx',
        }}
        styles={autoCompleteStyles}
      />

      <GooglePlacesAutocomplete
        placeholder="Destino"
        onPress={(data, details = null) => {
          const location = details.geometry.location;
          setDestination({
            name: data.description,
            latitude: location.lat,
            longitude: location.lng,
          });
        }}
        fetchDetails
        query={{
          key: GOOGLE_API_KEY,
          language: 'es',
          region: 'mx',
        }}
        styles={autoCompleteStyles}
      />

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Ver ruta</Text>
      </TouchableOpacity>
    </View>
  );
}

const autoCompleteStyles = {
  container: { flex: 0, marginBottom: 15 },
  textInput: {
    height: 50,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
