import React, { createContext, useState, useEffect } from 'react';
import { fetchLugares } from '../api';
import { optimizeRoute } from '../services/routeOptimizer'; // Asegúrate de que la ruta sea correcta

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de lugares
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const places = await fetchLugares();
        setAllPlaces(places);
      } catch (err) {
        setError("Error cargando lugares. Intenta más tarde.");
        console.error('Error en loadPlaces:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlaces();
  }, []);

  // Función principal para generar rutas
  const generateRoute = async () => {
    if (!origin || !destination) {
      setError("Selecciona origen y destino primero");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Selecciona al menos una categoría");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const route = await optimizeRoute(
        origin,
        destination,
        selectedCategories, // Orden definido por el usuario
        allPlaces
      );

      if (!route || route.length === 0) {
        throw new Error("No se pudo generar una ruta válida");
      }

      setOptimizedRoute(route);
      return route;
    } catch (err) {
      setError(err.message || "Error generando ruta optimizada");
      console.error("Error en generateRoute:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear el estado
  const resetRoute = () => {
    setOptimizedRoute([]);
    setError(null);
  };

  return (
    <PlacesContext.Provider
      value={{
        origin,
        setOrigin,
        destination,
        setDestination,
        selectedCategories,
        setSelectedCategories,
        allPlaces,
        optimizedRoute,
        generateRoute,
        isLoading,
        error,
        resetRoute
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};