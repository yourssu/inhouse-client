import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-router',
      '@tanstack/router-core',
      '@tanstack/history',
    ],
  },
});
