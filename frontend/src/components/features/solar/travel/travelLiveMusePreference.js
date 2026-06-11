import {
  getSharedLiveMuseSnapshot,
} from '../../../../lib/muse/liveMuseSession';
import { LIVE_MUSE_SESSION_STORAGE_KEY } from './constants';
import { createLiveMuseSessionFromSharedSnapshot } from './spaceTravelRuntime';
import {
  loadStorageJSON,
  saveStorageJSON,
} from './storage';

export const readLiveMuseSessionPreference = () => {
  const saved = loadStorageJSON(LIVE_MUSE_SESSION_STORAGE_KEY, null);
  if (saved?.enabled) return saved;

  return createLiveMuseSessionFromSharedSnapshot(getSharedLiveMuseSnapshot());
};

export const writeLiveMuseSessionPreference = (nextValue) => {
  saveStorageJSON(LIVE_MUSE_SESSION_STORAGE_KEY, nextValue);
};
