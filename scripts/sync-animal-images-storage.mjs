import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectId = process.env.FIREBASE_PROJECT_ID || 'rencontre-animal';
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
const seedsPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');
const assetsRoot = path.join(__dirname, '../src/assets');

const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId,
    storageBucket: bucketName,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket(bucketName);

const extToContentType = (ext) => {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

const makeDownloadUrl = (objectPath, token) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;

let uploaded = 0;
let updated = 0;

for (const seed of seeds) {
  if (!seed.id || !seed.imageUrl) {
    continue;
  }

  if (!String(seed.imageUrl).startsWith('assets/animals/')) {
    continue;
  }

  const localPath = path.join(assetsRoot, seed.imageUrl.replace('assets/', ''));
  if (!fs.existsSync(localPath)) {
    console.warn(`Skip ${seed.id}: missing local file ${localPath}`);
    continue;
  }

  const ext = path.extname(localPath) || '.jpg';
  const objectPath = `animals/${seed.id}${ext}`;
  const token = crypto.randomUUID();

  await bucket.upload(localPath, {
    destination: objectPath,
    metadata: {
      contentType: extToContentType(ext),
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public,max-age=3600',
    },
  });
  uploaded += 1;

  const imageUrl = makeDownloadUrl(objectPath, token);
  await db.collection('animals').doc(seed.id).set(
    {
      imageUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  updated += 1;
}

console.log(`Uploaded ${uploaded} images to gs://${bucketName}/animals`);
console.log(`Updated ${updated} Firestore animals with imageUrl`);
