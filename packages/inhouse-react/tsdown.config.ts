import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    'hooks/index': './src/hooks/index.ts',
  },
  format: ['esm'],
  dts: {
    build: true,
    sourcemap: true,
  },
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: ['react', 'react-dom'],
  },
});
