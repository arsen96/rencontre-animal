import { Animal } from '../interfaces/animal.interface';

export const MOCK_ANIMALS: Animal[] = [
  {
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    personality: 'Leader, protecteur',
    traits: ['Charismatique', 'Loyal', 'Courageux'],
    gradient: 'linear-gradient(135deg, #c9a227 0%, #8b6914 50%, #5c4033 100%)',
  },
  {
    id: 'renard',
    name: 'Renard',
    emoji: '🦊',
    personality: 'Intelligent, charmeur',
    traits: ['Rusé', 'Spirituel', 'Séducteur'],
    gradient: 'linear-gradient(135deg, #e87d3e 0%, #c45a28 50%, #5c4033 100%)',
  },
  {
    id: 'chat',
    name: 'Chat',
    emoji: '🐱',
    personality: 'Indépendant, joueur',
    traits: ['Curieux', 'Mystérieux', 'Affectueux'],
    gradient: 'linear-gradient(135deg, #a8b5c4 0%, #6b7d8f 50%, #3d5a45 100%)',
  },
  {
    id: 'loup',
    name: 'Loup',
    emoji: '🐺',
    personality: 'Loyal, instinctif',
    traits: ['Protecteur', 'Passionné', 'Sauvage'],
    gradient: 'linear-gradient(135deg, #7a8a99 0%, #4a5568 50%, #2d3748 100%)',
  },
  {
    id: 'ours',
    name: 'Ours',
    emoji: '🐻',
    personality: 'Chaleureux, rassurant',
    traits: ['Généreux', 'Calme', 'Protecteur'],
    gradient: 'linear-gradient(135deg, #8b6914 0%, #5c4033 50%, #3e2a22 100%)',
  },
  {
    id: 'paon',
    name: 'Paon',
    emoji: '🦚',
    personality: 'Élégant, expressif',
    traits: ['Créatif', 'Fier', 'Envoûtant'],
    gradient: 'linear-gradient(135deg, #2d7a6e 0%, #1a5c4a 40%, #c9a227 100%)',
  },
];
