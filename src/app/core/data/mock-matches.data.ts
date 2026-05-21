import { Match } from '../interfaces/match.interface';
import { MOCK_DISCOVERY_PROFILES } from './mock-profiles.data';

/** Matchs fictifs pour référence / extensions futures */
export const MOCK_MATCHES: Match[] = [
  {
    id: 'demo-match-1',
    matchedAt: new Date('2026-05-01'),
    user: MOCK_DISCOVERY_PROFILES[0],
    isNew: false,
  },
];
