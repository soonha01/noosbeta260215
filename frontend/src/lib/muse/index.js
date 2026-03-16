import { createMockMuseClient } from './createMockMuseClient';
import { createWebMuseClient } from './createWebMuseClient';

export { createMockMuseClient, createWebMuseClient };

export async function createMuseClient(options = {}) {
  const { mode = 'web' } = options;

  if (mode === 'mock') {
    return createMockMuseClient(options);
  }

  return createWebMuseClient(options);
}
