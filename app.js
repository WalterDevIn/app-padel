const STORAGE_KEYS = {
  matches: 'app-padel:prototype-matches',
  splash: 'app-padel:splash-shown',
  activeView: 'app-padel:active-view'
};

const PERSISTENT_VIEWS = new Set(['home', 'discover', 'create', 'activity']);
const AVATAR_PALETTE = ['player-one', 'player-two', 'player-three', 'player-four'];
const COURT_POSITIONS = ['p1', 'p2', 'p3', 'p4'];

const PHOTO_CANDIDATES = {
  Walter: ['images/walter.webp', 'images/walter.jpg', 'images/walter.jpeg', 'images/walter.png', 'images/player-walter.webp', 'images/player-walter.jpg', 'images/player-1.webp', 'images/player-1.jpg', 'images/person-1.webp', 'images/person-1.jpg', 'images/profile-1.webp', 'images/profile-1.jpg', 'images/avatar-1.webp', 'images/avatar-1.jpg'],
  Martín: ['images/martin.webp', 'images/martin.jpg', 'images/martin.jpeg', 'images/martin.png', 'images/player-martin.webp', 'images/player-martin.jpg', 'images/player-2.webp', 'images/player-2.jpg', 'images/person-2.webp', 'images/person-2.jpg', 'images/profile-2.webp', 'images/profile-2.jpg', 'images/avatar-2.webp', 'images/avatar-2.jpg'],
  Camila: ['images/camila.webp', 'images/camila.jpg', 'images/camila.jpeg', 'images/camila.png', 'images/player-camila.webp', 'images/player-camila.jpg', 'images/player-3.webp', 'images/player-3.jpg', 'images/person-3.webp', 'images/person-3.jpg', 'images/profile-3.webp', 'images/profile-3.jpg', 'images/avatar-3.webp', 'images/avatar-3.jpg'],
  Florencia: ['images/florencia.webp', 'images/florencia.jpg', 'images/florencia.jpeg', 'images/florencia.png', 'images/player-florencia.webp', 'images/player-florencia.jpg', 'images/player-4.webp', 'images/player-4.jpg', 'images/person-4.webp', 'images/person-4.jpg', 'images/profile-4.webp', 'images/profile-4.jpg', 'images/avatar-4.webp', 'images/avatar-4.jpg']
};

const INITIAL_MATCHES = [
  { id: 'thursday-main', title: 'Partido del jueves', date: '2026-07-30', time: '21:00', duration: 90, location: 'Pádel Center', court: 'Cancha 3', category: '6.ª–7.ª', price: 8000, distance: 1.2, players: ['Walter', 'Martín', 'Lucas'], open: true, owner: 'Walter' },
  { id: 'mitre-open', title: 'Partido parejo en Mitre', date: '2026-07-24', time: '22:00', duration: 90, location: 'Match Point', court: 'Cancha 2', category: '6.ª', price: 7500, distance: 1.8, players: ['Martín', 'Lucas', 'Agustín'], open: true, owner: 'Martín' },
  { id: 'sunday-open', title: 'Domingo de pádel', date: '2026-07-26', time: '17:30', duration: 90, location: 'La Red', court: 'Cancha 1', category: '7.ª–8.ª', price: 6000, distance: 3.2, players: ['Juan', 'Florencia'], open: true, owner: 'Juan' },
  { id: 'monday-group', title: 'Partido con el grupo', date: '2026-07-27', time: '20:30', duration: 90, location: 'Arena Padel', court: 'Cancha 4', category: '6.ª–7.ª', price: 7000, distance: 2.4, players: ['Walter', 'Marcos', 'Nico', 'Sofía'], open: false, owner: 'Walter' }
];

const state = {
  matches: loadMatches(),
  currentMatchId: 'thursday-main',
  pendingCreatedMatchId: null,
  activeFilter: 'Todos',
  toastTimer: null
};

const photoCache = new Map();

const elements = {
  views: [...document.querySelectorAll('.view')],
  modal: document.querySelector('#successModal'),
  toast: document.querySelector('#toast'),
  discoverView: document.querySelector('[data-view="discover"]'),
  openList: document.querySelector('[data-view="discover"] .open-list'),
  miniMatchList: document.querySelector('.mini-match-list'),
  createForm: document.querySelector('.prototype-form'),
  matchView: document.querySelector('[data-view="match"]'),
  homeHero: document.querySelector('.hero-match'),
  debugSplashReset: document.querySelector('#debugSplashReset')
};

function initializeSplash() {
  const forceSplash = new URLSearchParams(window.location.search).get('splash') === '1';
  let hasBeenShown = false;

  try {
    hasBeenShown = sessionStorage.getItem(STORAGE_KEYS.splash) === 'true';
  } catch (error) {
    console.warn('No se pudo leer el estado de la pantalla de carga.', error);
  }

  if (hasBeenShown && !forceSplash) {
    document.documentElement.classList.remove('splash-expected');
    return;
  }

  const splash = document.createElement('div');
  splash.className = 'splash-screen';
  splash.setAttribute('role', 'status');
  splash.setAttribute('aria-label', 'Abriendo App Padel');
  splash.innerHTML = `
    <button class="splash-skip" type="button" aria-label="Saltar presentación">Saltar</button>
    <div class="splash-content">
      <div class="splash-logo" aria-hidden="true"><span class="splash-logo-mark"></span></div>
      <h1 class="splash-wordmark">PADEL</h1>
      <p class="splash-tagline">Armá el partido. Conseguí los cuatro.</p>
      <div class="splash-loader" aria-hidden="true"><span></span></div>
    </div>
  `;

  document.body.prepend(splash);
  document.body.classList.add('splash-active');

  try {
    sessionStorage.setItem(STORAGE_KEYS.splash, 'true');
  } catch (error) {
    console.warn('No se pudo guardar el estado de la pantalla de carga.', error);
  }

  let dismissed = false;
  let automaticDismissal;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(automaticDismissal);
    splash.classList.add('is-leaving');
    document.body.classList.remove('splash-active');
    document.removeEventListener('keydown', handleEscape);
    window.setTimeout(() => {
      splash.remove();
      document.documentElement.classList.remove('splash-expected');
    }, 620);
  };

  const handleEscape = event => {
    if (event.key === 'Escape') dismiss();
  };

  splash.querySelector('.splash-skip').addEventListener('click', dismiss);
  document.addEventListener('keydown', handleEscape);
  automaticDismissal = window.setTimeout(dismiss, 1650);
}

function createDesktopChrome() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'desktop-sidebar';
  sidebar.setAttribute('aria-label', 'Navegación de escritorio');
  sidebar.innerHTML = `
    <div class="desktop-brand"><span class="brand-mark"></span><span>PADEL</span></div>
    <nav class="desktop-nav">
      <button class="nav-item active" data-target="home"><svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg><span>Inicio</span></button>
      <button class="nav-item" data-target="discover"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><span>Buscar partidos</span></button>
      <button class="nav-item" data-target="activity"><svg viewBox="0 0 24 24"><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/></svg><span>Actividad</span></button>
      <button class="nav-item create-desktop" data-target="create"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>Crear partido</span></button>
    </nav>
    <div class="desktop-user"><button class="avatar" data-player="Walter" aria-label="Perfil de Walter">W</button><div><strong>Walter</strong><span>6.ª categoría</span></div></div>
  `;

  const rail = document.createElement('aside');
  rail.className = 'desktop-rail';
  rail.setAttribute('aria-label', 'Resumen del próximo partido');

  document.body.prepend(sidebar);
  document.body.appendChild(rail);
  elements.rail = rail;

  document.querySelectorAll('.topbar .avatar').forEach(avatar => {
    avatar.dataset.player = 'Walter';
  });
}

function loadMatches() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.matches));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch (error) {
    console.warn('No se pudieron cargar los partidos guardados.', error);
  }
  return structuredClone(INITIAL_MATCHES);
}

function saveMatches() {
  try {
    localStorage.setItem(STORAGE_KEYS.matches, JSON.stringify(state.matches));
  } catch (error) {
    console.warn('No se pudieron guardar los partidos.', error);
  }
}

function saveActiveView(viewName) {
  if (!PERSISTENT_VIEWS.has(viewName)) return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.activeView, viewName);
  } catch (error) {
    console.warn('No se pudo guardar la vista activa.', error);
  }
}

function getSavedView() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEYS.activeView);
    return PERSISTENT_VIEWS.has(saved) ? saved : 'home';
  } catch (error) {
    console.warn('No se pudo recuperar la vista activa.', error);
    return 'home';
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function initials(name) {
  return String(name).split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(dateString, options = { weekday: 'long', day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat('es-AR', options).format(new Date(`${dateString}T12:00:00`));
}

function openSlots(match) {
  return Math.max(0, 4 - match.players.length);
}

function statusMarkup(match, detailed = false) {
  const slots = openSlots(match);
  if (!slots) return '<span class="status-pill complete">Completo</span>';
  if (slots === 1) return `<span class="status-pill urgent"><i></i> Falta 1${detailed ? ' jugador' : ''}</span>`;
  return `<span class="status-pill waiting">${detailed ? `Faltan ${slots} jugadores` : `${slots} lugares`}</span>`;
}

function avatarMarkup(player, className = 'player-photo', extraClasses = '') {
  return `<span class="${className} ${extraClasses}" data-player="${escapeHtml(player)}">${escapeHtml(initials(player))}</span>`;
}

function renderPlayerStack(match, compact = false) {
  const players = match.players.map((player, index) => avatarMarkup(player, 'player-photo', AVATAR_PALETTE[index % AVATAR_PALETTE.length])).join('');
  const missing = Array.from({ length: openSlots(match) }, (_, index) => `<span class="player-photo missing">${index === 0 ? `+${openSlots(match)}` : '+'}</span>`).join('');
  return `<div class="player-stack${compact ? ' small' : ''}">${players}${missing}</div>`;
}

function getPrimaryHomeMatch() {
  const userMatches = state.matches
    .filter(match => match.players.includes('Walter') || match.owner === 'Walter')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return userMatches.find(match => match.id === state.currentMatchId)
    || userMatches.find(match => match.open && openSlots(match) > 0)
    || userMatches[0]
    || state.matches[0];
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('show'), 2200);
}

function showView(viewName, { persist = true } = {}) {
  if (viewName === 'profile') {
    showToast('El perfil queda fuera del foco de este prototipo');
    return;
  }

  elements.views.forEach(view => view.classList.toggle('active', view.dataset.view === viewName));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.target === viewName));
  if (persist) saveActiveView(viewName);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHomeHero() {
  const match = getPrimaryHomeMatch();
  if (!match) {
    elements.homeHero.innerHTML = '<div class="hero-topline"><span class="status-pill waiting">Sin partidos</span></div><div class="hero-date"><div><h2>Creá tu primer partido</h2><p>Organizalo y compartí la invitación.</p></div></div><button class="primary-button" data-target="create">Crear partido <span>→</span></button>';
    return;
  }

  const slots = openSlots(match);
  const date = new Date(`${match.date}T12:00:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', '').toUpperCase();
  const actionLabel = slots ? (slots === 1 ? 'Buscar cuarto jugador' : 'Completar partido') : 'Ver partido';

  elements.homeHero.innerHTML = `
    <div class="hero-topline">${statusMarkup(match, true)}<button class="more-button" aria-label="Más opciones">•••</button></div>
    <div class="hero-date"><div class="date-block"><strong>${day}</strong><span>${month}</span></div><div><h2>${escapeHtml(match.title)}</h2><p>${escapeHtml(match.time)} · ${match.duration || 90} minutos</p></div></div>
    <div class="court-row"><div class="court-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="20" rx="4"/><path d="M16 6v20M4 16h24"/></svg></div><div><strong>${escapeHtml(match.location)}</strong><span>${escapeHtml(match.court || 'Cancha a confirmar')}</span></div><button class="round-arrow" aria-label="Ver partido" data-view-match="${match.id}">↗</button></div>
    <div class="players-row">${renderPlayerStack(match)}<div class="player-copy"><strong>${match.players.length} de 4 confirmados</strong><span>${escapeHtml(match.category)}</span></div></div>
    <button class="primary-button" type="button" data-view-match="${match.id}">${actionLabel} <span>→</span></button>
    <div class="split-info"><span>$${Number(match.price || 0).toLocaleString('es-AR')} por persona</span><span>${slots ? 'Invitaciones abiertas' : 'Equipo confirmado'}</span></div>
  `;
}

function renderHomeMatches() {
  const userMatches = state.matches.filter(match => match.players.includes('Walter') || match.owner === 'Walter').slice(0, 4);
  elements.miniMatchList.innerHTML = userMatches.map(match => {
    const date = new Date(`${match.date}T12:00:00`);
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(date).replace('.', '').toUpperCase();
    return `<article class="mini-match card${match.created ? ' created-match' : ''}" data-view-match="${match.id}"><div class="mini-date"><strong>${day}</strong><span>${weekday}</span></div><div class="mini-copy"><strong>${escapeHtml(match.title)}</strong><span>${escapeHtml(match.time)} · ${escapeHtml(match.location)}</span></div>${statusMarkup(match)}</article>`;
  }).join('');
}

function renderDiscover() {
  const query = elements.discoverView.querySelector('#matchSearch')?.value.trim().toLowerCase() || '';
  const today = '2026-07-24';
  const filtered = state.matches.filter(match => {
    if (!match.open || !openSlots(match)) return false;
    const searchable = `${match.title} ${match.location} ${match.category}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesFilter = state.activeFilter === 'Todos'
      || (state.activeFilter === 'Hoy' && match.date === today)
      || (state.activeFilter === '6.ª–7.ª' && match.category.includes('6.ª'))
      || (state.activeFilter === 'A menos de 5 km' && match.distance <= 5);
    return matchesQuery && matchesFilter;
  });

  if (!filtered.length) {
    elements.openList.innerHTML = '<article class="empty-results card"><strong>No encontramos partidos</strong><span>Probá con otro nombre, club o filtro.</span></article>';
    return;
  }

  elements.openList.innerHTML = filtered.map(match => `
    <article class="open-match card${match.created ? ' created-match' : ''}" data-match-id="${match.id}">
      <div class="open-header">${statusMarkup(match)}<span>${match.distance.toFixed(1).replace('.', ',')} km</span></div>
      <h3>${escapeHtml(match.title)}</h3><p>${escapeHtml(formatDate(match.date))} · ${escapeHtml(match.time)} · ${escapeHtml(match.location)}</p>
      <div class="open-footer">${renderPlayerStack(match, true)}<div><strong>${escapeHtml(match.category)}</strong><span>$${match.price.toLocaleString('es-AR')} por persona</span></div><button class="secondary-button" type="button" data-view-match="${match.id}">Ver</button></div>
    </article>
  `).join('');
}

function renderRail() {
  const match = state.matches.find(item => item.id === state.currentMatchId) || state.matches[0];
  if (!match || !elements.rail) return;
  const slots = openSlots(match);

  elements.rail.innerHTML = `
    <section class="rail-card">
      <p class="eyebrow">Partido seleccionado</p><h3>${escapeHtml(formatDate(match.date, { weekday: 'long' }))} · ${escapeHtml(match.time)}</h3><p>${escapeHtml(match.location)} · ${escapeHtml(match.court || 'Cancha a confirmar')}</p>
      <div class="rail-progress"><span style="width:${match.players.length * 25}%"></span></div><div class="rail-caption"><span>${match.players.length} confirmados</span><span>${slots ? `Faltan ${slots}` : 'Completo'}</span></div>
      <div class="rail-players">${match.players.map((player, index) => `<div class="rail-player">${avatarMarkup(player, 'player-photo', AVATAR_PALETTE[index])}<div><strong>${escapeHtml(player)}</strong><span>${player === match.owner ? 'Organiza' : 'Confirmado'}</span></div></div>`).join('')}${slots ? `<div class="rail-player"><span class="player-photo missing">+</span><div><strong>${slots === 1 ? 'Lugar libre' : `${slots} lugares libres`}</strong><span>${escapeHtml(match.category)}</span></div></div>` : ''}</div>
      <button class="primary-button rail-action" type="button" data-view-match="${match.id}">${slots ? 'Ver y completar' : 'Ver partido'}</button>
    </section>
    <section class="rail-card rail-tip"><p class="eyebrow">Prototipo</p><strong>Los cambios se guardan en este navegador</strong><p>No se envía información a un servidor.</p></section>
  `;
}

function renderMatchDetail(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return;
  state.currentMatchId = match.id;
  const slots = openSlots(match);

  const courtPlayers = Array.from({ length: 4 }, (_, index) => {
    const player = match.players[index];
    return player ? avatarMarkup(player, 'court-player', COURT_POSITIONS[index]) : `<span class="court-player ${COURT_POSITIONS[index]}">?</span>`;
  }).join('');

  const roster = Array.from({ length: 4 }, (_, index) => {
    const player = match.players[index];
    if (!player) return '<div class="empty-player"><span class="player-photo missing">+</span><strong>Lugar libre</strong><em>Disponible</em></div>';
    return `<div>${avatarMarkup(player, 'player-photo', AVATAR_PALETTE[index])}<strong>${escapeHtml(player)}</strong><em>${player === match.owner ? 'Organiza' : 'Confirmado'}</em></div>`;
  }).join('');

  elements.matchView.querySelector('.match-heading').innerHTML = `${statusMarkup(match, true)}<h1>${escapeHtml(match.title)}</h1><p>${escapeHtml(formatDate(match.date))} · ${escapeHtml(match.time)} · ${escapeHtml(match.location)}</p>`;
  elements.matchView.querySelector('.court-visual').innerHTML = `<div class="court-line vertical"></div><div class="court-line horizontal"></div>${courtPlayers}`;
  elements.matchView.querySelector('.roster-card').innerHTML = `<div class="section-heading compact"><div><p class="eyebrow">Jugadores</p><h2>${match.players.length} confirmados</h2></div><span>${escapeHtml(match.category)}</span></div><div class="roster">${roster}</div>`;
  elements.matchView.querySelector('.share-card').innerHTML = `<div><span class="share-icon">↗</span><strong>${slots ? 'Compartí los lugares libres' : 'El partido está completo'}</strong><p>${slots ? `Quedan ${slots} ${slots === 1 ? 'lugar' : 'lugares'}. El enlace permite confirmar sin instalar nada.` : 'Ya están confirmados los cuatro jugadores.'}</p></div>${slots ? `<button class="primary-button join-button" type="button" data-join-match="${match.id}">${match.players.includes('Walter') ? 'Simular invitación' : 'Sumarme al partido'}</button>` : ''}<button class="secondary-button full" type="button" data-share-match="${match.id}">Compartir invitación</button>`;
  renderRail();
}

function renderAll() {
  renderHomeHero();
  renderHomeMatches();
  renderDiscover();
  renderRail();
  enhanceAvatars();
}

function ensureSearchInput() {
  if (elements.discoverView.querySelector('#matchSearch')) return;
  const search = document.createElement('label');
  search.className = 'match-search';
  search.innerHTML = '<input id="matchSearch" type="search" placeholder="Buscar por partido, club o categoría" aria-label="Buscar partidos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
  elements.discoverView.querySelector('.filter-row').before(search);
  search.querySelector('input').addEventListener('input', () => {
    renderDiscover();
    enhanceAvatars(elements.openList);
  });
}

function createMatchFromForm() {
  const [titleInput, dateInput, timeInput, locationInput, categoryInput, priceInput] = elements.createForm.querySelectorAll('input, select');
  const title = titleInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const locationValue = locationInput.value.trim();

  if (!title || !date || !time || !locationValue) {
    showToast('Completá nombre, fecha, hora y cancha');
    return;
  }

  const [location, court = 'Cancha a confirmar'] = locationValue.split('·').map(value => value.trim());
  const numericPrice = Number(priceInput.value.replace(/[^0-9]/g, '')) || 0;
  const id = `match-${Date.now()}`;

  state.matches.unshift({ id, title, date, time, duration: 90, location, court, category: categoryInput.value, price: Math.round(numericPrice / 4), distance: 0.8, players: ['Walter'], open: true, owner: 'Walter', created: true });
  state.pendingCreatedMatchId = id;
  state.currentMatchId = id;
  saveMatches();
  renderAll();
  elements.modal.classList.add('open');
  elements.modal.setAttribute('aria-hidden', 'false');
}

function joinMatch(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match || !openSlots(match)) return;

  if (match.players.includes('Walter')) {
    const candidate = ['Camila', 'Nicolás', 'Sofía'].find(name => !match.players.includes(name));
    if (candidate) match.players.push(candidate);
    showToast(`${candidate || 'Un jugador'} confirmó el partido`);
  } else {
    match.players.push('Walter');
    showToast('Te sumaste al partido');
  }

  match.open = openSlots(match) > 0;
  saveMatches();
  renderMatchDetail(matchId);
  renderAll();
}

function resolvePhoto(player) {
  if (!PHOTO_CANDIDATES[player]) return Promise.resolve(null);
  if (photoCache.has(player)) return photoCache.get(player);

  const promise = new Promise(resolve => {
    const candidates = [...PHOTO_CANDIDATES[player]];
    const tryNext = () => {
      const source = candidates.shift();
      if (!source) return resolve(null);
      const probe = new Image();
      probe.onload = () => resolve(source);
      probe.onerror = tryNext;
      probe.src = source;
    };
    tryNext();
  });

  photoCache.set(player, promise);
  return promise;
}

async function enhanceAvatar(element) {
  if (element.dataset.photoAttempted === 'true' || element.classList.contains('missing')) return;
  const player = element.dataset.player;
  if (!PHOTO_CANDIDATES[player]) return;
  element.dataset.photoAttempted = 'true';
  const source = await resolvePhoto(player);
  if (!source || !element.isConnected) return;
  const image = document.createElement('img');
  image.src = source;
  image.alt = player;
  image.decoding = 'async';
  element.replaceChildren(image);
  element.classList.add('has-photo');
}

function enhanceAvatars(root = document) {
  root.querySelectorAll('[data-player]').forEach(enhanceAvatar);
}

function resetSplash() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.splash);
  } catch (error) {
    console.warn('No se pudo limpiar el estado de la pantalla de carga.', error);
  }
  window.location.reload();
}

function bindEvents() {
  document.addEventListener('click', event => {
    const navButton = event.target.closest('.nav-item[data-target], [data-target]:not(.nav-item)');
    if (navButton) showView(navButton.dataset.target);

    const openButton = event.target.closest('[data-open]');
    if (openButton) showView(openButton.dataset.open);

    const backButton = event.target.closest('[data-back]');
    if (backButton) showView(backButton.dataset.back);

    const viewMatchButton = event.target.closest('[data-view-match]');
    if (viewMatchButton) {
      renderMatchDetail(viewMatchButton.dataset.viewMatch);
      enhanceAvatars(elements.matchView);
      showView('match', { persist: false });
    }

    const joinButton = event.target.closest('[data-join-match]');
    if (joinButton) joinMatch(joinButton.dataset.joinMatch);

    if (event.target.closest('[data-share-match]')) showToast('Invitación lista para compartir');

    const toastButton = event.target.closest('[data-toast]');
    if (toastButton) showToast(toastButton.dataset.toast);
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(item => item.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.textContent.trim();
      renderDiscover();
      enhanceAvatars(elements.openList);
    });
  });

  document.querySelector('[data-created]').addEventListener('click', createMatchFromForm);
  document.querySelector('[data-close-modal]').addEventListener('click', () => {
    elements.modal.classList.remove('open');
    elements.modal.setAttribute('aria-hidden', 'true');
    if (state.pendingCreatedMatchId) {
      renderMatchDetail(state.pendingCreatedMatchId);
      state.pendingCreatedMatchId = null;
    }
    showView('match', { persist: false });
    enhanceAvatars(elements.matchView);
  });

  elements.modal.addEventListener('click', event => {
    if (event.target === elements.modal) {
      elements.modal.classList.remove('open');
      elements.modal.setAttribute('aria-hidden', 'true');
    }
  });

  elements.debugSplashReset?.addEventListener('click', resetSplash);

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEYS.matches) return;
    state.matches = loadMatches();
    renderAll();
  });
}

function initialize() {
  initializeSplash();
  createDesktopChrome();
  ensureSearchInput();
  renderMatchDetail(state.currentMatchId);
  renderAll();
  bindEvents();
  showView(getSavedView(), { persist: false });
  enhanceAvatars();
  console.info('App Padel prototype loaded');
}

initialize();
