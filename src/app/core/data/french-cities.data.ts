export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Coordonnées approximatives des principales villes françaises (clé normalisée). */
export const FRENCH_CITY_COORDS: Record<string, GeoPoint> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.764, lng: 4.8357 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  reims: { lat: 49.2583, lng: 4.0317 },
  toulon: { lat: 43.1242, lng: 5.928 },
  'saint-etienne': { lat: 45.4397, lng: 4.3872 },
  'le-havre': { lat: 49.4944, lng: 0.1079 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  dijon: { lat: 47.322, lng: 5.0415 },
  angers: { lat: 47.4784, lng: -0.5632 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  villeurbanne: { lat: 45.766, lng: 4.8795 },
  'clermont-ferrand': { lat: 45.7772, lng: 3.087 },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474 },
  brest: { lat: 48.3905, lng: -4.4861 },
  tours: { lat: 47.3941, lng: 0.6848 },
  amiens: { lat: 49.8941, lng: 2.2958 },
  limoges: { lat: 45.8336, lng: 1.2611 },
  annecy: { lat: 45.8992, lng: 6.1294 },
  perpignan: { lat: 42.6886, lng: 2.8948 },
  metz: { lat: 49.1193, lng: 6.1757 },
  besancon: { lat: 47.2378, lng: 6.0241 },
  orleans: { lat: 47.9029, lng: 1.9093 },
  rouen: { lat: 49.4432, lng: 1.0993 },
  mulhouse: { lat: 47.7508, lng: 7.3359 },
  caen: { lat: 49.1829, lng: -0.3707 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  argenteuil: { lat: 48.9472, lng: 2.2467 },
  montreuil: { lat: 48.8618, lng: 2.444 },
  avignon: { lat: 43.9493, lng: 4.8055 },
  poitiers: { lat: 46.5802, lng: 0.3404 },
  dunkerque: { lat: 51.0343, lng: 2.3773 },
  versailles: { lat: 48.8014, lng: 2.1301 },
  pau: { lat: 43.2951, lng: -0.3708 },
  'la-rochelle': { lat: 46.1603, lng: -1.1511 },
  antibes: { lat: 43.5804, lng: 7.1251 },
  cannes: { lat: 43.5528, lng: 7.0174 },
  ajaccio: { lat: 41.9192, lng: 8.7386 },
  bastia: { lat: 42.6976, lng: 9.4509 },
};

const CITY_LABEL_OVERRIDES: Record<string, string> = {
  'le-havre': 'Le Havre',
  'saint-etienne': 'Saint-Étienne',
  'clermont-ferrand': 'Clermont-Ferrand',
  'aix-en-provence': 'Aix-en-Provence',
  'la-rochelle': 'La Rochelle',
};

export function formatFrenchCityLabel(key: string): string {
  if (CITY_LABEL_OVERRIDES[key]) {
    return CITY_LABEL_OVERRIDES[key];
  }

  return key
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}

export const FRENCH_CITY_OPTIONS = Object.keys(FRENCH_CITY_COORDS)
  .map((key) => formatFrenchCityLabel(key))
  .sort((a, b) => a.localeCompare(b, 'fr'));
