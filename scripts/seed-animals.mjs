import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectId = process.env.FIREBASE_PROJECT_ID || 'rencontre-animal';
const seedsPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');
const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

const resolveServiceAccountKey = () => {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  const candidates = [
    path.join(__dirname, '../service-account.json'),
    path.join(__dirname, '../serviceAccountKey.json'),
    path.join(__dirname, 'service-account.json'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const hasApplicationDefaultCredentials = () => {
  const adcCandidates = [
    path.join(os.homedir(), 'AppData/Roaming/gcloud/application_default_credentials.json'),
    path.join(os.homedir(), '.config/gcloud/application_default_credentials.json'),
  ];

  return adcCandidates.some((candidate) => fs.existsSync(candidate));
};

const initAdmin = () => {
  if (admin.apps.length) {
    return true;
  }

  const keyPath = resolveServiceAccountKey();
  if (keyPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
    console.log(`Using service account key: ${keyPath}`);
    return true;
  }

  if (hasApplicationDefaultCredentials()) {
    admin.initializeApp({ projectId });
    console.log('Using Application Default Credentials (gcloud).');
    return true;
  }

  console.error(
    [
      '',
      'No Firebase credentials found — cannot write to Firestore.',
      '',
      'Choose ONE of the following before running "npm run animals:seed":',
      '',
      '  A) Service account key (recommended):',
      '     1. Firebase console > Project settings > Service accounts > Generate new private key',
      '     2. Save the JSON as "service-account.json" at the project root (already git-ignored),',
      '        OR set the env var GOOGLE_APPLICATION_CREDENTIALS to its full path.',
      '',
      '  B) gcloud Application Default Credentials:',
      '     gcloud auth application-default login --project ' + projectId,
      '',
    ].join('\n')
  );
  return false;
};

const run = async () => {
  if (!initAdmin()) {
    process.exit(1);
  }

  const db = admin.firestore();

  // Fields that may be customised directly in Firestore (e.g. a manually
  // uploaded image). We never overwrite them on an already-existing document.
  const PRESERVED_FIELDS = ['imageUrl'];

  const refs = seeds.map((seed) => db.collection('animals').doc(seed.id));
  const existingSnaps = refs.length ? await db.getAll(...refs) : [];
  const existingById = new Map(
    existingSnaps.map((snap) => [snap.id, snap.exists ? snap.data() || {} : null])
  );

  const batch = db.batch();
  let preservedCount = 0;

  seeds.forEach((seed, index) => {
    const { id, ...data } = seed;
    const existing = existingById.get(id);

    if (existing) {
      for (const field of PRESERVED_FIELDS) {
        if (existing[field] !== undefined && existing[field] !== null && existing[field] !== '') {
          delete data[field];
          preservedCount += 1;
        }
      }
    }

    const ref = db.collection('animals').doc(id);
    batch.set(
      ref,
      {
        ...data,
        active: data.active !== false,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : index,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
  console.log(`Seeded ${seeds.length} animal(s) into Firestore (${projectId}).`);
  if (preservedCount > 0) {
    console.log(`Preserved ${preservedCount} existing field value(s) (e.g. imageUrl) on existing documents.`);
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed animals:', error?.message || error);
    process.exit(1);
  });
