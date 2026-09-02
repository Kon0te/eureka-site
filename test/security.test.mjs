import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { inflateSync } from 'node:zlib';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const readBinary = (path) => readFileSync(new URL(`../${path}`, import.meta.url));

const decodePng = (path) => {
  const bytes = readBinary(path);
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG');

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  const compressed = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    const data = bytes.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === 'IDAT') compressed.push(data);
    offset += 12 + length;
    if (type === 'IEND') break;
  }

  assert.equal(bitDepth, 8, `${path} doit rester un PNG 8 bits`);
  assert.ok(colorType === 2 || colorType === 6, `${path} doit être RGB ou RGBA`);

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const scanlines = inflateSync(Buffer.concat(compressed));
  const pixels = Buffer.alloc(width * height * channels);
  let sourceOffset = 0;

  const paeth = (left, above, upperLeft) => {
    const estimate = left + above - upperLeft;
    const leftDistance = Math.abs(estimate - left);
    const aboveDistance = Math.abs(estimate - above);
    const upperLeftDistance = Math.abs(estimate - upperLeft);
    if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
    return aboveDistance <= upperLeftDistance ? above : upperLeft;
  };

  for (let y = 0; y < height; y += 1) {
    const filter = scanlines[sourceOffset];
    sourceOffset += 1;
    const rowStart = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = scanlines[sourceOffset + x];
      const left = x >= channels ? pixels[rowStart + x - channels] : 0;
      const above = y > 0 ? pixels[rowStart + x - stride] : 0;
      const upperLeft = y > 0 && x >= channels ? pixels[rowStart + x - stride - channels] : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + above;
      else if (filter === 3) value = raw + Math.floor((left + above) / 2);
      else if (filter === 4) value = raw + paeth(left, above, upperLeft);
      else assert.fail(`${path} utilise un filtre PNG inconnu (${filter})`);
      pixels[rowStart + x] = value & 0xff;
    }
    sourceOffset += stride;
  }

  const pixelAt = (x, y) => {
    const pixelOffset = (y * width + x) * channels;
    return {
      red: pixels[pixelOffset],
      green: pixels[pixelOffset + 1],
      blue: pixels[pixelOffset + 2],
      alpha: channels === 4 ? pixels[pixelOffset + 3] : 255,
    };
  };

  return { width, height, colorType, pixelAt };
};

const visibleBounds = (png, minimumAlpha = 24) => {
  let left = png.width;
  let top = png.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.pixelAt(x, y).alpha < minimumAlpha) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  assert.ok(right >= left && bottom >= top, 'Le logo doit contenir des pixels visibles');
  return { left, top, right, bottom };
};

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
  assert.ok(existsSync(new URL('../assets/branding/eureka-logo-wordmark.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/branding/eureka-social-card.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/icons/favicon.png', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/icons/apple-touch-icon.png', import.meta.url)));
  assert.match(home, /assets\/branding\/eureka-logo-full\.png/);
  assert.match(home, /assets\/branding\/eureka-social-card\.png/);
  assert.match(styles, /--color-bg: #0b1020/);
  assert.match(styles, /eureka-logo-sphere\.png/);
  assert.match(styles, /eureka-logo-wordmark\.png/);
  const bodyStyles = styles.match(/body \{[^}]+\}/s);
  assert.ok(bodyStyles);
  assert.match(bodyStyles[0], /background: var\(--color-bg\)/);
  assert.doesNotMatch(bodyStyles[0], /radial-gradient/);
  assert.match(styles, /\.hero::before[\s\S]+radial-gradient/);
  assert.doesNotMatch(home, /class="neural-sphere"|class="node"/);
  assert.doesNotMatch(styles, /\.neural-sphere|\.node\s*\{/);

  for (const pagePath of brandedPages) {
    const page = read(pagePath);
    assert.doesNotMatch(page, /favicon\.svg|#050b16/);
    assert.match(page, /favicon\.png/);
    assert.match(page, /apple-touch-icon\.png/);
  }
});

test('presentation logos are transparent and optically centered', () => {
  for (const path of [
    'assets/branding/eureka-logo-sphere.png',
    'assets/branding/eureka-logo-full.png',
    'assets/branding/eureka-logo-wordmark.png',
  ]) {
    const png = decodePng(path);
    assert.equal(png.colorType, 6, `${path} doit conserver un canal alpha réel`);
    assert.equal(png.pixelAt(0, 0).alpha, 0, `${path} ne doit pas embarquer de fond carré`);
    assert.equal(png.pixelAt(png.width - 1, png.height - 1).alpha, 0);

    const bounds = visibleBounds(png);
    const visibleCenterX = (bounds.left + bounds.right) / 2;
    const visibleCenterY = (bounds.top + bounds.bottom) / 2;
    assert.ok(Math.abs(visibleCenterX - (png.width - 1) / 2) <= png.width * 0.012, `${path} doit être centré horizontalement`);
    assert.ok(Math.abs(visibleCenterY - (png.height - 1) / 2) <= png.height * 0.012, `${path} doit être centré verticalement`);
  }
});

test('icons and social card use the exact application background', () => {
  for (const path of [
    'assets/icons/favicon.png',
    'assets/icons/apple-touch-icon.png',
    'assets/branding/eureka-social-card.png',
  ]) {
    const png = decodePng(path);
    const corner = png.pixelAt(0, 0);
    assert.deepEqual(corner, { red: 11, green: 16, blue: 32, alpha: 255 });
  }
});
