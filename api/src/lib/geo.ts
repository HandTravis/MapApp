export interface Point {
  lat: number;
  lng: number;
}

export interface NearbyPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance_m: number;
}

export function toPoint(lat: number, lng: number): string {
  return `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
}

export function validateCoordinates(lat: number, lng: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
}

export function parseNearParameter(near: string): { lat: number; lng: number } {
  const parts = near.split(',');
  if (parts.length !== 2) {
    throw new Error('Near parameter must be in format "lat,lng"');
  }
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates in near parameter');
  }
  
  validateCoordinates(lat, lng);
  
  return { lat, lng };
}
