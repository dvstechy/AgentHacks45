/**
 * Geospatial utilities for distance calculations and coordinate operations
 */

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Finds the nearest warehouse within a given radius
 * @param sourceWarehouse Source warehouse (donor)
 * @param nearbyWarehouses List of candidate warehouses
 * @param maxRadiusKm Maximum search radius in kilometers
 * @returns Nearest warehouse within radius, or null if none found
 */
export function findNearestWarehouse(
  sourceWarehouse: { latitude: number | null; longitude: number | null },
  nearbyWarehouses: Array<{
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
  }>,
  maxRadiusKm: number = 15
) {
  if (
    !sourceWarehouse.latitude ||
    !sourceWarehouse.longitude ||
    nearbyWarehouses.length === 0
  ) {
    return null;
  }

  let nearest = null;
  let minDistance = maxRadiusKm;

  for (const warehouse of nearbyWarehouses) {
    if (!warehouse.latitude || !warehouse.longitude) continue;

    const distance = haversineDistance(
      sourceWarehouse.latitude,
      sourceWarehouse.longitude,
      warehouse.latitude,
      warehouse.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...warehouse, distance };
    }
  }

  return nearest;
}

/**
 * Calculates bounding box around a point
 * @param lat Center latitude
 * @param lon Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Object with minLat, maxLat, minLon, maxLon
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number = 15
) {
  const latChange = radiusKm / 111; // Rough approximation: 1 degree latitude ≈ 111 km
  const lonChange = radiusKm / (111 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLon: lon - lonChange,
    maxLon: lon + lonChange,
  };
}

/**
 * Validates coordinates are within valid ranges
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
