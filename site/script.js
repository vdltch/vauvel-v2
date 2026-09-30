// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('mobile-menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
  document.body.style.overflow = open ? '' : 'hidden';
});
menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') { burger.click(); }
});

// Galerie filtrable
const photos = {
  voirie: 6, amenagement: 6, terrassement: 6, reseaux: 6,
};
const labels = { voirie: 'Voirie', amenagement: 'Aménagement', terrassement: 'Terrassement', reseaux: 'Réseaux' };
const items = [];
for (let i = 1; i <= 6; i++) {
  for (const cat of Object.keys(photos)) items.push({ cat, src: `img/${cat}-${i}.webp` });
}
const gallery = document.getElementById('gallery');
function renderGallery(filter) {
  gallery.innerHTML = '';
  items.filter((it) => filter === 'all' || it.cat === filter).slice(0, 12).forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<img src="${it.src}" alt="Réalisation ${labels[it.cat].toLowerCase()} TP Vauvelle" loading="lazy"><span>${labels[it.cat]}</span>`;
    b.addEventListener('click', () => openLightbox(it.src));
    gallery.appendChild(b);
  });
}
document.querySelectorAll('.filters button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    renderGallery(btn.dataset.filter);
  });
});
renderGallery('all');

// Lightbox
const lightbox = document.getElementById('lightbox');
function openLightbox(src) {
  lightbox.querySelector('img').src = src;
  lightbox.hidden = false;
  lightbox.querySelector('button').focus();
}
lightbox.addEventListener('click', (e) => { if (e.target !== lightbox.querySelector('img')) lightbox.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.hidden = true; });

// Mode capture (?capture) : pas d'animation, pour les visuels statiques
const capture = location.search.includes('capture');

// Compteurs
const fmt = (n, d) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const counters = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    counters.unobserve(target);
    const end = parseFloat(target.dataset.count);
    const d = +(target.dataset.decimals || 0);
    const suffix = target.dataset.suffix || '';
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1200, 1);
      target.textContent = fmt(end * (1 - Math.pow(1 - p, 3)), d) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
if (!capture && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-count]').forEach((el) => counters.observe(el));
}

// Apparition au scroll
const reveal = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (isIntersecting) { target.classList.add('in'); reveal.unobserve(target); }
  });
}, { rootMargin: '0px 0px -10% 0px' });
if (!capture) document.querySelectorAll('.section-head, .metier, .moyens-grid article, .eng-grid article, .intro-grid, .jobs a').forEach((el) => {
  el.classList.add('reveal');
  reveal.observe(el);
});

// Liens candidature -> pré-remplissage du formulaire
const form = document.getElementById('form');
document.querySelectorAll('[data-subject]').forEach((a) => {
  a.addEventListener('click', () => {
    form.querySelector('input[value="Candidat"]').checked = true;
    form.message.value = a.dataset.subject + '\n\n';
    setTimeout(() => form.message.focus(), 600);
  });
});

// Formulaire de devis (envoi via le client mail en attendant un back-end)
const note = form.querySelector('.form-note');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  ['nom', 'tel', 'message'].forEach((name) => {
    const f = form[name];
    const bad = !f.value.trim();
    f.classList.toggle('invalid', bad);
    if (bad) ok = false;
  });
  if (!ok) {
    note.textContent = 'Merci de compléter les champs marqués d\'un astérisque.';
    note.classList.remove('ok');
    return;
  }
  const data = new FormData(form);
  const travaux = data.getAll('travaux').join(', ') || 'Non précisé';
  const body = [
    `Profil : ${data.get('profil')}`,
    `Travaux : ${travaux}`,
    `Nom : ${data.get('nom')}`,
    `Commune : ${data.get('commune') || '-'}`,
    `Téléphone : ${data.get('tel')}`,
    `E-mail : ${data.get('email') || '-'}`,
    '',
    data.get('message'),
  ].join('\n');
  const subject = `Demande ${data.get('profil') === 'Candidat' ? 'de candidature' : 'de devis'} — ${data.get('nom')}`;
  window.location.href = `mailto:accueil@vauvelle.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = 'Merci ! Votre messagerie s\'ouvre pour finaliser l\'envoi.';
  note.classList.add('ok');
});

document.getElementById('year').textContent = new Date().getFullYear();
