// screens/LocationSearchScreen.js
import React, { useState } from 'react';
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

const LocationSearchScreen = ({ navigation }) => {
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeInput, setActiveInput] = useState(null); // 'origin' | 'destination'

  const fetchSuggestions = async (text) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:3000/search?q=${text}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (item) => {
    if (activeInput === 'origin') {
      setSelectedOrigin(item);
      setOriginQuery(item.name);
    } else if (activeInput === 'destination') {
      setSelectedDestination(item);
      setDestinationQuery(item.name);
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
      origin: selectedOrigin,
      destination: selectedDestination,
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
          fetchSuggestions(text);
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
          fetchSuggestions(text);
        }}
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <Text style={styles.item}>{item.name}</Text>
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
