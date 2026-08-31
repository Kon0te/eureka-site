(function () {
  'use strict';

  var current = new URL(window.location.href);
  var fragment = new URLSearchParams(current.hash.replace(/^#/, ''));
  var forwarded = new URLSearchParams();
  var rules = {
    code: { max: 2048, pattern: /^[A-Za-z0-9._~-]+$/ },
    error: { max: 80, pattern: /^[A-Za-z0-9_-]+$/ },
    error_code: { max: 80, pattern: /^[A-Za-z0-9_-]+$/ },
    error_description: { max: 256, pattern: /^[^\r\n]+$/ },
    sb_flow_id: { max: 128, pattern: /^[A-Za-z0-9._~-]+$/ },
    type: { max: 40, pattern: /^[A-Za-z0-9_-]+$/ }
  };

  Object.keys(rules).forEach(function (key) {
    var value = current.searchParams.get(key) || fragment.get(key);
    var rule = rules[key];
    if (value && value.length <= rule.max && rule.pattern.test(value)) {
      forwarded.set(key, value);
    }
  });

  // The one-time recovery code must not remain in browser history, referrers
  // or screenshots after it has been copied into the application deep link.
  window.history.replaceState(null, document.title, current.pathname);

  var button = document.getElementById('open-eureka');
  var message = document.getElementById('recovery-message');
  if (!button || !message) return;

  if (!forwarded.has('code') && !forwarded.has('error')) {
    button.removeAttribute('href');
    button.setAttribute('aria-disabled', 'true');
    message.textContent = 'Ce lien est incomplet ou a expiré. Revenez dans Eurêka et demandez un nouveau lien.';
    return;
  }

  button.href = 'fr.eurekaapps.eureka://reset-password?' + forwarded.toString();
}());
