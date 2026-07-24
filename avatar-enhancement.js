(() => {
  const photoProfiles = {
    W: {
      name: 'Walter',
      candidates: [
        'images/walter.webp', 'images/walter.jpg', 'images/walter.jpeg', 'images/walter.png',
        'images/player-walter.webp', 'images/player-walter.jpg', 'images/player-1.webp', 'images/player-1.jpg',
        'images/person-1.webp', 'images/person-1.jpg', 'images/profile-1.webp', 'images/profile-1.jpg',
        'images/avatar-1.webp', 'images/avatar-1.jpg'
      ]
    },
    M: {
      name: 'Martín',
      candidates: [
        'images/martin.webp', 'images/martin.jpg', 'images/martin.jpeg', 'images/martin.png',
        'images/player-martin.webp', 'images/player-martin.jpg', 'images/player-2.webp', 'images/player-2.jpg',
        'images/person-2.webp', 'images/person-2.jpg', 'images/profile-2.webp', 'images/profile-2.jpg',
        'images/avatar-2.webp', 'images/avatar-2.jpg'
      ]
    },
    C: {
      name: 'Camila',
      candidates: [
        'images/camila.webp', 'images/camila.jpg', 'images/camila.jpeg', 'images/camila.png',
        'images/player-camila.webp', 'images/player-camila.jpg', 'images/player-3.webp', 'images/player-3.jpg',
        'images/person-3.webp', 'images/person-3.jpg', 'images/profile-3.webp', 'images/profile-3.jpg',
        'images/avatar-3.webp', 'images/avatar-3.jpg'
      ]
    },
    F: {
      name: 'Florencia',
      candidates: [
        'images/florencia.webp', 'images/florencia.jpg', 'images/florencia.jpeg', 'images/florencia.png',
        'images/player-florencia.webp', 'images/player-florencia.jpg', 'images/player-4.webp', 'images/player-4.jpg',
        'images/person-4.webp', 'images/person-4.jpg', 'images/profile-4.webp', 'images/profile-4.jpg',
        'images/avatar-4.webp', 'images/avatar-4.jpg'
      ]
    }
  };

  const resolvedPhotos = new Map();

  function normalizeKey(element) {
    const explicitName = element.closest('.rail-player, .roster > div')?.querySelector('strong')?.textContent?.trim();
    if (explicitName) {
      const firstLetter = explicitName.charAt(0).toUpperCase();
      if (photoProfiles[firstLetter]) return firstLetter;
    }

    const text = element.textContent.trim().toUpperCase();
    return photoProfiles[text] ? text : null;
  }

  function resolvePhoto(key) {
    if (resolvedPhotos.has(key)) return resolvedPhotos.get(key);

    const candidates = photoProfiles[key].candidates;
    const promise = new Promise(resolve => {
      let index = 0;

      const tryNext = () => {
        if (index >= candidates.length) {
          resolve(null);
          return;
        }

        const source = candidates[index++];
        const probe = new Image();
        probe.onload = () => resolve(source);
        probe.onerror = tryNext;
        probe.src = source;
      };

      tryNext();
    });

    resolvedPhotos.set(key, promise);
    return promise;
  }

  async function enhanceAvatar(element) {
    if (element.dataset.photoAttempted === 'true' || element.classList.contains('missing')) return;

    const key = normalizeKey(element);
    if (!key) return;

    element.dataset.photoAttempted = 'true';
    const source = await resolvePhoto(key);
    if (!source || !element.isConnected) return;

    const image = document.createElement('img');
    image.src = source;
    image.alt = photoProfiles[key].name;
    image.decoding = 'async';
    image.loading = 'eager';
    element.replaceChildren(image);
    element.classList.add('has-photo');
  }

  function enhanceAll(root = document) {
    root.querySelectorAll('.player-photo, .court-player, .avatar').forEach(enhanceAvatar);
  }

  enhanceAll();

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches('.player-photo, .court-player, .avatar')) enhanceAvatar(node);
        enhanceAll(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
