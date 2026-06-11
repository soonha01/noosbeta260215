import { useCallback, useState } from 'react';
import {
  DEFAULT_PROFILE,
  FEEDBACK_STORAGE_KEY,
  MEMO_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  STATE_STORAGE_KEY,
} from './constants';
import {
  loadStorageJSON,
  readStorageText,
  saveStorageJSON,
  writeStorageText,
} from './storage';

export const useTravelPersistence = () => {
  const [stateSnapshot, setStateSnapshot] = useState(() => loadStorageJSON(STATE_STORAGE_KEY, null));
  const [feedbackHistory, setFeedbackHistory] = useState(() => loadStorageJSON(FEEDBACK_STORAGE_KEY, []));
  const [memoText, setMemoText] = useState(() => readStorageText(MEMO_STORAGE_KEY, ''));
  const [profileForm, setProfileForm] = useState(() => loadStorageJSON(PROFILE_STORAGE_KEY, DEFAULT_PROFILE));

  const refreshStateSnapshot = useCallback(() => {
    setStateSnapshot(loadStorageJSON(STATE_STORAGE_KEY, null));
  }, []);

  const saveStateSnapshot = useCallback((nextSnapshot) => {
    setStateSnapshot(nextSnapshot);
    saveStorageJSON(STATE_STORAGE_KEY, nextSnapshot);
  }, []);

  const saveMemo = useCallback(() => {
    writeStorageText(MEMO_STORAGE_KEY, memoText);
  }, [memoText]);

  const updateProfileInput = useCallback((key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveProfile = useCallback(() => {
    saveStorageJSON(PROFILE_STORAGE_KEY, profileForm);
  }, [profileForm]);

  const saveFeedbackHistory = useCallback((nextHistory) => {
    setFeedbackHistory(nextHistory);
    saveStorageJSON(FEEDBACK_STORAGE_KEY, nextHistory);
  }, []);

  return {
    stateSnapshot,
    setStateSnapshot,
    refreshStateSnapshot,
    saveStateSnapshot,
    feedbackHistory,
    setFeedbackHistory,
    saveFeedbackHistory,
    memoText,
    setMemoText,
    saveMemo,
    profileForm,
    setProfileForm,
    updateProfileInput,
    saveProfile,
  };
};
