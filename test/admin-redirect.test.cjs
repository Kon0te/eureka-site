const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
function redirect(href) {
  let result;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'admin/redirect.js'), 'utf8'), {
    URL, window: { location: { href, replace: (value) => { result = value; } } },
  });
  return result;
}
test('old administration redirects to the one canonical portal', () => {
  assert.equal(redirect('https://eureka-apps.fr/admin/#/marketing/connections'),
    'https://admin.eureka-apps.fr/#/marketing/connections');
  assert.equal(redirect('https://eureka-apps.fr/admin/login'),
    'https://admin.eureka-apps.fr/#/admin/login');
  assert.equal(redirect('https://eureka-apps.fr/invitation?code=example'), undefined);
});
test('redirect cannot select another host or transport session tokens', () => {
  assert.equal(redirect('https://eureka-apps.fr/admin/#//evil.invalid'),
    'https://admin.eureka-apps.fr/#/admin');
  assert.equal(redirect('https://eureka-apps.fr/admin/#/admin?access_token=secret&code=secret'),
    'https://admin.eureka-apps.fr/#/admin');
});
test('obsolete Flutter bundle is retired, with a scoped cache retirement worker', () => {
  assert.equal(fs.existsSync(path.join(root, 'admin/main.dart.js')), false);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8'), /flutter_bootstrap/);
  const worker = fs.readFileSync(path.join(root, 'admin/flutter_service_worker.js'), 'utf8');
  assert.match(worker, /registration.unregister/);
  assert.doesNotMatch(worker, /caches.keys/);
});
