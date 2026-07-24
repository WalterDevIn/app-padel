const splashStyles = document.createElement('link');
splashStyles.rel = 'stylesheet';
splashStyles.href = 'splash.css';
document.head.appendChild(splashStyles);

const desktopStyles = document.createElement('link');
desktopStyles.rel = 'stylesheet';
desktopStyles.href = 'desktop.css';
document.head.appendChild(desktopStyles);

const interactionStyles = document.createElement('style');
interactionStyles.textContent = `
  .match-search{position:relative;margin:0 0 14px}.match-search input{width:100%;height:50px;border-radius:15px;border:1px solid var(--line);background:#09160f;color:var(--text);padding:0 46px 0 16px;outline:none}.match-search input:focus{border-color:rgba(200,255,66,.55)}.match-search svg{position:absolute;right:16px;top:50%;width:20px;transform:translateY(-50%);fill:none;stroke:var(--muted);stroke-width:1.8}.empty-results{padding:34px 20px;text-align:center;color:var(--muted);box-shadow:none}.empty-results strong{display:block;color:var(--text);margin-bottom:6px}.join-button.is-joined{background:rgba(200,255,66,.12);color:var(--accent);border-color:rgba(200,255,66,.25)}.prototype-note{font-size:10px;color:var(--muted);text-align:center;margin:12px 0 0}.created-match{outline:1px solid rgba(200,255,66,.25)}
  @media(min-width:980px){.match-search{max-width:620px}.empty-results{grid-column:1/-1}}
`;
document.head.appendChild(interactionStyles);

function initializeSplash() {
  const splashKey = 'app-padel:splash-shown';
  const forceSplash = new URLSearchParams(window.location.search).get('splash') === '1';
  let hasBeenShown = false;

  try {
    hasBeenShown = sessionStorage.getItem(splashKey) === 'true';
  } catch (error) {
    console.warn('Session storage is unavailable; splash will use the safe fallback.', error);
  }

  if (hasBeenShown && !forceSplash) return;

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
    sessionStorage.setItem(splashKey, 'true');
  } catch (error) {
    // Safe fallback: the splash still works without storage.
  }

  let dismissed = false;
  let automaticDismissal;

  const dismissSplash = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(automaticDismissal);
    splash.classList.add('is-leaving');
    document.body.classList.remove('splash-active');
    document.removeEventListener('keydown', handleEscape);
    window.setTimeout(() => splash.remove(), 620);
  };

  const handleEscape = event => {
    if (event.key === 'Escape') dismissSplash();
  };

  splash.querySelector('.splash-skip').addEventListener('click', dismissSplash);
  document.addEventListener('keydown', handleEscape);
  automaticDismissal = window.setTimeout(dismissSplash, 1650);
}

initializeSplash();

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
  <div class="desktop-user"><button class="avatar" aria-label="Perfil de Walter">W</button><div><strong>Walter</strong><span>6.ª categoría</span></div></div>
`;
document.body.prepend(sidebar);

const rail = document.createElement('aside');
rail.className = 'desktop-rail';
rail.setAttribute('aria-label', 'Resumen del próximo partido');
document.body.appendChild(rail);

const views = [...document.querySelectorAll('.view')];
const navItems = [...document.querySelectorAll('.nav-item')];
const modal = document.querySelector('#successModal');
const toast = document.querySelector('#toast');
const discoverView = document.querySelector('[data-view="discover"]');
const openList = discoverView.querySelector('.open-list');
const miniMatchList = document.querySelector('.mini-match-list');
const createForm = document.querySelector('.prototype-form');
const matchView = document.querySelector('[data-view="match"]');
let toastTimer;
let currentMatchId = 'thursday-main';
let pendingCreatedMatchId = null;
let activeFilter = 'Todos';

const initialMatches = [
  {
    id: 'thursday-main',
    title: 'Partido del jueves',
    date: '2026-07-30',
    time: '21:00',
    duration: 90,
    location: 'Pádel Center',
    court: 'Cancha 3',
    category: '6.ª–7.ª',
    price: 8000,
    distance: 1.2,
    players: ['Walter', 'Martín', 'Lucas'],
    open: true,
    owner: 'Walter'
  },
  {
    id: 'mitre-open',
    title: 'Partido parejo en Mitre',
    date: '2026-07-24',
    time: '22:00',
    duration: 90,
    location: 'Match Point',
    court: 'Cancha 2',
    category: '6.ª',
    price: 7500,
    distance: 1.8,
    players: ['Martín', 'Lucas', 'Agustín'],
    open: true,
    owner: 'Martín'
  },
  {
    id: 'sunday-open',
    title: 'Domingo de pádel',
    date: '2026-07-26',
    time: '17:30',
    duration: 90,
    location: 'La Red',
    court: 'Cancha 1',
    category: '7.ª–8.ª',
    price: 6000,
    distance: 3.2,
    players: ['Juan', 'Florencia'],
    open: true,
    owner: 'Juan'
  },
  {
    id: 'monday-group',
    title: 'Partido con el grupo',
    date: '2026-07-27',
    time: '20:30',
    duration: 90,
    location: 'Arena Padel',
    court: 'Cancha 4',
    category: '6.ª–7.ª',
    price: 7000,
    distance: 2.4,
    players: ['Walter', 'Marcos', 'Nico', 'Sofía'],
    open: false,
    owner: 'Walter'
  }
];

function loadMatches() {
  try {
    const stored = JSON.parse(localStorage.getItem('app-padel:prototype-matches'));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch (error) {
    console.warn('Could not load prototype matches.', error);
  }
  return initialMatches;
}

let matches = loadMatches();

function saveMatches() {
  try {
    localStorage.setItem('app-padel:prototype-matches', JSON.stringify(matches));
  } catch (error) {
    console.warn('Could not persist prototype matches.', error);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showView(name) {
  if (name === 'profile') {
    showToast('El perfil queda fuera del foco de este prototipo');
    return;
  }

  views.forEach(view => view.classList.toggle('active', view.dataset.view === name));
  navItems.forEach(item => item.classList.toggle('active', item.dataset.target === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function formatDate(dateString, options = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat('es-AR', options).format(date);
}

function initials(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function openSlots(match) {
  return Math.max(0, 4 - match.players.length);
}

function statusMarkup(match) {
  const slots = openSlots(match);
  if (!slots) return '<span class="status-pill complete">Completo</span>';
  if (slots === 1) return '<span class="status-pill urgent"><i></i> Falta 1</span>';
  return `<span class="status-pill waiting">${slots} lugares</span>`;
}

function renderPlayerStack(match, compact = false) {
  const palette = ['player-one', 'player-two', 'player-three', 'player-four'];
  const players = match.players.map((player, index) => `<span class="player-photo ${palette[index % palette.length]}">${escapeHtml(initials(player))}</span>`).join('');
  const missing = Array.from({ length: openSlots(match) }, (_, index) => `<span class="player-photo missing">${index === 0 ? `+${openSlots(match)}` : '+'}</span>`).join('');
  return `<div class="player-stack${compact ? ' small' : ''}">${players}${missing}</div>`;
}

function renderDiscover() {
  const query = discoverView.querySelector('#matchSearch')?.value.trim().toLowerCase() || '';
  const today = '2026-07-24';

  const filtered = matches.filter(match => {
    if (!match.open || !openSlots(match)) return false;
    const searchable = `${match.title} ${match.location} ${match.category}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesFilter = activeFilter === 'Todos'
      || (activeFilter === 'Hoy' && match.date === today)
      || (activeFilter === '6.ª–7.ª' && match.category.includes('6.ª'))
      || (activeFilter === 'A menos de 5 km' && match.distance <= 5);
    return matchesQuery && matchesFilter;
  });

  if (!filtered.length) {
    openList.innerHTML = '<article class="empty-results card"><strong>No encontramos partidos</strong><span>Probá con otro nombre, club o filtro.</span></article>';
    return;
  }

  openList.innerHTML = filtered.map(match => `
    <article class="open-match card${match.created ? ' created-match' : ''}" data-match-id="${match.id}">
      <div class="open-header">${statusMarkup(match)}<span>${match.distance.toFixed(1).replace('.', ',')} km</span></div>
      <h3>${escapeHtml(match.title)}</h3>
      <p>${escapeHtml(formatDate(match.date))} · ${escapeHtml(match.time)} · ${escapeHtml(match.location)}</p>
      <div class="open-footer">
        ${renderPlayerStack(match, true)}
        <div><strong>${escapeHtml(match.category)}</strong><span>$${match.price.toLocaleString('es-AR')} por persona</span></div>
        <button class="secondary-button" type="button" data-view-match="${match.id}">Ver</button>
      </div>
    </article>
  `).join('');
}

function renderHomeMatches() {
  const userMatches = matches.filter(match => match.players.includes('Walter') || match.owner === 'Walter').slice(0, 4);
  miniMatchList.innerHTML = userMatches.map(match => {
    const date = new Date(`${match.date}T12:00:00`);
    const day = date.getDate().toString().padStart(2, '0');
    const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(date).replace('.', '').toUpperCase();
    return `
      <article class="mini-match card${match.created ? ' created-match' : ''}" data-view-match="${match.id}">
        <div class="mini-date"><strong>${day}</strong><span>${weekday}</span></div>
        <div class="mini-copy"><strong>${escapeHtml(match.title)}</strong><span>${escapeHtml(match.time)} · ${escapeHtml(match.location)}</span></div>
        ${statusMarkup(match)}
      </article>
    `;
  }).join('');
}

function renderRail() {
  const match = matches.find(item => item.id === currentMatchId) || matches[0];
  const slots = openSlots(match);
  rail.innerHTML = `
    <section class="rail-card">
      <p class="eyebrow">Partido seleccionado</p>
      <h3>${escapeHtml(formatDate(match.date, { weekday: 'long' }))} · ${escapeHtml(match.time)}</h3>
      <p>${escapeHtml(match.location)} · ${escapeHtml(match.court || 'Cancha a confirmar')}</p>
      <div class="rail-progress"><span style="width:${match.players.length * 25}%"></span></div>
      <div class="rail-caption"><span>${match.players.length} confirmados</span><span>${slots ? `Faltan ${slots}` : 'Completo'}</span></div>
      <div class="rail-players">
        ${match.players.map((player, index) => `<div class="rail-player"><span class="player-photo ${['player-one','player-two','player-three','player-four'][index]}">${escapeHtml(initials(player))}</span><div><strong>${escapeHtml(player)}</strong><span>${player === match.owner ? 'Organiza' : 'Confirmado'}</span></div></div>`).join('')}
        ${slots ? `<div class="rail-player"><span class="player-photo missing">+</span><div><strong>${slots === 1 ? 'Lugar libre' : `${slots} lugares libres`}</strong><span>${escapeHtml(match.category)}</span></div></div>` : ''}
      </div>
      <button class="primary-button rail-action" type="button" data-view-match="${match.id}">${slots ? 'Ver y completar' : 'Ver partido'}</button>
    </section>
    <section class="rail-card rail-tip"><p class="eyebrow">Prototipo</p><strong>Los cambios se guardan en este navegador</strong><p>No se envía información a un servidor.</p></section>
  `;
}

function renderMatchDetail(matchId) {
  const match = matches.find(item => item.id === matchId);
  if (!match) return;
  currentMatchId = match.id;
  const slots = openSlots(match);
  const palette = ['player-one', 'player-two', 'player-three', 'player-four'];
  const courtPositions = ['p1', 'p2', 'p3', 'p4'];
  const courtPlayers = Array.from({ length: 4 }, (_, index) => {
    const player = match.players[index];
    return `<span class="court-player ${courtPositions[index]}"${player ? ` style="${index === 1 ? 'background:#b6c8ff' : index === 2 ? 'background:#ffbd8f' : index === 3 ? 'background:#e9a4ff' : ''}"` : ''}>${player ? escapeHtml(initials(player)) : '?'}</span>`;
  }).join('');

  const roster = Array.from({ length: 4 }, (_, index) => {
    const player = match.players[index];
    if (!player) return '<div class="empty-player"><span class="player-photo missing">+</span><strong>Lugar libre</strong><em>Disponible</em></div>';
    return `<div><span class="player-photo ${palette[index]}">${escapeHtml(initials(player))}</span><strong>${escapeHtml(player)}</strong><em>${player === match.owner ? 'Organiza' : 'Confirmado'}</em></div>`;
  }).join('');

  matchView.querySelector('.match-heading').innerHTML = `${statusMarkup(match)}<h1>${escapeHtml(match.title)}</h1><p>${escapeHtml(formatDate(match.date))} · ${escapeHtml(match.time)} · ${escapeHtml(match.location)}</p>`;
  matchView.querySelector('.court-visual').innerHTML = `<div class="court-line vertical"></div><div class="court-line horizontal"></div>${courtPlayers}`;
  matchView.querySelector('.roster-card').innerHTML = `<div class="section-heading compact"><div><p class="eyebrow">Jugadores</p><h2>${match.players.length} confirmados</h2></div><span>${escapeHtml(match.category)}</span></div><div class="roster">${roster}</div>`;

  const shareCard = matchView.querySelector('.share-card');
  shareCard.innerHTML = `
    <div><span class="share-icon">↗</span><strong>${slots ? 'Compartí los lugares libres' : 'El partido está completo'}</strong><p>${slots ? `Quedan ${slots} ${slots === 1 ? 'lugar' : 'lugares'}. El enlace permite confirmar sin instalar nada.` : 'Ya están confirmados los cuatro jugadores.'}</p></div>
    ${slots ? `<button class="primary-button join-button" type="button" data-join-match="${match.id}">${match.players.includes('Walter') ? 'Simular invitación' : 'Sumarme al partido'}</button>` : ''}
    <button class="secondary-button full" type="button" data-share-match="${match.id}">Compartir invitación</button>
  `;
  renderRail();
}

function ensureSearchInput() {
  if (discoverView.querySelector('#matchSearch')) return;
  const search = document.createElement('label');
  search.className = 'match-search';
  search.innerHTML = '<input id="matchSearch" type="search" placeholder="Buscar por partido, club o categoría" aria-label="Buscar partidos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
  discoverView.querySelector('.filter-row').before(search);
  search.querySelector('input').addEventListener('input', renderDiscover);
}

function createMatchFromForm() {
  const inputs = createForm.querySelectorAll('input, select');
  const [titleInput, dateInput, timeInput, locationInput, categoryInput, priceInput] = inputs;
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
  const match = {
    id,
    title,
    date,
    time,
    duration: 90,
    location,
    court,
    category: categoryInput.value,
    price: Math.round(numericPrice / 4),
    distance: 0.8,
    players: ['Walter'],
    open: true,
    owner: 'Walter',
    created: true
  };

  matches.unshift(match);
  pendingCreatedMatchId = id;
  currentMatchId = id;
  saveMatches();
  renderHomeMatches();
  renderDiscover();
  renderRail();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function joinMatch(matchId) {
  const match = matches.find(item => item.id === matchId);
  if (!match || !openSlots(match)) return;

  if (match.players.includes('Walter')) {
    const simulatedNames = ['Camila', 'Nicolás', 'Sofía'];
    const candidate = simulatedNames.find(name => !match.players.includes(name));
    if (candidate) match.players.push(candidate);
    showToast(`${candidate || 'Un jugador'} confirmó el partido`);
  } else {
    match.players.push('Walter');
    showToast('Te sumaste al partido');
  }

  match.open = openSlots(match) > 0;
  saveMatches();
  renderMatchDetail(matchId);
  renderDiscover();
  renderHomeMatches();
}

ensureSearchInput();
renderHomeMatches();
renderDiscover();
renderMatchDetail(currentMatchId);

navItems.forEach(item => item.addEventListener('click', () => showView(item.dataset.target)));

document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-open]');
  if (openButton) showView(openButton.dataset.open);

  const viewMatchButton = event.target.closest('[data-view-match]');
  if (viewMatchButton) {
    renderMatchDetail(viewMatchButton.dataset.viewMatch);
    showView('match');
  }

  const joinButton = event.target.closest('[data-join-match]');
  if (joinButton) joinMatch(joinButton.dataset.joinMatch);

  const shareButton = event.target.closest('[data-share-match]');
  if (shareButton) showToast('Invitación lista para compartir');
});

document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showView(button.dataset.back)));

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(item => item.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.textContent.trim();
    renderDiscover();
  });
});

document.querySelector('[data-created]').addEventListener('click', createMatchFromForm);

document.querySelector('[data-close-modal]').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (pendingCreatedMatchId) {
    renderMatchDetail(pendingCreatedMatchId);
    pendingCreatedMatchId = null;
  }
  showView('match');
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
});

document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));

console.info('App Padel prototype loaded — create, search and view match flows enabled');