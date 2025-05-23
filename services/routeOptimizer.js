// routeOptimizer.js
export const optimizeRoute = async (origin, destination, categoriesOrder, allLocations) => {
  try {
    // 1. Filtrar lugares por categorías seleccionadas
    const categoryNames = categoriesOrder.map(cat => cat.toLowerCase());
    const relevantPlaces = allLocations.filter(place => 
      categoryNames.includes(place.Categoria.toLowerCase())
    );

    if (relevantPlaces.length === 0) {
      throw new Error("No hay lugares para las categorías seleccionadas.");
    }

    // 2. Si el usuario definió un orden, usarlo directamente
    if (categoriesOrder && categoriesOrder.length > 0) {
      const orderedPlaces = [];
      for (const category of categoriesOrder) {
        const placesInCategory = relevantPlaces.filter(
          place => place.Categoria.toLowerCase() === category.toLowerCase()
        );
        if (placesInCategory.length > 0) {
          // Tomar el primer lugar de cada categoría (puedes ajustar esto)
          orderedPlaces.push(placesInCategory[0]);
        }
      }

      // 3. Calcular ruta: Origen -> Lugares ordenados -> Destino
      return [origin, ...orderedPlaces, destination];
    }

    // 4. Si no hay orden definido, aplicar algoritmo de optimización (TSP simplificado)
    return applyTSPAlgorithm(origin, destination, relevantPlaces);

  } catch (error) {
    console.error("Error en optimizeRoute:", error);
    throw error;
  }
};

// Algoritmo de optimización (Vecino más cercano)
const applyTSPAlgorithm = (origin, destination, places) => {
  const route = [origin];
  let remainingPlaces = [...places];

  // Convertir a coordenadas numéricas
  const toCoords = (place) => ({
    lat: typeof place.Latitud === 'string' ? parseFloat(place.Latitud) : place.Latitud,
    lng: typeof place.Longitud === 'string' ? parseFloat(place.Longitud) : place.Longitud,
  });

  // Encontrar el punto más cercano en cada iteración
  while (remainingPlaces.length > 0) {
    const lastPoint = toCoords(route[route.length - 1]);
    let closestIndex = 0;
    let minDistance = Infinity;

    remainingPlaces.forEach((place, index) => {
      const coords = toCoords(place);
      const dist = haversineDistance(lastPoint, coords);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    route.push(remainingPlaces[closestIndex]);
    remainingPlaces.splice(closestIndex, 1);
  }

  // Agregar el destino al final
  route.push(destination);
  return route;
};

// Cálculo de distancia entre dos puntos (Haversine)
const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
    Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};