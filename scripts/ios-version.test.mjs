import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function fixture(t, project) {
  const root = mkdtempSync(join(tmpdir(), 'animal-ios-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'ios/App/App.xcodeproj'), { recursive: true });
  mkdirSync(join(root, 'android'));
  copyFileSync(new URL('./ios-version.mjs', import.meta.url), join(root, 'scripts/ios-version.mjs'));
  writeFileSync(join(root, 'ios-release.json'), JSON.stringify({ bundleId: 'com.animalrencontre.app', version: '1.1', build: '5' }));
  const path = join(root, 'ios/App/App.xcodeproj/project.pbxproj');
  writeFileSync(path, project);
  writeFileSync(join(root, 'android/build.gradle'), 'versionCode 5; versionName "1.0.4"');
  return { root, path, run: (...args) => spawnSync(process.execPath, [join(root, 'scripts/ios-version.mjs'), ...args], { encoding: 'utf8' }) };
}

const configuration = 'PRODUCT_BUNDLE_IDENTIFIER = com.animalrencontre.app;\nMARKETING_VERSION = 1.0;\nCURRENT_PROJECT_VERSION = 1;\n';

test('updates Debug and Release, preserves Android and is idempotent', (t) => {
  const f = fixture(t, configuration.repeat(2));
  assert.equal(f.run('--check').status, 1);
  assert.equal(f.run().status, 0);
  const updated = readFileSync(f.path, 'utf8');
  assert.equal((updated.match(/MARKETING_VERSION = 1.1;/g) || []).length, 2);
  assert.equal((updated.match(/CURRENT_PROJECT_VERSION = 5;/g) || []).length, 2);
  assert.equal(f.run('--check').status, 0);
  assert.equal(f.run().status, 0);
  assert.equal(readFileSync(f.path, 'utf8'), updated);
  assert.equal(readFileSync(join(f.root, 'android/build.gradle'), 'utf8'), 'versionCode 5; versionName "1.0.4"');
});

test('rejects an unexpected Bundle ID without writing', (t) => {
  const project = configuration.replace('com.animalrencontre.app', 'com.other.app');
  const f = fixture(t, project);
  assert.equal(f.run().status, 1);
  assert.equal(readFileSync(f.path, 'utf8'), project);
});

test('rejects an incomplete project without writing', (t) => {
  const project = configuration.replace('CURRENT_PROJECT_VERSION = 1;', '');
  const f = fixture(t, project);
  assert.equal(f.run().status, 1);
  assert.equal(readFileSync(f.path, 'utf8'), project);
});
