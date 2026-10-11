import type { PluginOption } from 'vite';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

import { tailwindcssPrefix } from '../tailwindcssPrefix';

export const appPlugins = (prefix: string): PluginOption[] => [
  tanstackRouter({ target: 'react', autoCodeSplitting: true }),
  react(),
  tailwindcss(),
  tailwindcssPrefix({ prefix }),
  tsconfigPaths(),
  babel({ presets: [reactCompilerPreset()] }),
];
