import { Animal } from '../interfaces/animal.interface';

const cardGradient = (accent: string) =>
  `radial-gradient(ellipse 70% 50% at 50% 35%, ${accent} 0%, transparent 55%), linear-gradient(180deg, #102018 0%, #0B0B0B 100%)`;

export const MOCK_ANIMALS: Animal[] = [
  {
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    imageUrl: 'assets/animals/lion.jpg',
    personality: 'Leader, protecteur',
    traits: ['Charismatique', 'Loyal', 'Courageux'],
    gradient: cardGradient('rgba(200, 169, 107, 0.12)'),
  },
  {
    id: 'renard',
    name: 'Renard',
    emoji: '🦊',
    imageUrl: 'assets/animals/renard.jpg',
    personality: 'Intelligent, charmeur',
    traits: ['Rusé', 'Spirituel', 'Séducteur'],
    gradient: cardGradient('rgba(200, 120, 60, 0.1)'),
  },
  {
    id: 'chat',
    name: 'Chat',
    emoji: '🐱',
    imageUrl: 'assets/animals/chat.jpg',
    personality: 'Indépendant, joueur',
    traits: ['Curieux', 'Mystérieux', 'Affectueux'],
    gradient: cardGradient('rgba(160, 180, 200, 0.08)'),
  },
  {
    id: 'loup',
    name: 'Loup',
    emoji: '🐺',
    imageUrl: 'assets/animals/loup.jpg',
    personality: 'Loyal, instinctif',
    traits: ['Protecteur', 'Passionné', 'Sauvage'],
    gradient: cardGradient('rgba(120, 140, 160, 0.1)'),
  },
  {
    id: 'singe',
    name: 'Singe',
    emoji: '🐒',
    imageUrl: 'assets/animals/singe.jpg',
    personality: 'Joueur, malicieux',
    traits: ['Espiègle', 'Social', 'Curieux'],
    gradient: cardGradient('rgba(166, 124, 82, 0.1)'),
  },
  {
    id: 'paon',
    name: 'Paon',
    emoji: '🦚',
    imageUrl: 'assets/animals/paon.jpg',
    personality: 'Élégant, expressif',
    traits: ['Créatif', 'Fier', 'Envoûtant'],
    gradient: cardGradient('rgba(45, 122, 110, 0.12)'),
  },
];
