import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('password recovery keeps one-time codes out of browser history', () => {
  const page = read('auth/reset-password.html');
  const nestedPage = read('auth/reset-password/index.html');
  const script = read('auth/reset-password.js');

  for (const html of [page, nestedPage]) {
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.match(html, /src="\/auth\/reset-password\.js"/);
    assert.doesNotMatch(html, /<script>(.|\n)*URLSearchParams/);
  }

  assert.match(script, /history\.replaceState/);
  assert.match(script, /code: \{ max: 2048/);
  assert.doesNotMatch(script, /console\.(log|debug|info)/);
});

test('invitation renders only a bounded validated code', () => {
  const page = read('invitation/index.html');
  const script = read('invitation/invitation.js');

  assert.match(page, /Content-Security-Policy/);
  assert.match(page, /src="invitation\.js"/);
  assert.match(script, /rawCode\.length <= 32/);
  assert.match(script, /\^\[A-Z0-9\]\{12\}\$/);
  assert.match(script, /codeElement\.textContent = code/);
  assert.doesNotMatch(script, /innerHTML/);
  assert.match(page, /apps\.apple\.com\/app\/id6806642638/);
  assert.match(page, /play\.google\.com\/store\/apps\/details\?id=fr\.eurekaapps\.eureka/);
  assert.match(page, /nouveau compte Eurêka/);
  assert.match(page, /3ᵉ Moment terminé/);
});

test('home exposes the stable official store destinations', () => {
  const page = read('index.html');

  assert.match(page, /apps\.apple\.com\/app\/id6806642638/);
  assert.match(page, /play\.google\.com\/store\/apps\/details\?id=fr\.eurekaapps\.eureka/);
});

test('public pages use the validated Eurêka identity assets', () => {
  const home = read('index.html');
  const styles = read('styles.css');
  const brandedPages = [
    '404.html',
    'auth/reset-password.html',
    'conditions.html',
    'confidentialite.html',
    'confirmation-email.html',
    'contact.html',
    'invitation/index.html',
    'mentions-legales.html',
    'support.html',
    'suppression-compte.html',
  ];

  assert.ok(existsSync(new URL('../assets/branding/eureka-logo-full.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/branding/eureka-logo-sphere.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/icons/favicon.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/icons/apple-touch-icon.png', import.meta.url)));
  assert.match(home, /assets\/branding\/eureka-logo-full\.png/);
  assert.match(styles, /--color-bg: #0b1020/);
  assert.match(styles, /eureka-logo-sphere\.png/);
  assert.doesNotMatch(home, /class="neural-sphere"|class="node"/);
  assert.doesNotMatch(styles, /\.neural-sphere|\.node\s*\{/);

  for (const pagePath of brandedPages) {
    const page = read(pagePath);
    assert.doesNotMatch(page, /favicon\.svg|#050b16/);
    assert.match(page, /favicon\.png/);
    assert.match(page, /apple-touch-icon\.png/);
  }
});
