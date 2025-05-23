import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Keyboard,
} from 'react-native';
import { fetchLugares } from '../api';

const LocationSearchScreen = ({ navigation }) => {
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    const loadLocations = async () => {
      const lugares = await fetchLugares();
      setAllLocations(lugares);
    };
    loadLocations();
  }, []);

  const filterSuggestions = (text) => {
    const filtered = allLocations.filter(
      (item) =>
        item.Nombre &&
        item.Nombre.toLowerCase().includes(text.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 10));
  };

  const handleSelect = (item) => {
    if (activeInput === 'origin') {
      setSelectedOrigin(item);
      setOriginQuery(item.Nombre);
    } else if (activeInput === 'destination') {
      setSelectedDestination(item);
      setDestinationQuery(item.Nombre);
    }

    setSuggestions([]);
    Keyboard.dismiss();
  };

  const goToMap = () => {
    if (!selectedOrigin || !selectedDestination) {
      alert('Selecciona tanto el origen como el destino');
      return;
    }

    navigation.navigate('MapScreen', {
      origin: {
        latitude: parseFloat(selectedOrigin.Latitud),
        longitude: parseFloat(selectedOrigin.Longitud),
        name: selectedOrigin.Nombre,
        category: selectedDestination.Categoria,
      },
      destination: {
        latitude: parseFloat(selectedDestination.Latitud),
        longitude: parseFloat(selectedDestination.Longitud),
        name: selectedDestination.Nombre,
        category: selectedDestination.Categoria,
      },
      categories: ['Museo', 'Templo', 'Restaurante']
});


  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Origen</Text>
      <TextInput
        style={styles.input}
        placeholder="Selecciona origen"
        value={originQuery}
        onChangeText={(text) => {
          setOriginQuery(text);
          setActiveInput('origin');
          filterSuggestions(text);
        }}
      />

      <Text style={styles.label}>Destino</Text>
      <TextInput
        style={styles.input}
        placeholder="Selecciona destino"
        value={destinationQuery}
        onChangeText={(text) => {
          setDestinationQuery(text);
          setActiveInput('destination');
          filterSuggestions(text);
        }}
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <Text style={styles.item}>{item.Nombre}</Text>
          </TouchableOpacity>
        )}
      />

      <Button title="Ver en mapa" onPress={goToMap} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default LocationSearchScreen;
