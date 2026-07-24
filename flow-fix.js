const homeHero = document.querySelector('.hero-match');

function getPrimaryHomeMatch() {
  const userMatches = matches
    .filter(match => match.players.includes('Walter') || match.owner === 'Walter')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  const currentUserMatch = userMatches.find(match => match.id === currentMatchId);
  const nextOpenMatch = userMatches.find(match => match.open && openSlots(match) > 0);
  return currentUserMatch || nextOpenMatch || userMatches[0] || matches[0];
}

function renderHomeHero() {
  if (!homeHero) return;

  const match = getPrimaryHomeMatch();
  if (!match) {
    homeHero.innerHTML = '<div class="hero-topline"><span class="status-pill waiting">Sin partidos</span></div><div class="hero-date"><div><h2>Creá tu primer partido</h2><p>Organizalo y compartí la invitación.</p></div></div><button class="primary-button" data-target="create">Crear partido <span>→</span></button>';
    return;
  }

  const slots = openSlots(match);
  const date = new Date(`${match.date}T12:00:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', '').toUpperCase();
  const status = slots === 0
    ? '<span class="status-pill complete">Completo</span>'
    : slots === 1
      ? '<span class="status-pill urgent"><i></i> Falta 1 jugador</span>'
      : `<span class="status-pill waiting">Faltan ${slots} jugadores</span>`;
  const playerCount = match.players.length;
  const actionLabel = slots ? (slots === 1 ? 'Buscar cuarto jugador' : 'Completar partido') : 'Ver partido';

  homeHero.innerHTML = `
    <div class="hero-topline">
      ${status}
      <button class="more-button" aria-label="Más opciones">•••</button>
    </div>
    <div class="hero-date">
      <div class="date-block"><strong>${day}</strong><span>${month}</span></div>
      <div><h2>${escapeHtml(match.title)}</h2><p>${escapeHtml(match.time)} · ${match.duration || 90} minutos</p></div>
    </div>
    <div class="court-row">
      <div class="court-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="20" rx="4"/><path d="M16 6v20M4 16h24"/></svg></div>
      <div><strong>${escapeHtml(match.location)}</strong><span>${escapeHtml(match.court || 'Cancha a confirmar')}</span></div>
      <button class="round-arrow" aria-label="Ver partido" data-view-match="${match.id}">↗</button>
    </div>
    <div class="players-row">
      ${renderPlayerStack(match)}
      <div class="player-copy"><strong>${playerCount} de 4 confirmados</strong><span>${escapeHtml(match.category)}</span></div>
    </div>
    <button class="primary-button" type="button" data-view-match="${match.id}">${actionLabel} <span>→</span></button>
    <div class="split-info"><span>$${Number(match.price || 0).toLocaleString('es-AR')} por persona</span><span>${slots ? 'Invitaciones abiertas' : 'Equipo confirmado'}</span></div>
  `;
}

function synchronizeMatchViews(matchId = currentMatchId) {
  renderHomeMatches();
  renderDiscover();
  renderHomeHero();
  if (matchId && matches.some(match => match.id === matchId)) renderRail();
}

renderHomeHero();

// The prototype mutates match state synchronously. Re-render all summaries after those actions.
document.addEventListener('click', event => {
  if (event.target.closest('[data-join-match]')) {
    window.setTimeout(() => synchronizeMatchViews(currentMatchId), 0);
  }

  if (event.target.closest('[data-created]')) {
    window.setTimeout(() => synchronizeMatchViews(pendingCreatedMatchId || currentMatchId), 0);
  }
});

window.addEventListener('storage', event => {
  if (event.key === 'app-padel:prototype-matches') {
    matches = loadMatches();
    synchronizeMatchViews();
  }
});
