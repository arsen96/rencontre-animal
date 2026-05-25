import { Animal } from '../interfaces/animal.interface';

const cardGradient = (accent: string) =>
  `radial-gradient(ellipse 70% 50% at 50% 35%, ${accent} 0%, transparent 55%), linear-gradient(180deg, #102018 0%, #0B0B0B 100%)`;

type AnimalSeed = Omit<Animal, 'gradient'> & { accent: string };

const createAnimal = ({ accent, ...animal }: AnimalSeed): Animal => ({
  ...animal,
  gradient: cardGradient(accent),
});

export const MOCK_ANIMALS: Animal[] = [
  createAnimal({
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    imageUrl: 'assets/animals/lion.jpg',
    personality: 'Courageux, honnête',
    description:
      "Le lion a une bonne opinion de lui-même et peut parfois montrer un léger orgueil face aux critiques. Pourtant, il reste courageux et honnête : il respecte les plus faibles et n'hésite pas à les défendre. Il aime les personnalités intègres et ne supporte ni la mesquinerie, ni les faux-semblants.",
    traits: ['Courageux', 'Protecteur', 'Intègre'],
    accent: 'rgba(200, 169, 107, 0.14)',
  }),
  createAnimal({
    id: 'ours',
    name: 'Ours',
    emoji: '🐻',
    personality: 'Calme, indépendant',
    description:
      "L'ours est un solitaire fier qui préfère la tranquillité à l'agitation. Patient et calme, il sait pourtant imposer le respect par sa force lorsqu'il est provoqué. Attaché à ses habitudes, loyal envers ceux qu'il respecte, il cache sous son apparence bourrue une nature sensible qui apprécie les plaisirs simples.",
    traits: ['Indépendant', 'Loyal', 'Patient'],
    accent: 'rgba(145, 104, 72, 0.14)',
  }),
  createAnimal({
    id: 'cordeau',
    name: 'Cordeau',
    emoji: '🪢',
    personality: 'Méthodique, précis',
    description:
      "Le cordeau est méthodique et rigoureux, attaché à l'ordre et à la clarté. Il ne laisse rien au hasard et sert souvent de repère à ceux qui l'entourent. Derrière sa discipline se cache pourtant une vraie souplesse : il sait s'adapter aux contours du monde sans jamais perdre son cap.",
    traits: ['Précis', 'Fiable', 'Rigoureux'],
    accent: 'rgba(194, 154, 102, 0.12)',
  }),
  createAnimal({
    id: 'renard',
    name: 'Renard',
    emoji: '🦊',
    imageUrl: 'assets/animals/renard.jpg',
    personality: 'Vif, mystérieux',
    description:
      "Le renard est un esprit discret et observateur, préférant l'intelligence à la force brute. Curieux, il capte les moindres détails et anticipe avec précision les mouvements des autres. Son charme ouvre des portes, mais il garde toujours une part de mystère et n'accorde sa confiance qu'avec prudence.",
    traits: ['Rusé', 'Observateur', 'Stratège'],
    accent: 'rgba(200, 120, 60, 0.12)',
  }),
  createAnimal({
    id: 'dauphin',
    name: 'Dauphin',
    emoji: '🐬',
    personality: 'Libre, joyeux',
    description:
      "Le dauphin est porté par la curiosité, la connexion et la joie de vivre. Sociable et joueur, il diffuse la bonne humeur tout en gardant une grande sensibilité. Intelligent et intuitif, il apaise les tensions sans conflit et reste fidèle à ceux qu'il aime.",
    traits: ['Sociable', 'Intuitif', 'Joueur'],
    accent: 'rgba(111, 162, 204, 0.12)',
  }),
  createAnimal({
    id: 'hyene',
    name: 'Hyène',
    emoji: '🐾',
    personality: 'Rusée, résistante',
    description:
      "La hyène est une survivante au regard acéré et à la volonté farouche. Observatrice et stratégique, elle sait attendre, s'adapter et frapper au bon moment. Solidaire avec les siens, elle avance malgré les jugements avec une intelligence brute et une force silencieuse.",
    traits: ['Résistante', 'Stratégique', 'Loyale'],
    accent: 'rgba(143, 124, 88, 0.13)',
  }),
  createAnimal({
    id: 'souris',
    name: 'Souris',
    emoji: '🐭',
    personality: 'Discrète, vive',
    description:
      "La souris évolue dans l'ombre, attentive à tout ce qui se passe autour d'elle. Petite mais rapide, elle se faufile là où d'autres échouent grâce à son intelligence et à son instinct. Souvent sous-estimée, elle cache une détermination silencieuse et une fidélité profonde.",
    traits: ['Discrète', 'Vive', 'Déterminée'],
    accent: 'rgba(170, 170, 170, 0.1)',
  }),
  createAnimal({
    id: 'rat',
    name: 'Rat',
    emoji: '🐀',
    personality: 'Adaptable, rusé',
    description:
      "Le rat est un survivant né, capable de tirer parti de chaque situation. Intelligent et opportuniste, il observe, analyse puis agit avec une précision déconcertante. Fidèle à son clan et audacieux dans ses choix, il avance dans les coulisses avec une efficacité redoutable.",
    traits: ['Adaptable', 'Audacieux', 'Stratège'],
    accent: 'rgba(124, 134, 145, 0.11)',
  }),
  createAnimal({
    id: 'chien',
    name: 'Chien',
    emoji: '🐶',
    personality: 'Loyal, protecteur',
    description:
      "Le chien est un pilier affectueux sur lequel on peut toujours compter. Il veille sur ceux qu'il aime avec tendresse, écoute sans juger et ressent sans qu'on lui parle. Sa fidélité est sans faille, mais si l'on menace les siens, il devient un gardien redoutable.",
    traits: ['Loyal', 'Affectueux', 'Protecteur'],
    accent: 'rgba(192, 155, 111, 0.12)',
  }),
  createAnimal({
    id: 'chat',
    name: 'Chat',
    emoji: '🐱',
    imageUrl: 'assets/animals/chat.jpg',
    personality: 'Libre, intuitif',
    description:
      "Le chat ne se soumet pas : il choisit. Indépendant et élégant, il donne son affection à ceux qui la méritent et revient vers eux à sa manière. Son calme cache une grande intelligence émotionnelle, une sensibilité profonde et un goût marqué pour la douceur, le confort et la beauté.",
    traits: ['Libre', 'Mystérieux', 'Affectueux'],
    accent: 'rgba(160, 180, 200, 0.1)',
  }),
  createAnimal({
    id: 'leopard',
    name: 'Léopard',
    emoji: '🐆',
    personality: 'Silencieux, fier',
    description:
      "Le léopard avance seul, dans l'ombre, sans jamais chercher l'approbation. Agilité, précision et sang-froid font de lui un stratège naturel qui choisit soigneusement ses combats. Mystérieux et perçant, il inspire le respect sans avoir besoin de rugir.",
    traits: ['Silencieux', 'Précis', 'Fier'],
    accent: 'rgba(198, 156, 86, 0.12)',
  }),
  createAnimal({
    id: 'chimpanze',
    name: 'Chimpanzé',
    emoji: '🐵',
    imageUrl: 'assets/animals/singe.jpg',
    personality: 'Curieux, sociable',
    description:
      "Le chimpanzé est un esprit vif, joueur et toujours en mouvement. Très sociable, il vit dans la complicité, le rire et l'émotion, mais derrière son espièglerie se cache une grande lucidité. Il déteste l'injustice et puise sa force dans le lien, l'intelligence et le cœur.",
    traits: ['Curieux', 'Social', 'Expressif'],
    accent: 'rgba(166, 124, 82, 0.12)',
  }),
  createAnimal({
    id: 'manchot',
    name: 'Manchot',
    emoji: '🐧',
    personality: 'Solidaire, tendre',
    description:
      "Le manchot avance d'un pas parfois maladroit, mais toujours déterminé. Le groupe est sa force et la chaleur des autres son refuge, même au cœur des tempêtes. Sous son apparence comique se cache un courage silencieux, une fidélité rare et une profonde dignité.",
    traits: ['Solidaire', 'Résilient', 'Tendre'],
    accent: 'rgba(150, 170, 188, 0.11)',
  }),
  createAnimal({
    id: 'gorille',
    name: 'Gorille',
    emoji: '🦍',
    personality: 'Calme, protecteur',
    description:
      "Le gorille inspire le respect par sa seule présence. Sa force est immense, mais il préfère la sérénité à la confrontation et veille sur les siens avec une douceur surprenante. Pacifique, réfléchi et profondément loyal, il devient redoutable seulement lorsqu'on menace ce qu'il aime.",
    traits: ['Protecteur', 'Digne', 'Pacifique'],
    accent: 'rgba(117, 120, 128, 0.12)',
  }),
  createAnimal({
    id: 'crocodile',
    name: 'Crocodile',
    emoji: '🐊',
    personality: 'Implacable, maîtrisé',
    description:
      "Le crocodile choisit l'ombre, la discrétion et le bon moment. Calme en apparence, il cache une puissance fulgurante et une maîtrise remarquable de ses émotions. Stratège et fidèle à sa nature, il agit avec une précision froide lorsque l'instant est venu.",
    traits: ['Stratège', 'Maîtrisé', 'Puissant'],
    accent: 'rgba(86, 120, 84, 0.12)',
  }),
  createAnimal({
    id: 'paresseux',
    name: 'Paresseux',
    emoji: '🦥',
    personality: 'Paisible, sage',
    description:
      "Le paresseux avance à son rythme, sans se laisser emporter par le tumulte du monde. Sa lenteur est un choix, pas une faiblesse : il prend le temps d'observer, de ressentir et d'aller à l'essentiel. Beaucoup le jugent trop vite, mais ceux qui s'approchent découvrent une force douce, patiente et étonnamment solide.",
    traits: ['Paisible', 'Patient', 'Sage'],
    accent: 'rgba(122, 145, 103, 0.12)',
  }),
  createAnimal({
    id: 'hibou',
    name: 'Hibou',
    emoji: '🦉',
    personality: 'Lucide, sage',
    description:
      "Gardien de la nuit, le hibou voit ce que les autres ne perçoivent pas. Solitaire, il se sent chez lui dans le silence et préfère comprendre plutôt que briller. Quand il agit, c'est avec une précision tranquille, guidée par l'observation, la patience et la vérité.",
    traits: ['Lucide', 'Patient', 'Sage'],
    accent: 'rgba(138, 116, 88, 0.12)',
  }),
  createAnimal({
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    personality: 'Discret, harmonieux',
    description:
      "Le panda préfère les forêts calmes aux lieux bruyants et les routines simples aux excès. Derrière sa douceur apparente se cache une grande sensibilité, une force tranquille et une vraie justesse. Il choisit l'harmonie plutôt que la confrontation, sans jamais renoncer à se défendre si on le pousse trop loin.",
    traits: ['Calme', 'Sensible', 'Harmonieux'],
    accent: 'rgba(190, 190, 190, 0.1)',
  }),
  createAnimal({
    id: 'kangourou',
    name: 'Kangourou',
    emoji: '🦘',
    personality: 'Libre, protecteur',
    description:
      "Le kangourou est un être libre qui avance par bonds, guidé par son instinct et son besoin d'espace. Toujours en mouvement, il reste pourtant attentif à ceux qu'il protège. Sa vraie force est dans l'équilibre : rapide mais réfléchi, indépendant mais profondément fidèle.",
    traits: ['Libre', 'Énergique', 'Protecteur'],
    accent: 'rgba(173, 123, 79, 0.12)',
  }),
  createAnimal({
    id: 'tortue',
    name: 'Tortue',
    emoji: '🐢',
    personality: 'Patiente, stable',
    description:
      "La tortue avance lentement, mais sûrement, en donnant du sens à chacun de ses pas. Elle observe sans juger, se protège sans fuir et rappelle que la vraie solidité est souvent invisible. Sa force réside dans la patience, la simplicité et la sagesse du temps long.",
    traits: ['Patiente', 'Stable', 'Sage'],
    accent: 'rgba(96, 140, 98, 0.12)',
  }),
  createAnimal({
    id: 'elephant',
    name: 'Éléphant',
    emoji: '🐘',
    personality: 'Paisible, loyal',
    description:
      "L'éléphant impressionne par sa taille, mais choisit la douceur plutôt que l'abus de force. Il n'oublie ni les liens, ni les blessures, et avance avec une dignité tranquille. Loyal envers les siens, il protège le groupe avec fermeté et ne devient redoutable que lorsqu'on le provoque.",
    traits: ['Loyal', 'Sensible', 'Digne'],
    accent: 'rgba(132, 140, 153, 0.12)',
  }),
  createAnimal({
    id: 'sanglier',
    name: 'Sanglier',
    emoji: '🐗',
    personality: 'Authentique, curieux',
    description:
      "Le sanglier est proche de la terre et des choses vraies. Derrière son allure rustique se cache un esprit vif, sociable et plein de ressources. Il ne cherche pas à plaire, mais sait observer, comprendre vite et rester pleinement lui-même, sans masque ni honte.",
    traits: ['Curieux', 'Authentique', 'Solide'],
    accent: 'rgba(114, 83, 61, 0.13)',
  }),
  createAnimal({
    id: 'serpent',
    name: 'Serpent',
    emoji: '🐍',
    personality: 'Secret, maîtrisé',
    description:
      "Le serpent glisse silencieusement, fascine autant qu'il inquiète et ne choisit jamais ses mouvements au hasard. Sa force est dans l'écoute, la maîtrise de soi et le sens du bon moment. Discret mais immense dans son pouvoir, il incarne la transformation, le renouveau et la précision.",
    traits: ['Mystérieux', 'Maîtrisé', 'Transformateur'],
    accent: 'rgba(92, 132, 74, 0.12)',
  }),
  createAnimal({
    id: 'aigle',
    name: 'Aigle',
    emoji: '🦅',
    personality: 'Libre, visionnaire',
    description:
      "L'aigle vole haut, fier et indépendant, toujours en quête de nouvelles perspectives. Sa puissance ne tient pas seulement à ses serres, mais à sa capacité de voir loin et de choisir avec sagesse. Il incarne la liberté, l'audace et une noblesse tranquille.",
    traits: ['Visionnaire', 'Libre', 'Noble'],
    accent: 'rgba(176, 134, 72, 0.12)',
  }),
  createAnimal({
    id: 'buffle',
    name: 'Buffle',
    emoji: '🐃',
    personality: 'Stable, endurant',
    description:
      "Le buffle avance avec détermination, sans se laisser distraire par le tumulte. Patient et puissant, il supporte les difficultés sans perdre son calme et protège les siens avec constance. Sa force réside dans la persévérance, l'équilibre et le courage calme.",
    traits: ['Endurant', 'Stable', 'Courageux'],
    accent: 'rgba(119, 95, 72, 0.13)',
  }),
  createAnimal({
    id: 'chameau',
    name: 'Chameau',
    emoji: '🐫',
    personality: 'Patient, résistant',
    description:
      "Le chameau connaît la valeur des longues traversées et de la constance. Il supporte la chaleur, la sécheresse et les épreuves avec une maîtrise sereine. Sans chercher la vitesse, il va loin grâce à son endurance, sa sagesse et son calme intérieur.",
    traits: ['Résistant', 'Patient', 'Constant'],
    accent: 'rgba(191, 149, 91, 0.12)',
  }),
  createAnimal({
    id: 'loup',
    name: 'Loup',
    emoji: '🐺',
    imageUrl: 'assets/animals/loup.jpg',
    personality: 'Loyal, libre',
    description:
      "Le loup est à la fois sauvage et profondément social. Fier et indépendant, il sait pourtant que sa force vient aussi de la meute, de la loyauté et des liens solides. Intelligent et stratégique, il protège les siens avec passion sans jamais renoncer à sa liberté.",
    traits: ['Loyal', 'Stratégique', 'Libre'],
    accent: 'rgba(120, 140, 160, 0.12)',
  }),
  createAnimal({
    id: 'lapin',
    name: 'Lapin',
    emoji: '🐇',
    personality: 'Vif, prudent',
    description:
      "Le lapin est toujours aux aguets, sensible à la moindre menace. Sa rapidité est sa meilleure défense, mais sa vraie force tient aussi à sa sociabilité et à sa capacité d'adaptation. Il incarne la douceur qui reste vigilante, fragile en apparence, solide au fond.",
    traits: ['Prudent', 'Doux', 'Vif'],
    accent: 'rgba(220, 208, 194, 0.1)',
  }),
  createAnimal({
    id: 'perroquet',
    name: 'Perroquet',
    emoji: '🦜',
    personality: 'Vif, expressif',
    description:
      "Le perroquet déborde de vie, de curiosité et d'énergie communicative. Intelligent, il observe vite, apprend rapidement et adore partager ce qu'il découvre. Sa liberté d'expression, son humour et sa sensibilité en font une présence aussi lumineuse qu'attachante.",
    traits: ['Expressif', 'Curieux', 'Vif'],
    accent: 'rgba(52, 160, 115, 0.12)',
  }),
  createAnimal({
    id: 'gazelle',
    name: 'Gazelle',
    emoji: '🦌',
    personality: 'Gracieuse, intuitive',
    description:
      "La gazelle incarne la grâce, la vigilance et la finesse. Vive, légère, toujours en mouvement, elle écoute ce que les autres ne perçoivent pas. Discrète mais puissante, elle sait quand fuir, quand s'arrêter et comment laisser une trace sans jamais faire de bruit.",
    traits: ['Gracieuse', 'Intuitive', 'Libre'],
    accent: 'rgba(205, 174, 116, 0.12)',
  }),
  createAnimal({
    id: 'mandrill',
    name: 'Mandrill',
    emoji: '🐒',
    personality: 'Puissant, vigilant',
    description:
      "Le mandrill avance avec assurance, comme un roi silencieux au cœur de la forêt. Puissant et hiérarchique, il tisse des liens forts à travers les regards, les gestes et la présence. Sa force ne cherche pas la guerre : elle cherche l'équilibre, la mémoire et le respect.",
    traits: ['Puissant', 'Vigilant', 'Complexe'],
    accent: 'rgba(142, 92, 130, 0.12)',
  }),
  createAnimal({
    id: 'requin',
    name: 'Requin',
    emoji: '🦈',
    personality: 'Précis, calme',
    description:
      "Le requin glisse comme une énigme dans les profondeurs, froid en apparence, mais parfaitement concentré. Il ne gaspille ni son énergie, ni ses gestes, et transforme chaque mouvement en choix stratégique. Souvent redouté, il incarne surtout la survie lucide et la force essentielle.",
    traits: ['Précis', 'Calme', 'Implacable'],
    accent: 'rgba(109, 139, 172, 0.12)',
  }),
  createAnimal({
    id: 'koala',
    name: 'Koala',
    emoji: '🐨',
    personality: 'Paisible, constant',
    description:
      "Le koala vit au ralenti, loin de l'urgence et du bruit. Chaque geste chez lui semble mesuré, presque méditatif, comme s'il habitait un autre temps. Sous sa douceur discrète se cache un cœur tenace, fidèle à son rythme et indifférent au tumulte du monde.",
    traits: ['Paisible', 'Méditatif', 'Constant'],
    accent: 'rgba(156, 167, 172, 0.11)',
  }),
  createAnimal({
    id: 'ane',
    name: 'Âne',
    emoji: '🫏',
    personality: 'Patient, résistant',
    description:
      "L'âne est une force tranquille, souvent sous-estimée mais profondément fiable. Sa patience n'est pas faiblesse : c'est une manière de juger, de comprendre et d'avancer sans panique. Endurant et prudent, il porte beaucoup sans se plaindre et garde dans le regard une douceur grave.",
    traits: ['Patient', 'Résistant', 'Prudent'],
    accent: 'rgba(154, 128, 95, 0.12)',
  }),
  createAnimal({
    id: 'herisson',
    name: 'Hérisson',
    emoji: '🦔',
    personality: 'Prudent, curieux',
    description:
      "Le hérisson avance dans le silence, discret et timide, toujours prêt à se protéger si le danger approche. Sous ses piquants bat pourtant un cœur calme, curieux et capable de s'ouvrir à ceux qui savent attendre. Il incarne une douceur protégée, vulnérable mais libre.",
    traits: ['Prudent', 'Curieux', 'Libre'],
    accent: 'rgba(133, 105, 74, 0.12)',
  }),
  createAnimal({
    id: 'flamant',
    name: 'Flamant',
    emoji: '🦩',
    personality: 'Élégant, sensible',
    description:
      "Le flamant rose est naturellement remarquable, fier sans arrogance. Il choisit la beauté, le silence et l'équilibre, même là où le monde semble plus chaotique. Il sait ce qu'il vaut et avance lentement, non par faiblesse, mais par goût du geste juste.",
    traits: ['Élégant', 'Paisible', 'Sensible'],
    accent: 'rgba(215, 123, 150, 0.12)',
  }),
  createAnimal({
    id: 'tigre',
    name: 'Tigre',
    emoji: '🐅',
    personality: 'Puissant, majestueux',
    description:
      "Le tigre est une puissance silencieuse, à la fois explosive et souveraine. Solitaire, fier, imprévisible, il sait quand se faire invisible et quand imposer sa présence. Son regard brûle d'une intensité brute qui force naturellement l'admiration.",
    traits: ['Majestueux', 'Sauvage', 'Intense'],
    accent: 'rgba(214, 126, 48, 0.13)',
  }),
  createAnimal({
    id: 'cheval',
    name: 'Cheval',
    emoji: '🐎',
    personality: 'Libre, loyal',
    description:
      "Le cheval est la liberté en mouvement, porté par un élan indomptable. Puissant et sensible à la fois, il partage sa force avec loyauté sans jamais se trahir lui-même. Son regard appelle l'aventure, la confiance et le goût profond de la vie.",
    traits: ['Libre', 'Loyal', 'Vibrant'],
    accent: 'rgba(169, 121, 80, 0.12)',
  }),
  createAnimal({
    id: 'puma',
    name: 'Puma',
    emoji: '🐆',
    personality: 'Discret, agile',
    description:
      "Le puma préfère l'observation à la brutalité. Solitaire, souple et déterminé, il avance sans bruit en gardant toujours le contrôle de son énergie. Il évite l'affrontement inutile, mais agit avec une précision foudroyante lorsqu'il le faut vraiment.",
    traits: ['Discret', 'Agile', 'Déterminé'],
    accent: 'rgba(168, 136, 92, 0.12)',
  }),
  createAnimal({
    id: 'coyote',
    name: 'Coyote',
    emoji: '🐺',
    personality: 'Rusé, rebelle',
    description:
      "Le coyote aime les chemins de traverse, les situations à retourner et les règles à contourner. Joueur, moqueur parfois, il manie l'humour comme une arme et garde toujours un coup d'avance. Curieux, indépendant et stratège, il observe tout, apprend vite et n'oublie jamais.",
    traits: ['Rusé', 'Rebelle', 'Stratégique'],
    accent: 'rgba(171, 133, 91, 0.12)',
  }),
];
