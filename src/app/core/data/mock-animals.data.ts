import animalSeeds from './animal-seeds.json';
import { Animal } from '../interfaces/animal.interface';
import { animalFromSeed } from '../utils/animal.utils';

export const MOCK_ANIMALS: Animal[] = (animalSeeds as Parameters<typeof animalFromSeed>[0][]).map(
  animalFromSeed
);
