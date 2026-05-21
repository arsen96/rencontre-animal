import { User } from '../interfaces/user.interface';
import { MOCK_ANIMALS } from './mock-animals.data';

/** Utilisateurs fictifs pour démo / référence */
export const MOCK_USERS: User[] = [
  {
    id: 'demo-1',
    displayName: 'Jungle Explorer',
    age: 28,
    gender: 'femelle',
    meetPreference: 'tout',
    birthDate: '1997-05-15',
    animal: MOCK_ANIMALS[0],
    profile: {
      movies: ['Avatar', 'Jurassic Park'],
      songs: ['Jungle', 'Roar'],
      eyeColor: 'Verts',
      hairColor: 'Bruns',
      height: 172,
    },
  },
];
