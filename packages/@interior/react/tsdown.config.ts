import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const TSCONFIG_APP = fileURLToPath(new URL('./tsconfig.app.json', import.meta.url));

const entries = [
  { name: 'index', entry: './src/index.ts', css: 'component.css' },
  { name: 'token', entry: './src/tokens/index.ts', css: 'token.css' },
];

export default defineConfig(
  entries.map(({ name, entry, css }) => ({
    entry: { [name]: entry },
    format: 'esm' as const,
    dts: false,
    sourcemap: true,
    clean: !process.argv.includes('--watch'),
    outputOptions: {
      assetFileNames: '[name][extname]',
    },
    plugins: [
      vanillaExtractPlugin({
        extract: { name: css, sourcemap: true },
        esbuildOptions: { tsconfig: TSCONFIG_APP },
      }),
    ],
    deps: {
      neverBundle: ['react', 'react-dom', 'motion', 'motion/react'],
    },
  })),
);
