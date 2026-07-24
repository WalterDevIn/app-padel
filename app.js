const splashStyles = document.createElement('link');
splashStyles.rel = 'stylesheet';
splashStyles.href = 'splash.css';
document.head.appendChild(splashStyles);

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
    // The splash remains fully functional without persistent session storage.
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

const desktopStyles = document.createElement('link');
desktopStyles.rel = 'stylesheet';
desktopStyles.href = 'desktop.css';
document.head.appendChild(desktopStyles);

const sidebar = document.createElement('aside');
sidebar.className = 'desktop-sidebar';
sidebar.setAttribute('aria-label', 'Navegación de escritorio');
sidebar.innerHTML = `
  <div class="desktop-brand"><span class="brand-mark"></span><span>PADEL</span></div>
  <nav class="desktop-nav">
    <button class="nav-item active" data-target="home">
      <svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg><span>Inicio</span>
    </button>
    <button class="nav-item" data-target="discover">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><span>Buscar partidos</span>
    </button>
    <button class="nav-item" data-target="activity">
      <svg viewBox="0 0 24 24"><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/></svg><span>Actividad</span>
    </button>
    <button class="nav-item create-desktop" data-target="create">
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>Crear partido</span>
    </button>
  </nav>
  <div class="desktop-user">
    <button class="avatar" aria-label="Perfil de Walter">W</button>
    <div><strong>Walter</strong><span>6.ª categoría</span></div>
  </div>
`;

document.body.prepend(sidebar);

const rail = document.createElement('aside');
rail.className = 'desktop-rail';
rail.setAttribute('aria-label', 'Resumen del próximo partido');
rail.innerHTML = `
  <section class="rail-card">
    <p class="eyebrow">Próximo partido</p>
    <h3>Jueves · 21:00</h3>
    <p>Pádel Center · Cancha 3</p>
    <div class="rail-progress"><span></span></div>
    <div class="rail-caption"><span>3 confirmados</span><span>Falta 1</span></div>
    <div class="rail-players">
      <div class="rail-player"><span class="player-photo player-one">W</span><div><strong>Walter</strong><span>Organiza</span></div></div>
      <div class="rail-player"><span class="player-photo player-two">M</span><div><strong>Martín</strong><span>Confirmado</span></div></div>
      <div class="rail-player"><span class="player-photo player-three">L</span><div><strong>Lucas</strong><span>Confirmado</span></div></div>
      <div class="rail-player"><span class="player-photo missing">+</span><div><strong>Lugar libre</strong><span>6.ª–7.ª</span></div></div>
    </div>
    <button class="primary-button rail-action" data-open="match">Completar partido</button>
  </section>
  <section class="rail-card rail-tip">
    <p class="eyebrow">Sugerencia</p>
    <strong>Compartilo antes de las 18:00</strong>
    <p>Tus invitaciones reciben más respuestas durante la tarde.</p>
  </section>
`;

document.body.appendChild(rail);

const views = [...document.querySelectorAll('.view')];
const navItems = [...document.querySelectorAll('.nav-item')];
const modal = document.querySelector('#successModal');
const toast = document.querySelector('#toast');
let toastTimer;

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

navItems.forEach(item => item.addEventListener('click', () => showView(item.dataset.target)));

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.open));
});

document.querySelectorAll('[data-back]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.back));
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(item => item.classList.remove('active'));
    chip.classList.add('active');
    showToast(`Filtro: ${chip.textContent}`);
  });
});

document.querySelector('[data-created]').addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
});

document.querySelector('[data-close-modal]').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  showView('match');
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
});

document.querySelector('[data-share]').addEventListener('click', () => {
  showToast('Invitación lista para compartir');
});

document.querySelectorAll('[data-toast]').forEach(button => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

console.info('App Padel prototype loaded — responsive views with session splash');