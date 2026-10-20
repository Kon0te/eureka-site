/* Local interactive preview. No analytics, cookies, account or remote writes. */
(async function () {
  const feed = document.getElementById('discovery-feed');
  if (!feed) return;
  const previous = document.getElementById('previous-fact');
  const next = document.getElementById('next-fact');
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const safeLink = (title, url) => {
    const link = element('a', title);
    if (new URL(url, location.href).protocol !== 'https:') return link;
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  };
  try {
    const response = await fetch('assets/discoveries/preview.json');
    if (!response.ok) throw new Error('preview unavailable');
    const facts = await response.json();
    const fragment = document.createDocumentFragment();
    for (const fact of facts) {
      const card = element('article', '', 'fact-card');
      const photo = element('div', '', 'fact-photo');
      const img = element('img'); img.src = fact.imageAsset; img.alt = `Illustration : ${fact.category}`; img.loading = 'lazy';
      photo.append(img, element('span', fact.category, 'fact-category'));
      const copy = element('div', '', 'fact-copy'); copy.append(element('h3', fact.title), element('p', fact.body));
      const tools = element('div', '', 'fact-tools');
      const credits = element('details'); credits.append(element('summary', 'Source & photo'));
      credits.append(safeLink(fact.sourceTitle, fact.sourceUrl), element('br'), element('span', `${fact.imageCredit} · ${fact.imageLicense}`), safeLink('Provenance de l’image ↗', fact.imageSourceUrl));
      const heart = element('button', '♡'); heart.type = 'button'; heart.setAttribute('aria-label', `Aimer « ${fact.title} » dans cet aperçu`); heart.setAttribute('aria-pressed', 'false');
      heart.addEventListener('click', () => { const liked = heart.getAttribute('aria-pressed') === 'true'; heart.setAttribute('aria-pressed', String(!liked)); heart.textContent = liked ? '♡' : '♥'; });
      tools.append(credits, heart);card.append(photo, copy, tools);fragment.append(card);
    }
    feed.replaceChildren(fragment);
    const cards = [...feed.children];
    const index = () => cards.reduce((best, card, i) => Math.abs(card.offsetTop - cards[0].offsetTop - feed.scrollTop) < Math.abs(cards[best].offsetTop - cards[0].offsetTop - feed.scrollTop) ? i : best, 0);
    const update = () => { previous.disabled = index() === 0; next.disabled = index() === cards.length - 1; };
    const move = (direction) => {
      const target = cards[Math.max(0, Math.min(cards.length - 1, index() + direction))];
      feed.scrollTo({top: target.offsetTop - cards[0].offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    previous.onclick = () => move(-1); next.onclick = () => move(1);
    feed.addEventListener('scroll', update, {passive:true});
    feed.addEventListener('keydown', e => { if (e.target === feed && ['ArrowUp','ArrowDown'].includes(e.key)) { e.preventDefault(); move(e.key === 'ArrowUp' ? -1 : 1); } });
    update();
  } catch (_) {
    feed.textContent = 'L’aperçu est momentanément indisponible. Retrouve les Découvertes dans l’application.';
    previous.disabled = true; next.disabled = true;
  }
}());
