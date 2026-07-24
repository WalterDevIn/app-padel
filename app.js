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

console.info('App Padel prototype loaded — branch: prototype');
