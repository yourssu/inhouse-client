import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: ['react', '@tanstack/react-router'],
  },
});
