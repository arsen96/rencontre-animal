import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const release = JSON.parse(readFileSync(resolve(root, 'ios-release.json'), 'utf8'));
if (release.bundleId !== 'com.animalrencontre.app' ||
    !/^\d+\.\d+(\.\d+)?$/.test(release.version) || !/^[1-9]\d*$/.test(release.build)) {
  throw new Error('Invalid iOS release configuration.');
}
const project = resolve(root, 'ios/App/App.xcodeproj/project.pbxproj');
if (!existsSync(project)) {
  throw new Error('iOS project missing. On macOS run: npx cap add ios --packagemanager CocoaPods');
}
const original = readFileSync(project, 'utf8');
const identifiers = [...original.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = "?([^";]+)"?;/g)];
if (!identifiers.length || identifiers.some((match) => match[1] !== release.bundleId)) {
  throw new Error('Unexpected Bundle ID. No file was changed.');
}
for (const setting of ['MARKETING_VERSION', 'CURRENT_PROJECT_VERSION']) {
  if (!new RegExp(`${setting} = [^;]+;`).test(original)) {
    throw new Error(`Missing ${setting}. No file was changed.`);
  }
}
const updated = original
  .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${release.version};`)
  .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${release.build};`);
if (process.argv.includes('--check')) {
  if (updated !== original) throw new Error('iOS versions differ. Run npm run ios:version.');
} else if (updated !== original) {
  writeFileSync(project, updated);
}
console.log(`iOS ${release.bundleId}: ${release.version} (${release.build})`);
