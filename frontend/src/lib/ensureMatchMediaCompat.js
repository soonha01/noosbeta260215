const createFallbackMql = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

const ensureMatchMediaCompat = () => {
  if (typeof window === 'undefined' || window.__NOOS_MATCH_MEDIA_COMPAT__) return;

  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query) => createFallbackMql(query);
    window.__NOOS_MATCH_MEDIA_COMPAT__ = true;
    return;
  }

  const originalMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query) => {
    let result;

    try {
      result = originalMatchMedia(query) ?? createFallbackMql(query);
    } catch {
      result = createFallbackMql(query);
    }

    if (typeof result.addListener !== 'function') {
      result.addListener = (listener) => {
        if (typeof result.addEventListener === 'function') {
          result.addEventListener('change', listener);
        }
      };
    }

    if (typeof result.removeListener !== 'function') {
      result.removeListener = (listener) => {
        if (typeof result.removeEventListener === 'function') {
          result.removeEventListener('change', listener);
        }
      };
    }

    if (typeof result.addEventListener !== 'function') {
      result.addEventListener = () => {};
    }

    if (typeof result.removeEventListener !== 'function') {
      result.removeEventListener = () => {};
    }

    if (typeof result.dispatchEvent !== 'function') {
      result.dispatchEvent = () => false;
    }

    if (typeof result.matches !== 'boolean') {
      result.matches = false;
    }

    if (typeof result.media !== 'string') {
      result.media = query;
    }

    return result;
  };

  window.__NOOS_MATCH_MEDIA_COMPAT__ = true;
};

ensureMatchMediaCompat();
