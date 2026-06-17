import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectId = process.env.FIREBASE_PROJECT_ID || 'rencontre-animal';
const seedsPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');
const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();
const batch = db.batch();

seeds.forEach((seed, index) => {
  const { id, ...data } = seed;
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
console.log(`Seeded ${seeds.length} animals into Firestore (${projectId}).`);
