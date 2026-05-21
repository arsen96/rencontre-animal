import { Injectable } from '@angular/core';
import { MOCK_ANIMALS } from '../data/mock-animals.data';
import { MOCK_DISCOVERY_PROFILES } from '../data/mock-profiles.data';
import { MOCK_USERS } from '../data/mock-users.data';
import { Animal } from '../interfaces/animal.interface';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  getAnimals(): Animal[] {
    return [...MOCK_ANIMALS];
  }

  getDiscoveryProfiles(): User[] {
    return [...MOCK_DISCOVERY_PROFILES];
  }

  getMockUsers(): User[] {
    return [...MOCK_USERS];
  }

  getAnimalById(id: string): Animal | undefined {
    return MOCK_ANIMALS.find((a) => a.id === id);
  }
}
