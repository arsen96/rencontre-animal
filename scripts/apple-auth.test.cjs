// Unit tests with SDK mocks: these do not exercise Apple's UI, network or iOS SDK.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(options = {}) {
  const calls = [];
  const user = { uid: 'test-user', providerData: [{ providerId: 'apple.com' }] };
  const auth = { currentUser: user };
  const result = options.result || {
    user: { uid: 'test-user' },
    credential: { idToken: 'test-id-token', nonce: 'test-nonce', authorizationCode: 'test-code' },
  };
  const native = {
    signInWithApple: async (opts) => { calls.push(['nativeSignIn', opts.skipNativeAuth]); return result; },
    revokeAccessToken: async ({ token }) => {
      calls.push(['nativeRevoke', token]);
      if (options.revokeError) throw new Error('revocation failed');
    },
    signOut: async () => { calls.push(['nativeSignOut']); },
  };
  class OAuthProvider {
    credential(value) { return value; }
  }
  const mocks = {
    '@angular/core': { Injectable: () => (target) => target },
    '@angular/fire/auth': {
      authState: () => null,
      OAuthProvider,
      signInWithCredential: async (_, credential) => {
        calls.push(['webSignIn', credential.idToken, credential.rawNonce]);
        return { user };
      },
      reauthenticateWithCredential: async (_, credential) => {
        calls.push(['webReauth', credential.idToken, credential.rawNonce]);
        if (options.reauthError) throw new Error('reauth failed');
      },
    },
    '@capacitor/core': { Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' } },
    '@capacitor-firebase/authentication': { FirebaseAuthentication: native },
    rxjs: {},
  };
  const source = readFileSync(join(__dirname, '../src/app/core/services/auth.service.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      if (!mocks[name]) throw new Error(`Unexpected import: ${name}`);
      return mocks[name];
    },
  });
  return { service: new exports.AuthService(auth), calls };
}

test('iOS login uses native tokens with nonce and keeps JS authentication', async () => {
  const { service, calls } = setup();
  await service.loginWithApple();
  assert.deepEqual(calls, [['nativeSignIn', true], ['webSignIn', 'test-id-token', 'test-nonce']]);
});

test('iOS login rejects a missing nonce before Firebase sign-in', async () => {
  const { service, calls } = setup({ result: { credential: { idToken: 'test-id-token' } } });
  await assert.rejects(service.loginWithApple(), /nonce manquant/);
  assert.deepEqual(calls, [['nativeSignIn', true]]);
});

test('Apple deletion reauthenticates the same user, revokes, then closes native session', async () => {
  const { service, calls } = setup();
  await service.reauthenticate(true);
  assert.deepEqual(calls, [
    ['nativeSignIn', false], ['webReauth', 'test-id-token', 'test-nonce'],
    ['nativeRevoke', 'test-code'], ['nativeSignOut'],
  ]);
});

test('wrong Apple user prevents revocation and closes native session', async () => {
  const { service, calls } = setup({ result: {
    user: { uid: 'other-user' }, credential: { idToken: 'test-id-token', nonce: 'test-nonce', authorizationCode: 'test-code' },
  } });
  await assert.rejects(service.reauthenticate(true), /ne correspond pas/);
  assert.deepEqual(calls, [['nativeSignIn', false], ['nativeSignOut']]);
});

test('reauthentication failure prevents revocation and closes native session', async () => {
  const { service, calls } = setup({ reauthError: true });
  await assert.rejects(service.reauthenticate(true), /reauth failed/);
  assert.deepEqual(calls, [['nativeSignIn', false], ['webReauth', 'test-id-token', 'test-nonce'], ['nativeSignOut']]);
});

test('revocation failure propagates before account deletion and closes native session', async () => {
  const { service, calls } = setup({ revokeError: true });
  await assert.rejects(service.reauthenticate(true), /revocation failed/);
  assert.deepEqual(calls.at(-1), ['nativeSignOut']);
});

test('ordinary reauthentication does not create a native Firebase session', async () => {
  const { service, calls } = setup();
  await service.reauthenticate();
  assert.deepEqual(calls, [['nativeSignIn', true], ['webReauth', 'test-id-token', 'test-nonce']]);
});
