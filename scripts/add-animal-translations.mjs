import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');
const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

// English translations for each animal, keyed by id.
// Re-runnable: only the English fields are added/updated, everything else
// (name, emoji, imageUrl, personality, description, traits, accent...) is kept.
const TRANSLATIONS = {
  lion: {
    nameEn: "Lion",
    personalityEn: "Brave, honest",
    descriptionEn: "The lion has a high opinion of himself and can show a touch of pride when criticised. Yet he stays brave and honest: he respects the weaker ones and never hesitates to defend them. He loves people of integrity and can't stand pettiness or pretence.",
    traitsEn: ["Brave", "Protective", "Principled"],
  },
  ours: {
    nameEn: "Bear",
    personalityEn: "Calm, independent",
    descriptionEn: "The bear is a proud loner who prefers quiet to commotion. Patient and calm, he can still command respect through his strength when provoked. Attached to his habits and loyal to those he respects, he hides a sensitive nature beneath a gruff exterior and enjoys life's simple pleasures.",
    traitsEn: ["Independent", "Loyal", "Patient"],
  },
  corbeau: {
    nameEn: "Raven",
    personalityEn: "Methodical, precise",
    descriptionEn: "The raven is methodical and rigorous, devoted to order and clarity. He leaves nothing to chance and often serves as a landmark for those around him. Behind his discipline hides real flexibility: he adapts to the shape of the world without ever losing his course.",
    traitsEn: ["Precise", "Reliable", "Rigorous"],
  },
  renard: {
    nameEn: "Fox",
    personalityEn: "Sharp, mysterious",
    descriptionEn: "The fox is a discreet, observant spirit who favours intelligence over brute force. Curious, he catches the smallest details and anticipates others' moves with precision. His charm opens doors, but he always keeps a share of mystery and grants his trust only with caution.",
    traitsEn: ["Cunning", "Observant", "Strategist"],
  },
  dauphin: {
    nameEn: "Dolphin",
    personalityEn: "Free, joyful",
    descriptionEn: "The dolphin is driven by curiosity, connection and a joy for life. Sociable and playful, he spreads good cheer while keeping a deep sensitivity. Intelligent and intuitive, he eases tension without conflict and stays faithful to those he loves.",
    traitsEn: ["Sociable", "Intuitive", "Playful"],
  },
  hyene: {
    nameEn: "Hyena",
    personalityEn: "Cunning, resilient",
    descriptionEn: "The hyena is a survivor with a sharp gaze and a fierce will. Observant and strategic, she knows how to wait, adapt and strike at the right moment. Loyal to her own, she moves forward despite judgement with raw intelligence and quiet strength.",
    traitsEn: ["Resilient", "Strategic", "Loyal"],
  },
  souris: {
    nameEn: "Mouse",
    personalityEn: "Discreet, quick",
    descriptionEn: "The mouse moves in the shadows, alert to everything around her. Small but fast, she slips through where others fail thanks to her intelligence and instinct. Often underestimated, she hides a silent determination and a deep loyalty.",
    traitsEn: ["Discreet", "Quick", "Determined"],
  },
  rat: {
    nameEn: "Rat",
    personalityEn: "Adaptable, cunning",
    descriptionEn: "The rat is a born survivor, able to make the most of any situation. Intelligent and opportunistic, he observes, analyses then acts with disconcerting precision. Loyal to his clan and bold in his choices, he moves behind the scenes with formidable efficiency.",
    traitsEn: ["Adaptable", "Bold", "Strategist"],
  },
  chien: {
    nameEn: "Dog",
    personalityEn: "Loyal, protective",
    descriptionEn: "The dog is an affectionate pillar you can always count on. He watches over those he loves with tenderness, listens without judging and senses things without being told. His loyalty is unfailing, but if his loved ones are threatened he becomes a formidable guardian.",
    traitsEn: ["Loyal", "Affectionate", "Protective"],
  },
  chat: {
    nameEn: "Cat",
    personalityEn: "Free, intuitive",
    descriptionEn: "The cat does not submit: he chooses. Independent and elegant, he gives his affection to those who deserve it and returns to them in his own way. His calm hides a great emotional intelligence, a deep sensitivity and a marked taste for softness, comfort and beauty.",
    traitsEn: ["Free", "Mysterious", "Affectionate"],
  },
  leopard: {
    nameEn: "Leopard",
    personalityEn: "Silent, proud",
    descriptionEn: "The leopard moves alone, in the shadows, never seeking approval. Agility, precision and composure make him a natural strategist who carefully picks his battles. Mysterious and piercing, he earns respect without needing to roar.",
    traitsEn: ["Silent", "Precise", "Proud"],
  },
  chimpanze: {
    nameEn: "Chimpanzee",
    personalityEn: "Curious, sociable",
    descriptionEn: "The chimpanzee is a sharp, playful spirit, always on the move. Highly sociable, he lives through closeness, laughter and emotion, but behind his mischief lies real clarity. He hates injustice and draws his strength from bonds, intelligence and heart.",
    traitsEn: ["Curious", "Social", "Expressive"],
  },
  manchot: {
    nameEn: "Penguin",
    personalityEn: "Supportive, tender",
    descriptionEn: "The penguin moves with a sometimes clumsy but always determined step. The group is his strength and the warmth of others his refuge, even in the heart of storms. Beneath his comical look hides silent courage, rare loyalty and deep dignity.",
    traitsEn: ["Supportive", "Resilient", "Tender"],
  },
  gorille: {
    nameEn: "Gorilla",
    personalityEn: "Calm, protective",
    descriptionEn: "The gorilla commands respect through his presence alone. His strength is immense, but he prefers serenity to confrontation and watches over his own with surprising gentleness. Peaceful, thoughtful and deeply loyal, he becomes formidable only when what he loves is threatened.",
    traitsEn: ["Protective", "Dignified", "Peaceful"],
  },
  crocodile: {
    nameEn: "Crocodile",
    personalityEn: "Relentless, composed",
    descriptionEn: "The crocodile chooses the shadows, discretion and the right moment. Calm in appearance, he hides blazing power and remarkable control over his emotions. A strategist true to his nature, he acts with cold precision when the moment comes.",
    traitsEn: ["Strategist", "Composed", "Powerful"],
  },
  paresseux: {
    nameEn: "Sloth",
    personalityEn: "Peaceful, wise",
    descriptionEn: "The sloth moves at his own pace, never swept up by the turmoil of the world. His slowness is a choice, not a weakness: he takes time to observe, to feel and to get to the essential. Many judge him too quickly, but those who come closer discover a gentle, patient and surprisingly solid strength.",
    traitsEn: ["Peaceful", "Patient", "Wise"],
  },
  hibou: {
    nameEn: "Owl",
    personalityEn: "Clear-sighted, wise",
    descriptionEn: "Guardian of the night, the owl sees what others miss. A loner, he feels at home in silence and prefers understanding to shining. When he acts, it is with quiet precision, guided by observation, patience and truth.",
    traitsEn: ["Clear-sighted", "Patient", "Wise"],
  },
  panda: {
    nameEn: "Panda",
    personalityEn: "Discreet, harmonious",
    descriptionEn: "The panda prefers calm forests to noisy places and simple routines to excess. Behind his apparent gentleness lie great sensitivity, quiet strength and true balance. He chooses harmony over confrontation, without ever giving up defending himself if pushed too far.",
    traitsEn: ["Calm", "Sensitive", "Harmonious"],
  },
  kangourou: {
    nameEn: "Kangaroo",
    personalityEn: "Free, protective",
    descriptionEn: "The kangaroo is a free spirit who moves in leaps, guided by instinct and a need for space. Always on the move, he still stays attentive to those he protects. His true strength is balance: fast yet thoughtful, independent yet deeply faithful.",
    traitsEn: ["Free", "Energetic", "Protective"],
  },
  tortue: {
    nameEn: "Turtle",
    personalityEn: "Patient, steady",
    descriptionEn: "The turtle moves slowly but surely, giving meaning to each of her steps. She observes without judging, protects herself without fleeing and reminds us that true solidity is often invisible. Her strength lies in patience, simplicity and the wisdom of the long run.",
    traitsEn: ["Patient", "Steady", "Wise"],
  },
  elephant: {
    nameEn: "Elephant",
    personalityEn: "Peaceful, loyal",
    descriptionEn: "The elephant impresses with his size but chooses gentleness over the abuse of force. He forgets neither bonds nor wounds, and moves with quiet dignity. Loyal to his own, he protects the group firmly and becomes formidable only when provoked.",
    traitsEn: ["Loyal", "Sensitive", "Dignified"],
  },
  sanglier: {
    nameEn: "Wild Boar",
    personalityEn: "Authentic, curious",
    descriptionEn: "The wild boar is close to the earth and to real things. Behind his rustic look hides a sharp, sociable and resourceful mind. He doesn't try to please, but knows how to observe, understand quickly and stay fully himself, without mask or shame.",
    traitsEn: ["Curious", "Authentic", "Solid"],
  },
  serpent: {
    nameEn: "Snake",
    personalityEn: "Secretive, composed",
    descriptionEn: "The snake glides silently, fascinating as much as it unsettles, and never moves at random. Its strength lies in listening, self-control and a sense of timing. Discreet yet immense in its power, it embodies transformation, renewal and precision.",
    traitsEn: ["Mysterious", "Composed", "Transformative"],
  },
  aigle: {
    nameEn: "Eagle",
    personalityEn: "Free, visionary",
    descriptionEn: "The eagle flies high, proud and independent, always seeking new perspectives. His power comes not only from his talons but from his ability to see far and choose wisely. He embodies freedom, boldness and a quiet nobility.",
    traitsEn: ["Visionary", "Free", "Noble"],
  },
  buffle: {
    nameEn: "Buffalo",
    personalityEn: "Steady, enduring",
    descriptionEn: "The buffalo moves with determination, undistracted by the commotion. Patient and powerful, he endures hardship without losing his calm and protects his own with constancy. His strength lies in perseverance, balance and quiet courage.",
    traitsEn: ["Enduring", "Steady", "Brave"],
  },
  chameau: {
    nameEn: "Camel",
    personalityEn: "Patient, hardy",
    descriptionEn: "The camel knows the value of long journeys and constancy. He endures heat, drought and hardship with serene mastery. Without chasing speed, he goes far thanks to his endurance, wisdom and inner calm.",
    traitsEn: ["Hardy", "Patient", "Constant"],
  },
  loup: {
    nameEn: "Wolf",
    personalityEn: "Loyal, free",
    descriptionEn: "The wolf is both wild and deeply social. Proud and independent, he knows that his strength also comes from the pack, from loyalty and solid bonds. Intelligent and strategic, he protects his own with passion without ever giving up his freedom.",
    traitsEn: ["Loyal", "Strategic", "Free"],
  },
  lapin: {
    nameEn: "Rabbit",
    personalityEn: "Quick, cautious",
    descriptionEn: "The rabbit is always on alert, sensitive to the slightest threat. His speed is his best defence, but his true strength also lies in his sociability and adaptability. He embodies a gentleness that stays watchful, fragile in appearance, solid at heart.",
    traitsEn: ["Cautious", "Gentle", "Quick"],
  },
  perroquet: {
    nameEn: "Parrot",
    personalityEn: "Lively, expressive",
    descriptionEn: "The parrot brims with life, curiosity and contagious energy. Intelligent, he observes quickly, learns fast and loves to share what he discovers. His freedom of expression, humour and sensitivity make him as bright as he is endearing.",
    traitsEn: ["Expressive", "Curious", "Lively"],
  },
  gazelle: {
    nameEn: "Gazelle",
    personalityEn: "Graceful, intuitive",
    descriptionEn: "The gazelle embodies grace, vigilance and finesse. Quick, light, always on the move, she hears what others cannot. Discreet yet powerful, she knows when to flee, when to stop and how to leave a mark without ever making a sound.",
    traitsEn: ["Graceful", "Intuitive", "Free"],
  },
  mandrill: {
    nameEn: "Mandrill",
    personalityEn: "Powerful, watchful",
    descriptionEn: "The mandrill moves with confidence, like a silent king at the heart of the forest. Powerful and hierarchical, he weaves strong bonds through looks, gestures and presence. His strength doesn't seek war: it seeks balance, memory and respect.",
    traitsEn: ["Powerful", "Watchful", "Complex"],
  },
  requin: {
    nameEn: "Shark",
    personalityEn: "Precise, calm",
    descriptionEn: "The shark glides like an enigma in the depths, cold in appearance but perfectly focused. He wastes neither energy nor movement, turning each motion into a strategic choice. Often feared, he embodies above all lucid survival and essential strength.",
    traitsEn: ["Precise", "Calm", "Relentless"],
  },
  koala: {
    nameEn: "Koala",
    personalityEn: "Peaceful, constant",
    descriptionEn: "The koala lives in slow motion, far from urgency and noise. Every gesture of his seems measured, almost meditative, as if he lived in another time. Beneath his quiet gentleness hides a tenacious heart, faithful to his rhythm and indifferent to the world's turmoil.",
    traitsEn: ["Peaceful", "Meditative", "Constant"],
  },
  ane: {
    nameEn: "Donkey",
    personalityEn: "Patient, hardy",
    descriptionEn: "The donkey is a quiet strength, often underestimated but deeply reliable. His patience is not weakness: it is a way of judging, understanding and moving forward without panic. Enduring and cautious, he carries much without complaint and keeps a grave gentleness in his eyes.",
    traitsEn: ["Patient", "Hardy", "Cautious"],
  },
  herisson: {
    nameEn: "Hedgehog",
    personalityEn: "Cautious, curious",
    descriptionEn: "The hedgehog moves in silence, discreet and shy, always ready to protect himself if danger nears. Yet beneath his spines beats a calm, curious heart able to open up to those who know how to wait. He embodies a protected gentleness, vulnerable but free.",
    traitsEn: ["Cautious", "Curious", "Free"],
  },
  flamant: {
    nameEn: "Flamingo",
    personalityEn: "Elegant, sensitive",
    descriptionEn: "The flamingo is naturally striking, proud without arrogance. He chooses beauty, silence and balance, even where the world seems more chaotic. He knows his worth and moves slowly, not out of weakness, but from a taste for the right gesture.",
    traitsEn: ["Elegant", "Peaceful", "Sensitive"],
  },
  tigre: {
    nameEn: "Tiger",
    personalityEn: "Powerful, majestic",
    descriptionEn: "The tiger is a silent power, both explosive and sovereign. A loner, proud, unpredictable, he knows when to become invisible and when to impose his presence. His gaze burns with a raw intensity that naturally commands admiration.",
    traitsEn: ["Majestic", "Wild", "Intense"],
  },
  cheval: {
    nameEn: "Horse",
    personalityEn: "Free, loyal",
    descriptionEn: "The horse is freedom in motion, carried by an untameable drive. Powerful and sensitive at once, he shares his strength with loyalty without ever betraying himself. His gaze calls for adventure, trust and a deep love of life.",
    traitsEn: ["Free", "Loyal", "Spirited"],
  },
  puma: {
    nameEn: "Puma",
    personalityEn: "Discreet, agile",
    descriptionEn: "The puma prefers observation to brutality. Solitary, supple and determined, he moves silently while always keeping control of his energy. He avoids needless confrontation but acts with lightning precision when it truly matters.",
    traitsEn: ["Discreet", "Agile", "Determined"],
  },
  coyote: {
    nameEn: "Coyote",
    personalityEn: "Cunning, rebellious",
    descriptionEn: "The coyote loves side roads, situations to turn around and rules to bend. Playful, sometimes mocking, he wields humour like a weapon and always keeps a step ahead. Curious, independent and strategic, he observes everything, learns fast and never forgets.",
    traitsEn: ["Cunning", "Rebellious", "Strategic"],
  },
  ornithorynque: {
    nameEn: "Platypus",
    personalityEn: "Original, independent",
    descriptionEn: "The platypus is an original who doesn't try to be like others and follows his own path without worrying about others' eyes. Curious and creative, he loves exploring new ideas and understanding what surrounds him. Discreet but determined, he hides great intelligence and a remarkable ability to adapt.",
    traitsEn: ["Creative", "Curious", "Adaptable"],
  },
  "leopard-des-neiges": {
    nameEn: "Snow Leopard",
    personalityEn: "Solitary, noble",
    descriptionEn: "The snow leopard is a noble, mysterious loner who prefers to observe the world from a distance before acting. Reserved, he grants his trust with difficulty, but his loyalty is then deep and sincere. Patient and self-possessed, he enjoys calm, freedom and authenticity, and hides a generous heart behind his coolness.",
    traitsEn: ["Reserved", "Loyal", "Self-possessed"],
  },
  suricate: {
    nameEn: "Meerkat",
    personalityEn: "Lively, sociable",
    descriptionEn: "The meerkat is lively, sociable and always attentive to what happens around him. Curious and observant, he likes to understand situations before acting and notices details others miss. Very attached to his family, he is protective, resourceful and hates betrayal.",
    traitsEn: ["Attentive", "Protective", "Resourceful"],
  },
  autruche: {
    nameEn: "Ostrich",
    personalityEn: "Independent, enduring",
    descriptionEn: "The ostrich likes to move at her own pace without being swayed by outside pressure. Cautious and thoughtful, she avoids needless conflict but has great endurance to overcome obstacles. Attached to her freedom, she is peaceful but becomes very determined to defend her loved ones.",
    traitsEn: ["Cautious", "Free", "Determined"],
  },
  alpaga: {
    nameEn: "Alpaca",
    personalityEn: "Gentle, kind",
    descriptionEn: "The alpaca is gentle, calm and naturally kind, preferring harmony to conflict. Discreet but attentive, he observes a lot before speaking and values sincere relationships. Sensitive to others' emotions, he shows empathy but knows how to command respect when a limit is crossed.",
    traitsEn: ["Calm", "Empathetic", "Soothing"],
  },
  brebis: {
    nameEn: "Ewe",
    personalityEn: "Kind, loyal",
    descriptionEn: "The ewe is kind, loyal and deeply attached to her circle. Patient and generous, she helps others without expecting reward and prefers cooperation to competition. Her gentleness is not weakness: to protect those she loves, she can show surprising courage.",
    traitsEn: ["Faithful", "Generous", "Patient"],
  },
  cerf: {
    nameEn: "Deer",
    personalityEn: "Noble, dignified",
    descriptionEn: "The stag is noble, dignified and deeply attached to his values, with a presence that commands respect. Thoughtful and cautious, he prefers to observe before acting and avoids needless conflict. Sensitive to harmony, he moves toward his goals with perseverance and struggles to bear betrayal.",
    traitsEn: ["Thoughtful", "Loyal", "Elegant"],
  },
  lama: {
    nameEn: "Llama",
    personalityEn: "Independent, assertive",
    descriptionEn: "The llama is independent, intelligent and strong-willed, attached to his freedom of thought. Sociable when confident, he builds solid bonds while preserving his personal space. Patient and hardy, he hides beneath an apparent simplicity a strong, faithful and surprisingly persevering personality.",
    traitsEn: ["Free", "Patient", "Faithful"],
  },
  oie: {
    nameEn: "Goose",
    personalityEn: "Vigilant, loyal",
    descriptionEn: "The goose is vigilant, loyal and very attached to those she considers family. Protective, she watches over her loved ones and doesn't hesitate to sound the alarm against danger or injustice. Sociable and sensitive, she has a strong sense of duty but bears ingratitude and betrayal poorly.",
    traitsEn: ["Protective", "Sociable", "Faithful"],
  },
  pigeon: {
    nameEn: "Pigeon",
    personalityEn: "Adaptable, persevering",
    descriptionEn: "The pigeon is adaptable, persevering and able to find his place in almost any situation. Open to others, he easily builds bonds and often follows his intuition with success. Peaceful, he prefers diplomacy to conflict and stays loyal to his loved ones even in hard times.",
    traitsEn: ["Sociable", "Intuitive", "Faithful"],
  },
  girafe: {
    nameEn: "Giraffe",
    personalityEn: "Elegant, poised",
    descriptionEn: "The giraffe is elegant, calm and blessed with a broad view. She steps back before judging and thinks long-term rather than reacting in haste. Kind and curious, she seeks to understand others and bears narrow minds and needless conflict poorly.",
    traitsEn: ["Calm", "Curious", "Kind"],
  },
  guepard: {
    nameEn: "Cheetah",
    personalityEn: "Ambitious, quick",
    descriptionEn: "The cheetah is ambitious, quick-witted and action-oriented, moving fast toward his goals. Confident and reactive, he knows how to seize opportunities and prefers to rely on himself. Behind his energy hides a sensitivity that values sincere relationships, but he grows impatient with indecision.",
    traitsEn: ["Fast", "Determined", "Confident"],
  },
  lynx: {
    nameEn: "Lynx",
    personalityEn: "Discreet, observant",
    descriptionEn: "The lynx is discreet, observant and blessed with remarkable intuition: he speaks little but notices everything. Independent and thoughtful, he analyses before acting and isn't easily swayed. He hates manipulation, grants his trust cautiously and then shows remarkable loyalty.",
    traitsEn: ["Intuitive", "Independent", "Faithful"],
  },
  orque: {
    nameEn: "Orca",
    personalityEn: "Charismatic, strategist",
    descriptionEn: "The orca is charismatic, powerful and deeply attached to her inner circle. Intelligent and strategic, she thinks several moves ahead and knows how to take the lead. She fiercely protects those she loves, admires loyalty and is merciless toward betrayal.",
    traitsEn: ["Powerful", "Loyal", "Protective"],
  },
  castor: {
    nameEn: "Beaver",
    personalityEn: "Hardworking, methodical",
    descriptionEn: "The beaver is hardworking, methodical and incredibly persevering: he loves to build, organise and see the concrete result of his efforts. Patient and provident, he prepares the future rather than relying on luck. Reliable and responsible, he hides an iron will beneath his calm.",
    traitsEn: ["Persevering", "Reliable", "Provident"],
  },
  tatou: {
    nameEn: "Armadillo",
    personalityEn: "Cautious, reserved",
    descriptionEn: "The armadillo is cautious, reserved and driven by a strong instinct to protect himself: he grants his trust only gradually. Thoughtful and discreet, he observes a lot before deciding and values security and sincere relationships. Behind his shell hides a sensitive nature, generous toward those who have earned it.",
    traitsEn: ["Discreet", "Protective", "Hardy"],
  },
  "raton-laveur": {
    nameEn: "Raccoon",
    personalityEn: "Clever, curious",
    descriptionEn: "The raccoon is clever, curious and resourceful, always looking for original solutions. Sociable and charming, he easily earns sympathy and keeps a playful, creative spirit. He loves freedom and adventure but bears excessive routine and rules he finds pointless poorly.",
    traitsEn: ["Ingenious", "Sociable", "Creative"],
  },
  zebre: {
    nameEn: "Zebra",
    personalityEn: "Original, independent",
    descriptionEn: "The zebra is original, independent and proud of his uniqueness: he refuses to blend into the crowd. Sociable without being easily swayed, he likes to belong to a group while keeping his individuality. Brave and loyal, he values authenticity and hides an honest personality attached to his principles.",
    traitsEn: ["Proud", "Brave", "Loyal"],
  },
  antilope: {
    nameEn: "Antelope",
    personalityEn: "Quick, elegant",
    descriptionEn: "The antelope is quick, elegant and always on the move, with an alert mind that seizes opportunities before others. Cautious yet brave, she weighs risks without giving up her ambitions. Sociable and sensitive to her environment, she sidesteps tension with intelligence and grace.",
    traitsEn: ["Alert", "Cautious", "Graceful"],
  },
  bison: {
    nameEn: "Bison",
    personalityEn: "Strong, steady",
    descriptionEn: "The bison is strong, steady and deeply rooted in his values, hard to unsettle. He moves at his own pace, with patience and perseverance, without trying to impress. Very protective, he hides beneath his calm a silent power and courage, and stays unbending once his mind is made up.",
    traitsEn: ["Calm", "Protective", "Persevering"],
  },
  loutre: {
    nameEn: "Otter",
    personalityEn: "Joyful, energetic",
    descriptionEn: "The otter is joyful, intelligent and full of energy, finding pleasure in the small things of everyday life. Sociable and warm, she quickly builds bonds and brings good cheer around her. Curious and gifted with great emotional intelligence, she is faithful and protective toward those who matter.",
    traitsEn: ["Sociable", "Curious", "Faithful"],
  },
  hippopotame: {
    nameEn: "Hippopotamus",
    personalityEn: "Calm, powerful",
    descriptionEn: "The hippo is calm in appearance but has an impressive strength of character. Patient and thoughtful, he avoids conflict to save his energy but reacts with formidable determination when his loved ones are threatened. Loyal and protective, he hides a sensitive nature beneath his robust look.",
    traitsEn: ["Patient", "Loyal", "Protective"],
  },
  "porc-epic": {
    nameEn: "Porcupine",
    personalityEn: "Independent, cautious",
    descriptionEn: "The porcupine is independent, cautious and very attached to his personal space: he doesn't grant trust easily. Behind his defensive appearance hides a sensitive, generous heart that refuses to be manipulated. Thoughtful and persevering, he reveals a warm personality once he feels safe.",
    traitsEn: ["Reserved", "Sensitive", "Persevering"],
  },
  "panda-roux": {
    nameEn: "Red Panda",
    personalityEn: "Gentle, charming",
    descriptionEn: "The red panda is gentle, charming and full of subtlety, drawing people in through kindness rather than force. Curious and intelligent, he explores new ideas while keeping his independence. Sensitive to the mood around him, he seeks harmony and moves toward his goals with quiet determination.",
    traitsEn: ["Discreet", "Curious", "Independent"],
  },
  tapir: {
    nameEn: "Tapir",
    personalityEn: "Peaceful, thoughtful",
    descriptionEn: "The tapir is peaceful, thoughtful and deeply attached to his inner balance, preferring to move with caution. Discreet and humble, he doesn't seek the spotlight, but his seriousness and reliability end up being noticed. Kind, he favours dialogue and shows loyalty once his trust is given.",
    traitsEn: ["Discreet", "Humble", "Reliable"],
  },
  wombat: {
    nameEn: "Wombat",
    personalityEn: "Solid, determined",
    descriptionEn: "The wombat is solid, determined and surprisingly persevering: he moves at his own pace without being swayed. Pragmatic and down-to-earth, he prefers actions to big words and values stability. Protective, he offers discreet but reliable support and reveals an unexpected humour to those who know him.",
    traitsEn: ["Pragmatic", "Persevering", "Protective"],
  },
  tarsier: {
    nameEn: "Tarsier",
    personalityEn: "Sharp, observant",
    descriptionEn: "The tarsier is sharp-witted, curious and extremely observant: almost nothing escapes him. Discreet and thoughtful, he prefers to listen before speaking so he can judge situations fairly. Creative and adaptable, he enjoys deep conversations and shows remarkable focus when a goal excites him.",
    traitsEn: ["Curious", "Thoughtful", "Creative"],
  },
  emeu: {
    nameEn: "Emu",
    personalityEn: "Energetic, independent",
    descriptionEn: "The emu is energetic, independent and always ready to move forward, preferring action to long hesitation. Curious and adaptable, he finds his way even in the unexpected and refuses unjustified limits. Blessed with great endurance, he bounces back after setbacks and throws himself with enthusiasm into what he believes in.",
    traitsEn: ["Curious", "Adaptable", "Enduring"],
  },
  dinde: {
    nameEn: "Turkey",
    personalityEn: "Sociable, expressive",
    descriptionEn: "The turkey is sociable, expressive and very attached to her circle, loving to share her emotions and ideas. Generous and caring, she often looks after others' well-being before her own and values recognition. Loyal and sincere, she bears contempt and unfair criticism poorly, as they wound her deeply.",
    traitsEn: ["Generous", "Caring", "Loyal"],
  },
  mouflon: {
    nameEn: "Mouflon",
    personalityEn: "Proud, sturdy",
    descriptionEn: "The mouflon is proud, sturdy and deeply attached to his independence: he loves rising to challenges without backing down. Brave and determined, he faces obstacles head-on and has a strong sense of honour. Loyal to those who have earned his trust, he bears cowardice and manipulation poorly.",
    traitsEn: ["Brave", "Determined", "Loyal"],
  },
  gerboise: {
    nameEn: "Jerboa",
    personalityEn: "Quick, ingenious",
    descriptionEn: "The jerboa is quick, ingenious and resourceful: sharp-minded, she finds solutions where others see obstacles. Curious and enthusiastic, her optimism lets her bounce back easily after disappointments. Sociable but independent, she admires creativity and quickly tires of routine and pessimism.",
    traitsEn: ["Quick", "Curious", "Optimistic"],
  },
  rhinoceros: {
    nameEn: "Rhinoceros",
    personalityEn: "Powerful, determined",
    descriptionEn: "The rhinoceros is powerful, determined and hard to divert from his goals, moving forward with constancy. Calm and reserved, he feels no need to prove his worth and places great importance on loyalty. Protective toward his own, he hides a quiet sensitivity, but his reaction can be formidable if he feels betrayed.",
    traitsEn: ["Constant", "Loyal", "Protective"],
  },
  lycaon: {
    nameEn: "African Wild Dog",
    personalityEn: "Dynamic, supportive",
    descriptionEn: "The African wild dog is dynamic, supportive and deeply attached to team spirit, aware of the importance of cooperation. Sociable and communicative, he easily builds bonds and likes to feel useful within a group. Brave and faithful, he understands everyone's motivations but bears selfishness and betrayal poorly.",
    traitsEn: ["Sociable", "Brave", "Faithful"],
  },
  ecureuil: {
    nameEn: "Squirrel",
    personalityEn: "Lively, enthusiastic",
    descriptionEn: "The squirrel is lively, enthusiastic and full of initiative, always on the move to explore new possibilities. Curious and resourceful, he finds creative solutions and thinks ahead with foresight. Sociable and warm, he hides great determination beneath his liveliness and tires of inaction and pessimism.",
    traitsEn: ["Curious", "Provident", "Resourceful"],
  },
  axolotl: {
    nameEn: "Axolotl",
    personalityEn: "Calm, singular",
    descriptionEn: "The axolotl is calm, singular and deeply adaptable: he evolves at his own pace, true to who he is. Curious and imaginative, he sees the world differently and finds unexpected solutions. Kind, he avoids conflict, overcomes trials with resilience and offers a discreet but deep loyalty.",
    traitsEn: ["Adaptable", "Imaginative", "Kind"],
  },
  saimiri: {
    nameEn: "Squirrel Monkey",
    personalityEn: "Lively, clever",
    descriptionEn: "The squirrel monkey is lively, clever and bursting with energy, loving to learn, explore and take on new challenges. Sociable and communicative, he easily makes friends thanks to his playful spirit and humour. Quick-witted and observant, he throws himself in with contagious energy and naturally draws others along.",
    traitsEn: ["Curious", "Sociable", "Ingenious"],
  },
  okapi: {
    nameEn: "Okapi",
    personalityEn: "Discreet, authentic",
    descriptionEn: "The okapi is discreet, elegant and deeply authentic: he seeks neither to impress nor to follow the crowd. Observant and thoughtful, he takes time to understand before acting and senses what others feel. Behind his reserve hides a silent determination and exceptional loyalty.",
    traitsEn: ["Observant", "Thoughtful", "Loyal"],
  },
  glouton: {
    nameEn: "Wolverine",
    personalityEn: "Fearless, tenacious",
    descriptionEn: "The wolverine is fearless, tenacious and blessed with an extraordinary will: the harder a challenge, the more it fuels his determination. Independent and brave, he relies on his own strength and adapts to the most demanding situations. Deeply loyal, he admires perseverance and honesty but despises cowardice.",
    traitsEn: ["Brave", "Independent", "Loyal"],
  },
  zibeline: {
    nameEn: "Sable",
    personalityEn: "Elegant, quick",
    descriptionEn: "The sable is elegant, discreet and blessed with a particularly sharp mind, acting with finesse rather than force. Observant and intuitive, she quickly reads others' intentions and is rarely fooled. Independent yet faithful, she pursues her goals with patience, discretion and an efficiency that goes unnoticed.",
    traitsEn: ["Sharp", "Intuitive", "Faithful"],
  },
  capybara: {
    nameEn: "Capybara",
    personalityEn: "Peaceful, unifying",
    descriptionEn: "The capybara is peaceful, kind and naturally unifying: he puts others at ease and creates an atmosphere of trust. Patient and tolerant, he listens before judging and prefers dialogue to confrontation. Beneath his calm hides great resilience, and he offers his friendship with a loyalty that inspires lastingly.",
    traitsEn: ["Kind", "Patient", "Sociable"],
  },
  pangolin: {
    nameEn: "Pangolin",
    personalityEn: "Reserved, thoughtful",
    descriptionEn: "The pangolin is reserved, thoughtful and deeply attached to his balance, preferring caution to impulsiveness. Discreet, he lets his actions speak for him and fiercely protects his privacy. Faithful to his values, he reveals a warm personality and a surprising strength of character once he feels safe.",
    traitsEn: ["Cautious", "Discreet", "Faithful"],
  },
  morse: {
    nameEn: "Walrus",
    personalityEn: "Composed, reliable",
    descriptionEn: "The walrus is composed, reliable and blessed with great inner strength: he commands respect without having to impose himself. Patient and protective, he watches over those he loves and settles conflicts calmly. Behind his imposing look hides a warm, loyal personality that bears injustice and abuses of power poorly.",
    traitsEn: ["Patient", "Protective", "Loyal"],
  },
  narval: {
    nameEn: "Narwhal",
    personalityEn: "Mysterious, intuitive",
    descriptionEn: "The narwhal is mysterious, intuitive and deeply original: he prefers to chart his own course discreetly. Thoughtful and imaginative, he has great inner richness and a unique way of seeing the world. Behind his reserve hides great sensitivity and unwavering loyalty toward those who earn his trust.",
    traitsEn: ["Original", "Thoughtful", "Faithful"],
  },
  binturong: {
    nameEn: "Binturong",
    personalityEn: "Peaceful, wise",
    descriptionEn: "The binturong is peaceful, independent and full of wisdom: he moves without haste, observing before acting. Highly adaptable, he finds his place in the most varied environments without losing his authenticity. He favours simple, sincere relationships and shows great perseverance in reaching his goals.",
    traitsEn: ["Adaptable", "Persevering", "Authentic"],
  },
  fossa: {
    nameEn: "Fossa",
    personalityEn: "Bold, determined",
    descriptionEn: "The fossa is bold, quick-witted and extremely determined, ready to leave her comfort zone to reach her goals. Intelligent and strategic, she quickly analyses a situation before acting with precision. She admires courage, autonomy and frankness, but tolerates neither manipulation nor cowardice.",
    traitsEn: ["Quick", "Strategist", "Frank"],
  },
  kinkajou: {
    nameEn: "Kinkajou",
    personalityEn: "Joyful, affectionate",
    descriptionEn: "The kinkajou is joyful, affectionate and full of curiosity: he loves to create a warm atmosphere and sees the bright side of things. Sociable and generous, he enjoys moments of sharing and knows how to put others at ease. Behind his playful nature hide great emotional intelligence and sincere loyalty.",
    traitsEn: ["Curious", "Sociable", "Faithful"],
  },
  serval: {
    nameEn: "Serval",
    personalityEn: "Elegant, attentive",
    descriptionEn: "The serval is elegant, attentive and particularly observant: he rarely acts in haste and waits for the right moment. Independent and self-assured, he has great control over his emotions. He appreciates discreet, competent and honest people, but keeps his distance from the arrogant or the unpredictable.",
    traitsEn: ["Observant", "Independent", "Self-possessed"],
  },
  caracal: {
    nameEn: "Caracal",
    personalityEn: "Ambitious, brave",
    descriptionEn: "The caracal is ambitious, brave and very reactive: he loves taking on challenges deemed impossible with remarkable self-confidence. Quick-witted, he often makes the right decisions under pressure. Behind his assertive temperament hides a deep loyalty toward those who earn his respect.",
    traitsEn: ["Reactive", "Confident", "Loyal"],
  },
  quokka: {
    nameEn: "Quokka",
    personalityEn: "Optimistic, kind",
    descriptionEn: "The quokka is optimistic, kind and naturally positive: he spreads good cheer effortlessly and reassures those around him. Sociable and open-minded, he values simple, sincere and non-judgemental relationships. Behind his smile hides a fine mental strength that lets him overcome hardship without losing hope.",
    traitsEn: ["Positive", "Sociable", "Resilient"],
  },
  pika: {
    nameEn: "Pika",
    personalityEn: "Hardworking, provident",
    descriptionEn: "The pika is hardworking, organised and provident: he always prepares the future seriously while enjoying the present moment. Curious and persevering, he learns quickly and doesn't shy away from effort. He values stability and well-built plans but quickly tires of disorder and constant improvisation.",
    traitsEn: ["Organised", "Curious", "Persevering"],
  },
  coati: {
    nameEn: "Coati",
    personalityEn: "Lively, sociable",
    descriptionEn: "The coati is lively, sociable and bursting with energy: always curious, he loves meeting new people and taking on varied challenges. Resourceful and creative, he easily finds solutions to everyday problems. He enjoys humour, spontaneity and authentic relationships, but quickly gets bored in a too-rigid routine.",
    traitsEn: ["Curious", "Resourceful", "Creative"],
  },
  "aye-aye": {
    nameEn: "Aye-aye",
    personalityEn: "Original, intuitive",
    descriptionEn: "The aye-aye is original, intuitive and deeply creative: he sees possibilities where others notice nothing and dares to think differently. Reserved but curious, he prefers to observe before acting. He values intellectual freedom and open minds but quickly distances himself from prejudice and superficial judgement.",
    traitsEn: ["Creative", "Reserved", "Curious"],
  },
  goral: {
    nameEn: "Goral",
    personalityEn: "Cautious, brave",
    descriptionEn: "The goral is cautious, brave and very persevering: he progresses step by step without being discouraged by obstacles. His calm lets him make good decisions even in tricky situations. He respects humble, honest and steady people, but bears haste and arrogance poorly.",
    traitsEn: ["Persevering", "Calm", "Humble"],
  },
  saiga: {
    nameEn: "Saiga",
    personalityEn: "Adaptable, hardy",
    descriptionEn: "The saiga is adaptable, hardy and always ready to face change, adjusting to circumstances without denying his values. Optimistic and brave, he moves forward despite difficulties without losing faith in the future. He appreciates sincere and supportive people but is wary of opportunistic behaviour.",
    traitsEn: ["Optimistic", "Brave", "Faithful"],
  },
  takin: {
    nameEn: "Takin",
    personalityEn: "Steady, protective",
    descriptionEn: "The takin is steady, protective and deeply reliable: he moves with patience, preferring lasting results to quick wins. Very attached to his family, he offers constant support without expecting recognition. He admires loyalty, courage and simplicity, but can't stand betrayal or pretence.",
    traitsEn: ["Patient", "Reliable", "Loyal"],
  },
  galago: {
    nameEn: "Galago",
    personalityEn: "Lively, imaginative",
    descriptionEn: "The galago is lively, intuitive and full of imagination: always curious, he learns quickly and adapts easily to new situations. His contagious enthusiasm brings positive energy to those around him. He enjoys creative minds, adventures and stimulating exchanges, but quickly tires of monotony.",
    traitsEn: ["Curious", "Adaptable", "Enthusiastic"],
  },
  dugong: {
    nameEn: "Dugong",
    personalityEn: "Gentle, peaceful",
    descriptionEn: "The dugong is gentle, peaceful and deeply kind: he seeks harmony and builds solid rather than superficial relationships. Patient and attentive, he inspires trust through his calm, reassuring presence. He appreciates sincere and generous people but naturally keeps away from conflict and dishonesty.",
    traitsEn: ["Kind", "Patient", "Sincere"],
  },
  "loris-lent": {
    nameEn: "Slow Loris",
    personalityEn: "Thoughtful, patient",
    descriptionEn: "The slow loris can't stand having a pace imposed on him: thoughtful to a fault, he prefers to analyse at length rather than decide badly. With almost inexhaustible patience, he is very selective in his relationships and gives absolute trust to a small circle. Discreet, he surprises with his sharp mind, his humour and his ability to see what others overlook.",
    traitsEn: ["Selective", "Sharp", "Observant"],
  },
};

let updated = 0;
const missing = [];

const result = seeds.map((seed) => {
  const t = TRANSLATIONS[seed.id];
  if (!t) {
    missing.push(seed.id);
    return seed;
  }
  updated += 1;
  return {
    ...seed,
    nameEn: t.nameEn,
    personalityEn: t.personalityEn,
    descriptionEn: t.descriptionEn,
    traitsEn: t.traitsEn,
  };
});

fs.writeFileSync(seedsPath, JSON.stringify(result, null, 2) + '\n', 'utf8');

console.log(`Added English translations to ${updated}/${seeds.length} animal(s).`);
if (missing.length) {
  console.log(`No translation found for ${missing.length}: ${missing.join(', ')}`);
}
