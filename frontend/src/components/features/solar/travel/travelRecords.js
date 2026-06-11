import { TRAVEL_RECORDS_STORAGE_KEY } from './constants';
import {
  loadStorageJSON,
  saveStorageJSON,
} from './storage';

export const appendTravelRecord = (record) => {
  const currentRecords = loadStorageJSON(TRAVEL_RECORDS_STORAGE_KEY, []);
  const nextRecords = [record, ...(Array.isArray(currentRecords) ? currentRecords : [])].slice(0, 120);
  saveStorageJSON(TRAVEL_RECORDS_STORAGE_KEY, nextRecords);
  return nextRecords;
};
