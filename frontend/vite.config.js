import path from 'node:path';
import { rmSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const omitDevPublicDataFromBuild = () => {
  let buildOutDir = 'build';
  let rootDir = __dirname;

  return {
    name: 'omit-dev-public-data-from-build',
    apply: 'build',
    configResolved(config) {
      rootDir = config.root;
      buildOutDir = config.build.outDir;
    },
    closeBundle() {
      rmSync(path.resolve(rootDir, buildOutDir, 'mock-data'), {
        recursive: true,
        force: true,
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), omitDevPublicDataFromBuild()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});
