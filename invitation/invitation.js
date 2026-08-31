(() => {
  'use strict';

  const rawCode = new URLSearchParams(window.location.search).get('code') ?? '';
  const code = rawCode.replace(/[^a-z0-9]/gi, '').toUpperCase();
  const valid = rawCode.length <= 32 && /^[A-Z0-9]{12}$/.test(code);
  const codeElement = document.querySelector('[data-invitation-code]');
  const helpElement = document.querySelector('[data-invitation-help]');
  const copyButton = document.querySelector('[data-copy-invitation]');
  if (!valid || !codeElement || !helpElement || !copyButton) return;

  codeElement.textContent = code;
  helpElement.textContent = 'Conserve ce code : Eurêka te le demandera après la création de ton compte.';
  copyButton.disabled = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copyButton.textContent = 'Code copié';
    } catch (_) {
      codeElement.setAttribute('tabindex', '-1');
      codeElement.focus();
      copyButton.textContent = 'Sélectionne le code';
    }
  });
})();
