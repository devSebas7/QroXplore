import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  PanResponder,
  Animated
} from 'react-native';
import { fetchLugares } from '../api';
import { PlacesContext } from '../context/PlacesContext';

const categories = ['Museo', 'Templo', 'Restaurante'];

const LocationSearchScreen = ({ navigation }) => {
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeInput, setActiveInput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggingIndex, setDraggingIndex] = useState(null);
  
  const { 
    selectedCategories, 
    setSelectedCategories,
    setOrigin,
    setDestination 
  } = useContext(PlacesContext);

  // Animación para el arrastre
  const pan = useState(new Animated.ValueXY())[0];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { 
        useNativeDriver: false,
        listener: (evt, gestureState) => {
          // Limitar el movimiento vertical para mejor experiencia
          const newY = Math.max(-100, Math.min(100, gestureState.dy));
          pan.y.setValue(newY);
        }
      }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
      setDraggingIndex(null);
    },
    onPanResponderTerminate: () => {
      pan.flattenOffset();
      setDraggingIndex(null);
    }
  });

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const lugares = await fetchLugares();
        setAllLocations(lugares);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  const filterSuggestions = (text) => {
    const filtered = allLocations.filter(
      (item) => item.Nombre && item.Nombre.toLowerCase().includes(text.toLowerCase())
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

  const handleCategoryPress = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    // Aquí puedes implementar la lógica para reordenar las categorías
    // basado en la posición final del elemento arrastrado
    setDraggingIndex(null);
    pan.setValue({ x: 0, y: 0 });
  };

  const goToMap = () => {
    if (!selectedOrigin || !selectedDestination) {
      alert('Selecciona tanto el origen como el destino');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Selecciona al menos una categoría');
      return;
    }

    setOrigin(selectedOrigin);
    setDestination(selectedDestination);

    navigation.navigate('MapScreen', {
      origin: {
        latitude: parseFloat(selectedOrigin.Latitud),
        longitude: parseFloat(selectedOrigin.Longitud),
        name: selectedOrigin.Nombre,
        Latitud: selectedOrigin.Latitud,
        Longitud: selectedOrigin.Longitud
      },
      destination: {
        latitude: parseFloat(selectedDestination.Latitud),
        longitude: parseFloat(selectedDestination.Longitud),
        name: selectedDestination.Nombre,
        Latitud: selectedDestination.Latitud,
        Longitud: selectedDestination.Longitud
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sección de Búsqueda */}
      <View style={styles.searchSection}>
        <Text style={styles.label}>Origen</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar origen..."
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
          placeholder="Buscar destino..."
          value={destinationQuery}
          onChangeText={(text) => {
            setDestinationQuery(text);
            setActiveInput('destination');
            filterSuggestions(text);
          }}
        />

        {/* Lista de sugerencias */}
        <View style={styles.suggestionsList}>
          {suggestions.map((item) => (
            <TouchableOpacity 
              key={item.id.toString()}
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemText}>{item.Nombre}</Text>
              <Text style={styles.itemSubtext}>{item.Categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selector de Categorías con Ordenamiento */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Orden de visita (arrastra para reordenar):</Text>
        
        <View style={styles.orderedCategories}>
          {selectedCategories.map((category, index) => (
            <Animated.View
              key={`${category}-${index}`}
              {...(draggingIndex === index ? panResponder.panHandlers : {})}
              style={[
                styles.categoryItem,
                { 
                  transform: [
                    { translateY: draggingIndex === index ? pan.y : 0 },
                    { scale: draggingIndex === index ? 1.05 : 1 }
                  ],
                  zIndex: draggingIndex === index ? 1 : 0,
                  opacity: draggingIndex === index ? 0.9 : 1
                }
              ]}
              onTouchStart={() => handleDragStart(index)}
              onTouchEnd={handleDragEnd}
            >
              <Text style={styles.orderNumber}>{index + 1}</Text>
              <Text style={styles.categoryText}>{category}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionSubtitle}>Categorías disponibles:</Text>
        <View style={styles.availableCategories}>
          {categories
            .filter(c => !selectedCategories.includes(c))
            .map(category => (
              <TouchableOpacity
                key={category}
                style={styles.availableCategory}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.availableCategoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button, 
          (!selectedOrigin || !selectedDestination || selectedCategories.length === 0) && styles.disabledButton
        ]}
        onPress={goToMap}
        disabled={!selectedOrigin || !selectedDestination || selectedCategories.length === 0}
      >
        <Text style={styles.buttonText}>Ver Ruta en Mapa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderedCategories: {
    minHeight: 120,
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    elevation: 3,
    width: '100%',
  },
  availableCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availableCategory: {
    padding: 12,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  availableCategoryText: {
    color: '#333',
  },
  orderNumber: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  categoryText: {
    color: 'white',
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  removeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSearchScreen;