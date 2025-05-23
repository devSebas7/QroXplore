// /src/screens/RouteScreen.js
import { Button } from 'react-native';
import { useContext } from 'react';
import { PlacesContext } from '../context/PlacesContext';

const RouteScreen = () => {
  const { 
    origin, 
    destination, 
    selectedCategories, 
    optimizedRoute, 
    generateRoute 
  } = useContext(PlacesContext);

  const handleGenerateRoute = () => {
    if (!origin || !destination) {
      alert("Selecciona origen y destino primero");
      return;
    }
    generateRoute();
  };

  return (
    <View>
      <Button 
        title="Generar Ruta Optimizada" 
        onPress={handleGenerateRoute} 
      />

      {optimizedRoute.length > 0 && (
        <Text>Ruta generada con {optimizedRoute.length - 2} paradas</Text>
      )}
    </View>
  );
};