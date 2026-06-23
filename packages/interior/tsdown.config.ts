import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsdown';

const OUTPUT_CSS_FILE_NAME = 'index.css';

const bundleCSSPlugin = (layer: string, cssFileName: string) => ({
  name: 'bundle-css',
  closeBundle() {
    const cssPath = path.resolve('./dist', cssFileName);
    if (!fs.existsSync(cssPath)) {
      return;
    }

    const content = fs.readFileSync(cssPath, 'utf-8');
    if (content.startsWith('@import')) {
      return;
    }

    const bundledCss = [`@layer ${layer} {`, content, `}`].join('\n');
    fs.writeFileSync(cssPath, bundledCss, 'utf-8');
  },
});

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: {
    build: true,
    sourcemap: true,
  },
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  outputOptions: {
    assetFileNames: OUTPUT_CSS_FILE_NAME,
  },
  plugins: [
    vanillaExtractPlugin({
      extract: {
        name: OUTPUT_CSS_FILE_NAME,
        sourcemap: true,
      },
    }),
    bundleCSSPlugin('interior', OUTPUT_CSS_FILE_NAME),
  ],
  deps: {
    neverBundle: ['react', 'react-dom', 'motion', 'motion/react'],
  },
});
