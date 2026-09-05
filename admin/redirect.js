(function () {
  'use strict';
  const current = new URL(window.location.href);
  if (!/^\/admin(?:\/|$)/.test(current.pathname)) return;
  const candidate = current.hash.startsWith('#/') ? current.hash.slice(1) : current.pathname;
  const route = /^\/(admin|marketing)(\/|\?|$)/.test(candidate) ? candidate : '/admin';
  const target = new URL(route, 'https://admin.eureka-apps.fr');
  // Never transport login tokens between the historical and canonical origins.
  for (const key of ['code', 'access_token', 'refresh_token', 'id_token', 'token', 'token_hash']) {
    target.searchParams.delete(key);
  }
  window.location.replace(`https://admin.eureka-apps.fr/#${target.pathname}${target.search}`);
}());
