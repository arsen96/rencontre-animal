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
}

export const cardGradient = (accent: string): string =>
  `radial-gradient(ellipse 70% 50% at 50% 35%, ${accent} 0%, transparent 55%), linear-gradient(180deg, #102018 0%, #0B0B0B 100%)`;

export const animalFromSeed = (seed: AnimalSeed): Animal => ({
  id: seed.id,
  name: seed.name,
  emoji: seed.emoji,
  imageUrl: seed.imageUrl,
  personality: seed.personality,
  description: seed.description,
  traits: seed.traits,
  gradient: cardGradient(seed.accent),
});
