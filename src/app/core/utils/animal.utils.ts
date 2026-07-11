import { Animal } from '../interfaces/animal.interface';

export interface AnimalSeed {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  personality: string;
  description: string;
  traits: string[];
  accent: string;
  active?: boolean;
  sortOrder?: number;
  nameEn?: string;
  personalityEn?: string;
  descriptionEn?: string;
  traitsEn?: string[];
}

export type AnimalLang = 'fr' | 'en';

export const cardGradient = (accent: string): string =>
  `radial-gradient(ellipse 70% 50% at 50% 35%, ${accent} 0%, transparent 55%), linear-gradient(180deg, #102018 0%, #0B0B0B 100%)`;

export const animalFromSeed = (seed: AnimalSeed, lang: AnimalLang = 'fr'): Animal => {
  const useEn = lang === 'en';
  return {
    id: seed.id,
    name: useEn ? seed.nameEn ?? seed.name : seed.name,
    emoji: seed.emoji,
    imageUrl: seed.imageUrl,
    personality: useEn ? seed.personalityEn ?? seed.personality : seed.personality,
    description: useEn ? seed.descriptionEn ?? seed.description : seed.description,
    traits: useEn ? seed.traitsEn ?? seed.traits : seed.traits,
    gradient: cardGradient(seed.accent),
  };
};
