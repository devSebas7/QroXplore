// routeOptimizer.js
import axios from 'axios';

// Función para validar y formatear coordenadas
const sanitizeCoordinate = (coord) => {
  if (coord === null || coord === undefined) return null;
  
  // Convertir a número si es string
  const num = typeof coord === 'string' 
    ? parseFloat(coord.replace(',', '.')) 
    : Number(coord);
  
  // Verificar si es un número válido
  if (isNaN(num)) {
    console.warn('Coordenada no es un número válido:', coord);
    return null;
  }
  
  return num;
};

// Función para validar un punto geográfico
const validateLocation = (location) => {
  if (!location) return false;
  
  const lat = sanitizeCoordinate(location.latitude || location.Latitud);
  const lng = sanitizeCoordinate(location.longitude || location.Longitud);
  
  if (lat === null || lng === null) return false;
  
  // Validar rangos aproximados para Querétaro
  const validLat = lat >= 20.4 && lat <= 20.7;
  const validLng = lng >= -100.5 && lng <= -100.3;
  
  if (!validLat || !validLng) {
    console.warn('Coordenadas fuera de rango:', { lat, lng });
    return false;
  }
  
  return { latitude: lat, longitude: lng };
};

export const optimizeRoute = async (origin, destination, categoriesOrder, allLocations) => {
  try {
    // Validar origen y destino
    const validOrigin = validateLocation(origin);
    const validDestination = validateLocation(destination);
    
    if (!validOrigin || !validDestination) {
      throw new Error("Coordenadas de origen o destino inválidas");
    }

    // 1. Filtrar lugares por categorías seleccionadas
    const categoryNames = categoriesOrder.map(cat => cat.toLowerCase());
    const relevantPlaces = allLocations
      .map(place => ({
        ...place,
        ...validateLocation(place)
      }))
      .filter(place => 
        place.latitude && 
        place.longitude && 
        categoryNames.includes(place.Categoria.toLowerCase())
      );

    if (relevantPlaces.length === 0) {
      throw new Error("No hay lugares válidos para las categorías seleccionadas.");
    }

    // 2. Obtener waypoints según el orden de categorías o TSP
    const waypoints = categoriesOrder && categoriesOrder.length > 0
      ? getOrderedWaypoints(categoriesOrder, relevantPlaces)
      : applyTSPAlgorithm(validOrigin, validDestination, relevantPlaces);

    console.log('Waypoints a enviar:', waypoints.map(w => ({
      name: w.Nombre,
      lat: w.latitude,
      lng: w.longitude
    })));

    // 3. Obtener ruta peatonal de Google Maps
    const directions = await getWalkingDirections(
      validOrigin, 
      validDestination, 
      waypoints,
      !!categoriesOrder?.length
    );
    
    return {
      waypoints: waypoints,
      polyline: directions.routes[0].overview_polyline.points,
      legs: directions.routes[0].legs,
      orderedCategories: categoriesOrder
    };

  } catch (error) {
    console.error("Error detallado en optimizeRoute:", {
      error: error.message,
      origin,
      destination,
      categoriesOrder,
      allLocationsCount: allLocations.length
    });
    throw error;
  }
};

// Función para mantener el orden de categorías
const getOrderedWaypoints = (categoriesOrder, relevantPlaces) => {
  const orderedPlaces = [];
  
  for (const category of categoriesOrder) {
    const placesInCategory = relevantPlaces.filter(
      place => place.Categoria.toLowerCase() === category.toLowerCase()
    );
    
    if (placesInCategory.length > 0) {
      const validPlace = placesInCategory.find(p => p.latitude && p.longitude);
      if (validPlace) {
        orderedPlaces.push(validPlace);
      }
    }
  }
  
  if (orderedPlaces.length === 0) {
    throw new Error("No se encontraron waypoints válidos después del filtrado");
  }
  
  return orderedPlaces;
};

// Obtener direcciones peatonales de Google Maps
const getWalkingDirections = async (origin, destination, waypoints, hasCustomOrder) => {
  try {
    // Filtrar waypoints válidos
    const validWaypoints = waypoints
      .filter(wp => wp.latitude && wp.longitude)
      .map(wp => `${wp.latitude},${wp.longitude}`);
    
    const params = {
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: 'walking',
      key: 'AIzaSyDQI2O5wMO_b_w9Z9yfH1vMxY1czhXrRxQ', // ¡Usa una key válida!
    };

    // Solo agregar waypoints si existen y son válidos
    if (validWaypoints.length > 0) {
      params.waypoints = hasCustomOrder 
        ? validWaypoints.join('|') 
        : `optimize:true|${validWaypoints.join('|')}`;
    }

    console.log('Solicitando ruta con parámetros:', params);

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json', 
      { 
        params,
        timeout: 10000 // 10 segundos timeout
      }
    );

    if (response.data.status !== 'OK') {
      console.error('Respuesta de la API:', response.data);
      throw new Error(`API Error: ${response.data.status} - ${response.data.error_message || ''}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error en getWalkingDirections:', {
      error: error.message,
      origin,
      destination,
      waypoints: waypoints.map(w => `${w.latitude},${w.longitude}`)
    });
    throw error;
  }
};

// Algoritmo de optimización (Vecino más cercano)
const applyTSPAlgorithm = (origin, destination, places) => {
  const route = [origin];
  let remainingPlaces = places.filter(p => p.latitude && p.longitude);

  console.log('Aplicando TSP a:', remainingPlaces.length, 'lugares válidos');

  while (remainingPlaces.length > 0) {
    const lastPoint = route[route.length - 1];
    let closestIndex = 0;
    let minDistance = Infinity;

    remainingPlaces.forEach((place, index) => {
      const dist = haversineDistance(lastPoint, place);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    route.push(remainingPlaces[closestIndex]);
    remainingPlaces.splice(closestIndex, 1);
  }

  route.push(destination);
  return route;
};

// Cálculo de distancia entre dos puntos (Haversine)
const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * (Math.PI / 180)) *
    Math.cos(coord2.latitude * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
