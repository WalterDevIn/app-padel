(() => {
  const splashKey = 'app-padel:splash-shown';
  const forceSplash = new URLSearchParams(window.location.search).get('splash') === '1';
  let shouldShowSplash = forceSplash;

  if (!forceSplash) {
    try {
      shouldShowSplash = sessionStorage.getItem(splashKey) !== 'true';
    } catch (error) {
      shouldShowSplash = true;
    }
  }

  if (shouldShowSplash) {
    document.documentElement.classList.add('splash-expected');
  }

  const releaseScrollLock = () => {
    if (!document.body) return;
    const splashStillVisible = document.querySelector('.splash-screen:not(.is-leaving)');
    const splashActive = document.body.classList.contains('splash-active');
    if (!splashStillVisible && !splashActive) {
      document.documentElement.classList.remove('splash-expected');
      observer.disconnect();
    }
  };

  const observer = new MutationObserver(releaseScrollLock);

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    const resetButton = document.querySelector('#debugSplashReset');
    resetButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        sessionStorage.removeItem(splashKey);
      } catch (error) {
        console.warn('No se pudo limpiar el estado de la pantalla de carga.', error);
      }

      const url = new URL(window.location.href);
      url.searchParams.set('splash', '1');
      window.location.replace(url.toString());
    }, { capture: true });

    releaseScrollLock();
  }, { once: true });
})();