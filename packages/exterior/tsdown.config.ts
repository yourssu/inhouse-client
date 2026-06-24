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
    neverBundle: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-router',
      'motion',
      'motion/react',
      'overlay-kit',
    ],
  },
});
