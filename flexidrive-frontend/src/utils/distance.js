/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 * @param {number} lat1 - Latitude of origin
 * @param {number} lon1 - Longitude of origin
 * @param {number} lat2 - Latitude of destination
 * @param {number} lon2 - Longitude of destination
 * @returns {number|null} Distance in km (rounded to 1 decimal place), or null if invalid coordinates
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  
  return Math.round(d * 10) / 10;
}
