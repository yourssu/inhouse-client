import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: {
    build: true,
    sourcemap: true,
  },
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: ['react', '@tanstack/react-router'],
    dts: {
      neverBundle: ['@tanstack/react-router', '@tanstack/router-core', '@tanstack/history'],
    },
  },
});
