(() => {
  const viewStorageKey = 'app-padel:active-view';
  const persistentViews = new Set(['home', 'discover', 'create', 'activity']);

  function saveView(viewName) {
    if (!persistentViews.has(viewName)) return;
    try {
      sessionStorage.setItem(viewStorageKey, viewName);
    } catch (error) {
      console.warn('No se pudo guardar la vista activa.', error);
    }
  }

  function restoreView() {
    let savedView = 'home';
    try {
      savedView = sessionStorage.getItem(viewStorageKey) || 'home';
    } catch (error) {
      console.warn('No se pudo recuperar la vista activa.', error);
    }

    if (!persistentViews.has(savedView)) savedView = 'home';
    if (typeof window.showView === 'function') window.showView(savedView);
  }

  document.addEventListener('click', event => {
    const navigationButton = event.target.closest('.nav-item[data-target]');
    if (navigationButton) saveView(navigationButton.dataset.target);

    const backButton = event.target.closest('[data-back]');
    if (backButton) saveView(backButton.dataset.back);
  }, true);

  restoreView();
})();
