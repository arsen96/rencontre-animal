import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');

const NEW_ANIMALS = [
  {
    id: 'ornithorynque',
    name: 'Ornithorynque',
    emoji: '🦫',
    personality: 'Original, indépendant',
    description:
      "L'ornithorynque est un être original qui ne cherche pas à ressembler aux autres et suit son propre chemin sans se soucier du regard d'autrui. Curieux et créatif, il aime explorer de nouvelles idées et comprendre ce qui l'entoure. Discret mais déterminé, il cache une grande intelligence et une capacité d'adaptation remarquable.",
    traits: ['Créatif', 'Curieux', 'Adaptable'],
    accent: 'rgba(120, 150, 170, 0.12)',
  },
  {
    id: 'leopard-des-neiges',
    name: 'Léopard des neiges',
    emoji: '🐆',
    personality: 'Solitaire, noble',
    description:
      "Le léopard des neiges est un solitaire noble et mystérieux qui préfère observer le monde à distance avant d'agir. Réservé, il accorde difficilement sa confiance, mais sa loyauté est alors profonde et sincère. Patient et maître de lui-même, il apprécie le calme, la liberté et l'authenticité, et cache derrière sa froideur un cœur généreux.",
    traits: ['Réservé', 'Loyal', 'Maître de soi'],
    accent: 'rgba(170, 185, 200, 0.11)',
  },
  {
    id: 'suricate',
    name: 'Suricate',
    emoji: '🐾',
    personality: 'Vif, sociable',
    description:
      "Le suricate est vif, sociable et toujours attentif à ce qui se passe autour de lui. Curieux et observateur, il aime comprendre les situations avant d'agir et remarque des détails que les autres ignorent. Très attaché à sa famille, il se montre protecteur, débrouillard et déteste la trahison.",
    traits: ['Attentif', 'Protecteur', 'Débrouillard'],
    accent: 'rgba(178, 148, 102, 0.12)',
  },
  {
    id: 'autruche',
    name: 'Autruche',
    emoji: '🐦',
    personality: 'Indépendante, endurante',
    description:
      "L'autruche aime avancer à son propre rythme sans se laisser influencer par la pression extérieure. Prudente et réfléchie, elle évite les conflits inutiles mais possède une grande endurance pour surmonter les obstacles. Attachée à sa liberté, elle est pacifique mais devient très déterminée pour défendre ses proches.",
    traits: ['Prudente', 'Libre', 'Déterminée'],
    accent: 'rgba(150, 130, 105, 0.12)',
  },
  {
    id: 'alpaga',
    name: 'Alpaga',
    emoji: '🦙',
    personality: 'Doux, bienveillant',
    description:
      "L'alpaga est doux, calme et naturellement bienveillant, préférant l'harmonie aux conflits. Discret mais attentif, il observe beaucoup avant de s'exprimer et apprécie les relations sincères. Sensible aux émotions des autres, il fait preuve d'empathie mais sait se faire respecter lorsqu'une limite est franchie.",
    traits: ['Calme', 'Empathique', 'Apaisant'],
    accent: 'rgba(198, 178, 150, 0.12)',
  },
  {
    id: 'brebis',
    name: 'Brebis',
    emoji: '🐑',
    personality: 'Gentille, loyale',
    description:
      "La brebis est gentille, loyale et profondément attachée à son entourage. Patiente et généreuse, elle aide les autres sans attendre de récompense et préfère la coopération à la compétition. Sa douceur n'est pas faiblesse : pour protéger ceux qu'elle aime, elle peut faire preuve d'un courage surprenant.",
    traits: ['Fidèle', 'Généreuse', 'Patiente'],
    accent: 'rgba(214, 206, 192, 0.1)',
  },
  {
    id: 'cerf',
    name: 'Cerf',
    emoji: '🦌',
    personality: 'Noble, digne',
    description:
      "Le cerf est noble, digne et profondément attaché à ses valeurs, avec une présence qui inspire le respect. Réfléchi et prudent, il préfère observer avant d'agir et évite les conflits inutiles. Sensible à l'harmonie, il avance avec persévérance vers ses objectifs et supporte difficilement la trahison.",
    traits: ['Réfléchi', 'Loyal', 'Élégant'],
    accent: 'rgba(160, 120, 82, 0.12)',
  },
  {
    id: 'lama',
    name: 'Lama',
    emoji: '🦙',
    personality: 'Indépendant, affirmé',
    description:
      "Le lama est indépendant, intelligent et doté d'un caractère bien affirmé, attaché à sa liberté de pensée. Sociable en confiance, il crée des liens solides tout en préservant son espace personnel. Patient et résistant, il cache sous une apparente simplicité une personnalité forte, fidèle et étonnamment persévérante.",
    traits: ['Libre', 'Patient', 'Fidèle'],
    accent: 'rgba(186, 160, 120, 0.12)',
  },
  {
    id: 'oie',
    name: 'Oie',
    emoji: '🪿',
    personality: 'Vigilante, loyale',
    description:
      "L'oie est vigilante, loyale et très attachée à ceux qu'elle considère comme sa famille. Protectrice, elle veille sur ses proches et n'hésite pas à donner l'alerte face au danger ou à l'injustice. Sociable et sensible, elle a un fort sens du devoir mais supporte mal l'ingratitude et les trahisons.",
    traits: ['Protectrice', 'Sociable', 'Fidèle'],
    accent: 'rgba(200, 200, 190, 0.1)',
  },
  {
    id: 'pigeon',
    name: 'Pigeon',
    emoji: '🕊️',
    personality: 'Adaptable, persévérant',
    description:
      "Le pigeon est adaptable, persévérant et capable de trouver sa place dans presque toutes les situations. Ouvert aux autres, il crée facilement des liens et suit souvent son intuition avec succès. Paisible, il préfère la diplomatie aux conflits et reste fidèle à ses proches même dans les périodes difficiles.",
    traits: ['Sociable', 'Intuitif', 'Fidèle'],
    accent: 'rgba(160, 168, 178, 0.11)',
  },
  {
    id: 'girafe',
    name: 'Girafe',
    emoji: '🦒',
    personality: 'Élégante, posée',
    description:
      "La girafe est élégante, calme et dotée d'une grande hauteur de vue. Elle prend du recul avant de juger et réfléchit à long terme plutôt que de réagir dans la précipitation. Bienveillante et curieuse, elle cherche à comprendre les autres et supporte mal les esprits étroits et les conflits inutiles.",
    traits: ['Calme', 'Curieuse', 'Bienveillante'],
    accent: 'rgba(203, 168, 108, 0.12)',
  },
  {
    id: 'guepard',
    name: 'Guépard',
    emoji: '🐆',
    personality: 'Ambitieux, vif',
    description:
      "Le guépard est ambitieux, vif d'esprit et tourné vers l'action, avançant rapidement vers ses objectifs. Confiant et réactif, il sait saisir les opportunités et préfère compter sur lui-même. Derrière son énergie se cache une sensibilité qui apprécie les relations sincères, mais il s'impatiente face à l'indécision.",
    traits: ['Rapide', 'Déterminé', 'Confiant'],
    accent: 'rgba(206, 158, 74, 0.13)',
  },
  {
    id: 'lynx',
    name: 'Lynx',
    emoji: '🐾',
    personality: 'Discret, observateur',
    description:
      "Le lynx est discret, observateur et doté d'une intuition remarquable : il parle peu mais remarque tout. Indépendant et réfléchi, il analyse avant d'agir et ne se laisse pas influencer facilement. Il déteste les manipulations, accorde sa confiance avec prudence et fait alors preuve d'une fidélité remarquable.",
    traits: ['Intuitif', 'Indépendant', 'Fidèle'],
    accent: 'rgba(150, 138, 110, 0.12)',
  },
  {
    id: 'orque',
    name: 'Orque',
    emoji: '🐋',
    personality: 'Charismatique, stratège',
    description:
      "L'orque est charismatique, puissante et profondément attachée à son cercle proche. Intelligente et stratégique, elle réfléchit plusieurs coups à l'avance et sait prendre les devants. Elle protège farouchement ceux qu'elle aime, admire la loyauté et se montre impitoyable envers la trahison.",
    traits: ['Puissante', 'Loyale', 'Protectrice'],
    accent: 'rgba(96, 128, 150, 0.12)',
  },
  {
    id: 'castor',
    name: 'Castor',
    emoji: '🦫',
    personality: 'Travailleur, méthodique',
    description:
      "Le castor est travailleur, méthodique et incroyablement persévérant : il aime construire, organiser et voir le résultat concret de ses efforts. Patient et prévoyant, il prépare l'avenir plutôt que de compter sur la chance. Fiable et responsable, il cache sous son calme une volonté de fer.",
    traits: ['Persévérant', 'Fiable', 'Prévoyant'],
    accent: 'rgba(140, 108, 78, 0.13)',
  },
  {
    id: 'tatou',
    name: 'Tatou',
    emoji: '🐾',
    personality: 'Prudent, réservé',
    description:
      "Le tatou est prudent, réservé et doté d'un fort instinct de protection : il n'accorde sa confiance que progressivement. Réfléchi et discret, il observe beaucoup avant de décider et apprécie la sécurité et les relations sincères. Derrière sa carapace se cache une nature sensible et généreuse envers ceux qui l'ont mérité.",
    traits: ['Discret', 'Protecteur', 'Résistant'],
    accent: 'rgba(158, 132, 104, 0.12)',
  },
  {
    id: 'raton-laveur',
    name: 'Raton laveur',
    emoji: '🦝',
    personality: 'Astucieux, curieux',
    description:
      "Le raton laveur est astucieux, curieux et plein de ressources, toujours à la recherche de solutions originales. Sociable et charmeur, il attire facilement la sympathie et conserve un esprit joueur et créatif. Il aime la liberté et l'aventure, mais supporte mal la routine excessive et les règles qu'il juge inutiles.",
    traits: ['Ingénieux', 'Sociable', 'Créatif'],
    accent: 'rgba(140, 145, 152, 0.12)',
  },
  {
    id: 'zebre',
    name: 'Zèbre',
    emoji: '🦓',
    personality: 'Original, indépendant',
    description:
      "Le zèbre est original, indépendant et fier de sa singularité : il refuse de se fondre dans la masse. Sociable sans être influençable, il aime faire partie d'un groupe tout en conservant son individualité. Courageux et loyal, il apprécie l'authenticité et cache une personnalité honnête et attachée à ses principes.",
    traits: ['Fier', 'Courageux', 'Loyal'],
    accent: 'rgba(190, 190, 190, 0.1)',
  },
  {
    id: 'antilope',
    name: 'Antilope',
    emoji: '🦌',
    personality: 'Vive, élégante',
    description:
      "L'antilope est vive, élégante et toujours en mouvement, avec un esprit alerte qui saisit les opportunités avant les autres. Prudente mais courageuse, elle évalue les risques sans renoncer à ses ambitions. Sociable et sensible à son environnement, elle contourne les tensions avec intelligence et grâce.",
    traits: ['Alerte', 'Prudente', 'Gracieuse'],
    accent: 'rgba(200, 172, 116, 0.12)',
  },
  {
    id: 'bison',
    name: 'Bison',
    emoji: '🦬',
    personality: 'Fort, stable',
    description:
      "Le bison est fort, stable et profondément enraciné dans ses valeurs, difficile à déstabiliser. Il avance à son rythme, avec patience et persévérance, sans chercher à impressionner. Très protecteur, il cache sous sa tranquillité une puissance et un courage silencieux, et reste inflexible une fois sa décision prise.",
    traits: ['Calme', 'Protecteur', 'Persévérant'],
    accent: 'rgba(110, 92, 74, 0.13)',
  },
  {
    id: 'loutre',
    name: 'Loutre',
    emoji: '🦦',
    personality: 'Joyeuse, énergique',
    description:
      "La loutre est joyeuse, intelligente et pleine d'énergie, trouvant du plaisir dans les petites choses du quotidien. Sociable et chaleureuse, elle crée vite des liens et apporte de la bonne humeur autour d'elle. Curieuse et dotée d'une grande intelligence émotionnelle, elle se montre fidèle et protectrice envers ceux qui comptent.",
    traits: ['Sociable', 'Curieuse', 'Fidèle'],
    accent: 'rgba(138, 112, 84, 0.12)',
  },
  {
    id: 'hippopotame',
    name: 'Hippopotame',
    emoji: '🦛',
    personality: 'Calme, puissant',
    description:
      "L'hippopotame est calme en apparence mais doté d'une force de caractère impressionnante. Patient et réfléchi, il évite les conflits pour préserver son énergie, mais réagit avec une détermination redoutable quand on menace ses proches. Loyal et protecteur, il cache sous son allure robuste une nature sensible.",
    traits: ['Patient', 'Loyal', 'Protecteur'],
    accent: 'rgba(128, 118, 130, 0.12)',
  },
  {
    id: 'porc-epic',
    name: 'Porc-épic',
    emoji: '🦔',
    personality: 'Indépendant, prudent',
    description:
      "Le porc-épic est indépendant, prudent et très attaché à son espace personnel : il n'accorde pas facilement sa confiance. Derrière son apparence défensive se cache un cœur sensible et généreux qui refuse d'être manipulé. Réfléchi et persévérant, il révèle une personnalité chaleureuse une fois qu'il se sent en sécurité.",
    traits: ['Réservé', 'Sensible', 'Persévérant'],
    accent: 'rgba(130, 108, 82, 0.12)',
  },
  {
    id: 'panda-roux',
    name: 'Panda roux',
    emoji: '🐾',
    personality: 'Doux, charmant',
    description:
      "Le panda roux est doux, charmant et plein de subtilité, attirant par sa gentillesse plutôt que par la force. Curieux et intelligent, il explore de nouvelles idées tout en gardant son indépendance. Sensible à l'ambiance, il recherche l'harmonie et avance vers ses objectifs avec une détermination tranquille.",
    traits: ['Discret', 'Curieux', 'Indépendant'],
    accent: 'rgba(188, 120, 80, 0.12)',
  },
  {
    id: 'tapir',
    name: 'Tapir',
    emoji: '🐾',
    personality: 'Paisible, réfléchi',
    description:
      "Le tapir est paisible, réfléchi et profondément attaché à son équilibre intérieur, préférant avancer avec prudence. Discret et humble, il ne cherche pas les projecteurs mais son sérieux et sa fiabilité finissent par être remarqués. Bienveillant, il privilégie le dialogue et se montre loyal une fois sa confiance accordée.",
    traits: ['Discret', 'Humble', 'Fiable'],
    accent: 'rgba(124, 110, 96, 0.12)',
  },
  {
    id: 'wombat',
    name: 'Wombat',
    emoji: '🐾',
    personality: 'Solide, déterminé',
    description:
      "Le wombat est solide, déterminé et étonnamment persévérant : il avance à son rythme sans se laisser influencer. Pragmatique et terre à terre, il préfère les actes aux grandes paroles et valorise la stabilité. Protecteur, il offre un soutien discret mais fiable et révèle un humour inattendu à ceux qui le connaissent.",
    traits: ['Pragmatique', 'Persévérant', 'Protecteur'],
    accent: 'rgba(136, 116, 96, 0.12)',
  },
  {
    id: 'tarsier',
    name: 'Tarsier',
    emoji: '🐾',
    personality: 'Vif, observateur',
    description:
      "Le tarsier est vif d'esprit, curieux et extrêmement observateur : presque rien ne lui échappe. Discret et réfléchi, il préfère écouter avant de parler pour juger justement les situations. Créatif et adaptable, il apprécie les conversations profondes et fait preuve d'une concentration remarquable quand un objectif le passionne.",
    traits: ['Curieux', 'Réfléchi', 'Créatif'],
    accent: 'rgba(150, 132, 108, 0.12)',
  },
  {
    id: 'emeu',
    name: 'Émeu',
    emoji: '🐦',
    personality: 'Énergique, indépendant',
    description:
      "L'émeu est énergique, indépendant et toujours prêt à aller de l'avant, préférant l'action aux longues hésitations. Curieux et adaptable, il trouve son chemin même dans l'imprévu et refuse les limites injustifiées. Doté d'une grande endurance, il rebondit après les échecs et s'investit avec enthousiasme dans ce qu'il croit.",
    traits: ['Curieux', 'Adaptable', 'Endurant'],
    accent: 'rgba(140, 122, 100, 0.12)',
  },
  {
    id: 'dinde',
    name: 'Dinde',
    emoji: '🦃',
    personality: 'Sociable, expressive',
    description:
      "La dinde est sociable, expressive et très attachée à son entourage, aimant partager ses émotions et ses idées. Généreuse et attentionnée, elle veille souvent au bien-être des autres avant le sien et apprécie la reconnaissance. Loyale et sincère, elle supporte mal le mépris et les critiques injustes qui la blessent profondément.",
    traits: ['Généreuse', 'Attentionnée', 'Loyale'],
    accent: 'rgba(178, 110, 90, 0.12)',
  },
  {
    id: 'mouflon',
    name: 'Mouflon',
    emoji: '🐏',
    personality: 'Fier, robuste',
    description:
      "Le mouflon est fier, robuste et profondément attaché à son indépendance : il aime relever les défis sans reculer. Courageux et déterminé, il affronte les obstacles de front et possède un fort sens de l'honneur. Loyal envers ceux qui ont gagné sa confiance, il supporte difficilement la lâcheté et la manipulation.",
    traits: ['Courageux', 'Déterminé', 'Loyal'],
    accent: 'rgba(146, 124, 98, 0.12)',
  },
  {
    id: 'gerboise',
    name: 'Gerboise',
    emoji: '🐁',
    personality: 'Vive, ingénieuse',
    description:
      "La gerboise est vive, ingénieuse et pleine de ressources : rapide d'esprit, elle trouve des solutions là où d'autres voient des obstacles. Curieuse et enthousiaste, son optimisme lui permet de rebondir facilement après les déceptions. Sociable mais indépendante, elle admire la créativité et se lasse vite de la routine et du pessimisme.",
    traits: ['Rapide', 'Curieuse', 'Optimiste'],
    accent: 'rgba(190, 160, 110, 0.12)',
  },
  {
    id: 'rhinoceros',
    name: 'Rhinocéros',
    emoji: '🦏',
    personality: 'Puissant, déterminé',
    description:
      "Le rhinocéros est puissant, déterminé et difficile à détourner de ses objectifs, avançant avec constance. Calme et réservé, il n'éprouve pas le besoin de prouver sa valeur et accorde une grande importance à la loyauté. Protecteur envers ses proches, il cache une sensibilité discrète, mais sa réaction peut être redoutable s'il se sent trahi.",
    traits: ['Constant', 'Loyal', 'Protecteur'],
    accent: 'rgba(128, 130, 134, 0.12)',
  },
  {
    id: 'lycaon',
    name: 'Lycaon',
    emoji: '🐺',
    personality: 'Dynamique, solidaire',
    description:
      "Le lycaon est dynamique, solidaire et profondément attaché à l'esprit d'équipe, conscient de l'importance de la coopération. Sociable et communicatif, il crée facilement des liens et aime se sentir utile au sein d'un groupe. Courageux et fidèle, il comprend les motivations de chacun mais supporte mal l'égoïsme et la trahison.",
    traits: ['Sociable', 'Courageux', 'Fidèle'],
    accent: 'rgba(124, 116, 108, 0.12)',
  },
  {
    id: 'ecureuil',
    name: 'Écureuil',
    emoji: '🐿️',
    personality: 'Vif, enthousiaste',
    description:
      "L'écureuil est vif, enthousiaste et plein d'initiative, toujours en mouvement pour explorer de nouvelles possibilités. Curieux et débrouillard, il trouve des solutions créatives et pense à l'avenir avec prévoyance. Sociable et chaleureux, il cache sous son entrain une grande détermination et se lasse de l'inaction et du pessimisme.",
    traits: ['Curieux', 'Prévoyant', 'Débrouillard'],
    accent: 'rgba(172, 122, 82, 0.12)',
  },
  {
    id: 'axolotl',
    name: 'Axolotl',
    emoji: '🐾',
    personality: 'Calme, singulier',
    description:
      "L'axolotl est calme, singulier et profondément adaptable : il évolue à son propre rythme, fidèle à ce qu'il est. Curieux et imaginatif, il observe le monde différemment et trouve des solutions inattendues. Bienveillant, il évite les conflits, surmonte les épreuves avec résilience et accorde une loyauté discrète mais profonde.",
    traits: ['Adaptable', 'Imaginatif', 'Bienveillant'],
    accent: 'rgba(150, 160, 172, 0.11)',
  },
  {
    id: 'saimiri',
    name: 'Saïmiri',
    emoji: '🐒',
    personality: 'Vif, malin',
    description:
      "Le saïmiri est vif, malin et débordant d'énergie, aimant apprendre, explorer et relever de nouveaux défis. Sociable et communicatif, il se fait facilement des amis grâce à son esprit enjoué et son humour. Rapide d'esprit et observateur, il s'investit avec une énergie contagieuse et entraîne naturellement les autres.",
    traits: ['Curieux', 'Sociable', 'Ingénieux'],
    accent: 'rgba(166, 136, 96, 0.12)',
  },
  {
    id: 'okapi',
    name: 'Okapi',
    emoji: '🐾',
    personality: 'Discret, authentique',
    description:
      "L'okapi est discret, élégant et profondément authentique : il ne cherche ni à impressionner ni à suivre la foule. Observateur et réfléchi, il prend le temps de comprendre avant d'agir et perçoit ce que les autres ressentent. Derrière sa réserve se cache une détermination silencieuse et une loyauté exceptionnelle.",
    traits: ['Observateur', 'Réfléchi', 'Loyal'],
    accent: 'rgba(150, 112, 88, 0.12)',
  },
  {
    id: 'glouton',
    name: 'Glouton',
    emoji: '🐾',
    personality: 'Intrépide, tenace',
    description:
      "Le glouton est intrépide, tenace et doté d'une volonté hors du commun : plus un défi est difficile, plus il éveille sa détermination. Indépendant et courageux, il compte sur ses propres forces et s'adapte aux situations les plus exigeantes. Profondément loyal, il admire la persévérance et la franchise, mais méprise la lâcheté.",
    traits: ['Courageux', 'Indépendant', 'Loyal'],
    accent: 'rgba(120, 104, 88, 0.12)',
  },
  {
    id: 'zibeline',
    name: 'Zibeline',
    emoji: '🐾',
    personality: 'Élégante, vive',
    description:
      "La zibeline est élégante, discrète et dotée d'un esprit particulièrement vif, agissant avec finesse plutôt que par la force. Observatrice et intuitive, elle perçoit vite les intentions des autres et se laisse rarement tromper. Indépendante mais fidèle, elle poursuit ses objectifs avec patience, discrétion et une efficacité qui passe inaperçue.",
    traits: ['Fine', 'Intuitive', 'Fidèle'],
    accent: 'rgba(120, 104, 92, 0.12)',
  },
  {
    id: 'capybara',
    name: 'Capybara',
    emoji: '🐾',
    personality: 'Paisible, rassembleur',
    description:
      "Le capybara est paisible, bienveillant et naturellement rassembleur : il met les autres à l'aise et crée une atmosphère de confiance. Patient et tolérant, il écoute avant de juger et préfère le dialogue à l'affrontement. Derrière son calme se cache une grande résilience, et il offre son amitié avec une fidélité qui inspire durablement.",
    traits: ['Bienveillant', 'Patient', 'Sociable'],
    accent: 'rgba(150, 128, 104, 0.12)',
  },
  {
    id: 'pangolin',
    name: 'Pangolin',
    emoji: '🐾',
    personality: 'Réservé, réfléchi',
    description:
      "Le pangolin est réservé, réfléchi et profondément attaché à son équilibre, préférant la prudence à l'impulsivité. Discret, il laisse ses actes parler à sa place et protège farouchement son intimité. Fidèle à ses valeurs, il révèle une personnalité chaleureuse et d'une étonnante force de caractère lorsqu'il se sent en sécurité.",
    traits: ['Prudent', 'Discret', 'Fidèle'],
    accent: 'rgba(140, 120, 96, 0.12)',
  },
  {
    id: 'morse',
    name: 'Morse',
    emoji: '🦭',
    personality: 'Posé, fiable',
    description:
      "Le morse est posé, fiable et doté d'une grande force intérieure : il inspire le respect sans avoir à s'imposer. Patient et protecteur, il veille sur ceux qu'il aime et résout les conflits avec calme. Derrière son allure imposante se cache une personnalité chaleureuse et loyale, qui supporte mal l'injustice et les abus de pouvoir.",
    traits: ['Patient', 'Protecteur', 'Loyal'],
    accent: 'rgba(120, 130, 140, 0.12)',
  },
  {
    id: 'narval',
    name: 'Narval',
    emoji: '🐋',
    personality: 'Mystérieux, intuitif',
    description:
      "Le narval est mystérieux, intuitif et profondément original : il préfère tracer sa propre route avec discrétion. Réfléchi et imaginatif, il possède une grande richesse intérieure et une manière unique de voir le monde. Derrière sa réserve se cache une grande sensibilité et une loyauté sans faille envers ceux qui gagnent sa confiance.",
    traits: ['Original', 'Réfléchi', 'Fidèle'],
    accent: 'rgba(110, 130, 150, 0.12)',
  },
  {
    id: 'binturong',
    name: 'Binturong',
    emoji: '🐾',
    personality: 'Paisible, sage',
    description:
      "Le binturong est paisible, indépendant et plein de sagesse : il avance sans précipitation, observant avant d'agir. Très adaptable, il trouve sa place dans les environnements les plus variés sans perdre son authenticité. Il privilégie les relations simples et sincères et fait preuve d'une grande persévérance pour atteindre ses objectifs.",
    traits: ['Adaptable', 'Persévérant', 'Authentique'],
    accent: 'rgba(126, 112, 96, 0.12)',
  },
  {
    id: 'fossa',
    name: 'Fossa',
    emoji: '🐾',
    personality: 'Audacieuse, déterminée',
    description:
      "La fossa est audacieuse, vive d'esprit et extrêmement déterminée, prête à sortir de sa zone de confort pour atteindre ses objectifs. Intelligente et stratégique, elle analyse rapidement une situation avant d'agir avec précision. Elle admire le courage, l'autonomie et la franchise, mais ne tolère ni la manipulation ni la lâcheté.",
    traits: ['Vive', 'Stratège', 'Franche'],
    accent: 'rgba(140, 116, 92, 0.12)',
  },
  {
    id: 'kinkajou',
    name: 'Kinkajou',
    emoji: '🐾',
    personality: 'Joyeux, affectueux',
    description:
      "Le kinkajou est joyeux, affectueux et plein de curiosité : il aime créer une ambiance chaleureuse et voit le bon côté des choses. Sociable et généreux, il apprécie les moments de partage et sait mettre les autres à l'aise. Derrière son caractère joueur se cachent une grande intelligence émotionnelle et une fidélité sincère.",
    traits: ['Curieux', 'Sociable', 'Fidèle'],
    accent: 'rgba(168, 130, 90, 0.12)',
  },
  {
    id: 'serval',
    name: 'Serval',
    emoji: '🐾',
    personality: 'Élégant, attentif',
    description:
      "Le serval est élégant, attentif et particulièrement observateur : il agit rarement dans la précipitation et attend le bon moment. Indépendant et sûr de lui, il possède une grande maîtrise de ses émotions. Il apprécie les personnes discrètes, compétentes et honnêtes, mais s'éloigne des individus arrogants ou imprévisibles.",
    traits: ['Observateur', 'Indépendant', 'Maître de soi'],
    accent: 'rgba(180, 150, 100, 0.12)',
  },
  {
    id: 'caracal',
    name: 'Caracal',
    emoji: '🐾',
    personality: 'Ambitieux, courageux',
    description:
      "Le caracal est ambitieux, courageux et très réactif : il aime relever des défis jugés impossibles avec une remarquable confiance en lui. Rapide d'esprit, il prend souvent les bonnes décisions sous pression. Derrière son tempérament affirmé se cache une profonde loyauté envers ceux qui méritent son respect.",
    traits: ['Réactif', 'Confiant', 'Loyal'],
    accent: 'rgba(190, 150, 96, 0.12)',
  },
  {
    id: 'quokka',
    name: 'Quokka',
    emoji: '🐾',
    personality: 'Optimiste, bienveillant',
    description:
      "Le quokka est optimiste, bienveillant et naturellement positif : il diffuse sa bonne humeur sans effort et rassure ceux qui l'entourent. Sociable et ouvert d'esprit, il apprécie les relations simples, sincères et sans jugement. Derrière son sourire se cache une belle force mentale qui lui permet de surmonter les difficultés sans perdre espoir.",
    traits: ['Positif', 'Sociable', 'Résilient'],
    accent: 'rgba(178, 156, 100, 0.12)',
  },
  {
    id: 'pika',
    name: 'Pika',
    emoji: '🐾',
    personality: 'Travailleur, prévoyant',
    description:
      "Le pika est travailleur, organisé et prévoyant : il prépare toujours l'avenir avec sérieux tout en profitant du moment présent. Curieux et persévérant, il apprend rapidement et ne recule pas devant les efforts. Il apprécie la stabilité et les projets bien construits, mais se fatigue vite du désordre et de l'improvisation permanente.",
    traits: ['Organisé', 'Curieux', 'Persévérant'],
    accent: 'rgba(160, 140, 104, 0.12)',
  },
  {
    id: 'coati',
    name: 'Coati',
    emoji: '🐾',
    personality: 'Vif, sociable',
    description:
      "Le coati est vif, sociable et débordant d'énergie : toujours curieux, il aime découvrir de nouvelles personnes et relever des défis variés. Débrouillard et créatif, il trouve facilement des solutions aux problèmes du quotidien. Il apprécie l'humour, la spontanéité et les relations authentiques, mais s'ennuie vite dans une routine trop rigide.",
    traits: ['Curieux', 'Débrouillard', 'Créatif'],
    accent: 'rgba(158, 128, 96, 0.12)',
  },
  {
    id: 'aye-aye',
    name: 'Aye-aye',
    emoji: '🐾',
    personality: 'Original, intuitif',
    description:
      "L'aye-aye est original, intuitif et profondément créatif : il voit des possibilités là où les autres ne remarquent rien et ose penser différemment. Réservé mais curieux, il préfère observer avant d'agir. Il apprécie la liberté intellectuelle et les esprits ouverts, mais s'éloigne rapidement des préjugés et des jugements superficiels.",
    traits: ['Créatif', 'Réservé', 'Curieux'],
    accent: 'rgba(130, 120, 108, 0.12)',
  },
  {
    id: 'goral',
    name: 'Goral',
    emoji: '🐐',
    personality: 'Prudent, courageux',
    description:
      "Le goral est prudent, courageux et très persévérant : il progresse étape par étape sans se laisser décourager par les obstacles. Son calme lui permet de prendre de bonnes décisions même dans les situations délicates. Il respecte les personnes humbles, honnêtes et constantes, mais supporte difficilement la précipitation et l'arrogance.",
    traits: ['Persévérant', 'Calme', 'Humble'],
    accent: 'rgba(140, 128, 108, 0.12)',
  },
  {
    id: 'saiga',
    name: 'Saïga',
    emoji: '🐾',
    personality: 'Adaptable, résistant',
    description:
      "Le saïga est adaptable, résistant et toujours prêt à affronter les changements, s'ajustant aux circonstances sans renier ses valeurs. Optimiste et courageux, il avance malgré les difficultés sans perdre confiance en l'avenir. Il apprécie les personnes sincères et solidaires, mais se méfie des comportements opportunistes.",
    traits: ['Optimiste', 'Courageux', 'Fidèle'],
    accent: 'rgba(160, 138, 104, 0.12)',
  },
  {
    id: 'takin',
    name: 'Takin',
    emoji: '🐾',
    personality: 'Stable, protecteur',
    description:
      "Le takin est stable, protecteur et profondément fiable : il avance avec patience, préférant les résultats durables aux succès rapides. Très attaché à sa famille, il offre un soutien constant sans attendre de reconnaissance. Il admire la loyauté, le courage et la simplicité, mais ne supporte pas la trahison ni les faux-semblants.",
    traits: ['Patient', 'Fiable', 'Loyal'],
    accent: 'rgba(138, 118, 92, 0.12)',
  },
  {
    id: 'galago',
    name: 'Galago',
    emoji: '🐾',
    personality: 'Vif, imaginatif',
    description:
      "Le galago est vif, intuitif et plein d'imagination : toujours curieux, il apprend rapidement et s'adapte facilement aux situations nouvelles. Son enthousiasme communicatif apporte une énergie positive à son entourage. Il apprécie les esprits créatifs, les aventures et les échanges stimulants, mais se lasse vite de la monotonie.",
    traits: ['Curieux', 'Adaptable', 'Enthousiaste'],
    accent: 'rgba(150, 132, 106, 0.12)',
  },
  {
    id: 'dugong',
    name: 'Dugong',
    emoji: '🐋',
    personality: 'Doux, paisible',
    description:
      "Le dugong est doux, paisible et profondément bienveillant : il recherche l'harmonie et construit des relations solides plutôt que superficielles. Patient et à l'écoute, il inspire confiance par sa présence calme et rassurante. Il apprécie les personnes sincères et généreuses, mais s'éloigne naturellement des conflits et de la malhonnêteté.",
    traits: ['Bienveillant', 'Patient', 'Sincère'],
    accent: 'rgba(120, 138, 150, 0.12)',
  },
  {
    id: 'loris-lent',
    name: 'Loris lent',
    emoji: '🐾',
    personality: 'Réfléchi, patient',
    description:
      "Le loris lent ne supporte pas qu'on lui impose un rythme : réfléchi jusqu'à l'excès, il préfère analyser longuement plutôt que de mal décider. D'une patience presque inépuisable, il est très sélectif dans ses relations et offre une confiance absolue à un petit cercle. Discret, il surprend par sa finesse d'esprit, son humour et sa capacité à voir ce que les autres négligent.",
    traits: ['Sélectif', 'Fin', 'Observateur'],
    accent: 'rgba(140, 124, 104, 0.12)',
  },
];

const raw = fs.readFileSync(seedsPath, 'utf8');
const seeds = JSON.parse(raw);
const existingIds = new Set(seeds.map((seed) => seed.id));

const added = [];
const skipped = [];

for (const animal of NEW_ANIMALS) {
  if (existingIds.has(animal.id)) {
    skipped.push(animal.id);
    continue;
  }

  seeds.push({
    id: animal.id,
    name: animal.name,
    emoji: animal.emoji,
    imageUrl: `assets/animals/${animal.id}.jpg`,
    personality: animal.personality,
    description: animal.description,
    traits: animal.traits,
    accent: animal.accent,
    active: true,
  });
  existingIds.add(animal.id);
  added.push(animal.id);
}

fs.writeFileSync(seedsPath, `${JSON.stringify(seeds, null, 2)}\n`);

console.log(`Added ${added.length} animals to ${seedsPath}`);
if (added.length) {
  console.log(`  + ${added.join(', ')}`);
}
if (skipped.length) {
  console.log(`Skipped ${skipped.length} already present: ${skipped.join(', ')}`);
}
console.log(`Total animals in catalogue: ${seeds.length}`);
