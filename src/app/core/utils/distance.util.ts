import { FRENCH_CITY_COORDS, GeoPoint } from '../data/french-cities.data';
import { User } from '../interfaces/user.interface';

export function normalizeCityKey(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function resolveCityCoordinates(city: string): GeoPoint | null {
  const key = normalizeCityKey(city);
  if (!key) {
    return null;
  }

  if (FRENCH_CITY_COORDS[key]) {
    return FRENCH_CITY_COORDS[key];
  }

  for (const [cityKey, coords] of Object.entries(FRENCH_CITY_COORDS)) {
    if (key.includes(cityKey) || cityKey.includes(key)) {
      return coords;
    }
  }

  return null;
}

export function getUserCoordinates(user: User): GeoPoint | null {
  if (user.location?.lat != null && user.location?.lng != null) {
    return user.location;
  }

  if (user.city?.trim()) {
    return resolveCityCoordinates(user.city);
  }

  return null;
}

export function getDistanceKmBetween(from: GeoPoint, to: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c);
}

export function computeDistanceBetweenUsers(
  from: User,
  to: User
): number | null {
  const fromCoords = getUserCoordinates(from);
  const toCoords = getUserCoordinates(to);

  if (!fromCoords || !toCoords) {
    return null;
  }

  return getDistanceKmBetween(fromCoords, toCoords);
}

export function withDistanceFrom(current: User, other: User): User {
  const distanceKm = computeDistanceBetweenUsers(current, other);
  if (distanceKm === null) {
    return other;
  }

  return { ...other, distanceKm };
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return null;
  }

  return `${distanceKm} km`;
}

/** Paliers de découverte : d'abord proche, puis on élargit progressivement. */
export const DISCOVERY_DISTANCE_TIERS_KM = [50, 150, 500, Infinity] as const;

export function getDiscoveryTierIndex(distanceKm: number | null | undefined): number {
  if (distanceKm == null) {
    return DISCOVERY_DISTANCE_TIERS_KM.length - 1;
  }
  if (distanceKm <= DISCOVERY_DISTANCE_TIERS_KM[0]) {
    return 0;
  }
  if (distanceKm <= DISCOVERY_DISTANCE_TIERS_KM[1]) {
    return 1;
  }
  if (distanceKm <= DISCOVERY_DISTANCE_TIERS_KM[2]) {
    return 2;
  }
  return DISCOVERY_DISTANCE_TIERS_KM.length - 1;
}

export function getDiscoveryTierLabel(tierIndex: number): string | null {
  if (tierIndex <= 0) {
    return null;
  }

  const limit = DISCOVERY_DISTANCE_TIERS_KM[tierIndex];
  if (limit === Infinity) {
    return 'Recherche élargie — toute la France';
  }

  return `Recherche élargie — jusqu'à ${limit} km`;
}

export function sortUsersByDistance(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const aDist = a.distanceKm;
    const bDist = b.distanceKm;

    if (aDist == null && bDist == null) {
      return 0;
    }
    if (aDist == null) {
      return 1;
    }
    if (bDist == null) {
      return -1;
    }

    return aDist - bDist;
  });
}
