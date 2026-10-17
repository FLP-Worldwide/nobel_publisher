const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createRequire } = require('node:module');
const { before, test } = require('node:test');
const { NextRequest } = require('next/server');
const { encode } = require('next-auth/jwt');
const { transform } = require('next/dist/build/swc');

const secret = 'isolated-middleware-regression-secret';
let middleware, loginDestination;
before(async () => {
  process.env.NEXTAUTH_SECRET = secret;
  // NextAuth normalizes this to HTTPS when it creates cookies, but getToken's
  // default cookie detection does not. Reproduce the production mismatch.
  process.env.NEXTAUTH_URL = 'nobelbooks.vercel.app';
  process.env.VERCEL = '1';
  const filename = resolve(__dirname, '../src/middleware.js');
  const { code } = await transform(readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' },
    module: { type: 'commonjs' },
  });
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', code)(createRequire(filename), loaded, loaded.exports);
  middleware = loaded.exports.middleware;
  const redirectFile = resolve(__dirname, '../src/utils/loginRedirect.js');
  const redirectCode = await transform(readFileSync(redirectFile, 'utf8'), {
    filename: redirectFile, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const redirectModule = { exports: {} };
  new Function('module', 'exports', redirectCode.code)(redirectModule, redirectModule.exports);
  loginDestination = redirectModule.exports.loginDestination;
});

async function request(path, { role = 'author', signedIn = true, protocol = 'https:', chunked = false, invalid = false } = {}) {
  const url = `${protocol}//nobelbooks.vercel.app${path}`;
  const headers = {};
  if (signedIn) {
    const value = invalid ? 'invalid-session' : await encode({ secret, token: { id: 123, role }, maxAge: 3600 });
    const name = `${protocol === 'https:' ? '__Secure-' : ''}next-auth.session-token`;
    const half = Math.floor(value.length / 2);
    headers.cookie = chunked ? `${name}.0=${value.slice(0, half)}; ${name}.1=${value.slice(half)}` : `${name}=${value}`;
  }
  return middleware(new NextRequest(url, { headers }));
}

test('HTTPS author session opens the dashboard with a scheme-less NEXTAUTH_URL', async () => {
  const response = await request('/author-dashboard');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
});

test('chunked HTTPS sessions open protected writing pages', async () => {
  assert.equal((await request('/write/tool', { chunked: true })).status, 200);
});

test('a signed-in author leaves the login page for the dashboard', async () => {
  const response = await request('/login');
  assert.equal(new URL(response.headers.get('location')).pathname, '/author-dashboard');
});

test('missing and invalid sessions still redirect to login', async () => {
  for (const options of [{ signedIn: false }, { invalid: true }]) {
    const response = await request('/author-dashboard', options);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get('location')).pathname, '/login');
  }
});

test('reader and administrator access rules remain enforced', async () => {
  const reader = await request('/author-dashboard', { role: 'buyer' });
  assert.equal(new URL(reader.headers.get('location')).pathname, '/account');
  const author = await request('/admin');
  assert.equal(new URL(author.headers.get('location')).pathname, '/author-dashboard');
  assert.equal((await request('/admin', { role: 'admin' })).status, 200);
});

test('HTTP development still reads its non-secure session cookie', async () => {
  assert.equal((await request('/author-dashboard', { protocol: 'http:' })).status, 200);
});

test('HTTPS does not accept an unprefixed session cookie', async () => {
  const value = await encode({ secret, token: { id: 123, role: 'author' }, maxAge: 3600 });
  const response = await middleware(new NextRequest('https://nobelbooks.vercel.app/author-dashboard', {
    headers: { cookie: `next-auth.session-token=${value}` },
  }));
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get('location')).pathname, '/login');
});


test('reader and author login return to checkout or payment verification', () => {
  assert.equal(loginDestination('buyer', '/checkout'), '/checkout');
  const callback = '/payment/callback?flow=order&orderId=42';
  for (const role of ['buyer', 'author']) assert.equal(loginDestination(role, callback), callback);
  assert.equal(loginDestination('admin', null), '/admin');
});

test('login rejects external, backslash and control-character redirects', () => {
  for (const destination of ['https://example.test', '//example.test', '/\\example.test', '/\n/example.test', '/login', '/buyer/login?callbackUrl=/checkout']) {
    assert.equal(loginDestination('buyer', destination), '/account', JSON.stringify(destination));
  }
});
