export const safeParseJSON = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const loadStorageJSON = (key, fallback) => {
  try {
    return safeParseJSON(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
};

export const saveStorageJSON = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save storage key "${key}"`, error);
  }
};

export const readStorageText = (key, fallback = '') => {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

export const writeStorageText = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to write storage key "${key}"`, error);
  }
};
