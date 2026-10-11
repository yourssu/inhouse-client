import type { PluginOption } from 'vite';

import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export const appPlugins = (): PluginOption[] => [
  tanstackRouter({
    target: 'react',
    autoCodeSplitting: true,
    routesDirectory: './src/routes',
    generatedRouteTree: './src/routeTree.gen.ts',
    routeFilePrefix: '~',
    quoteStyle: 'single',
  }),
  react(),
  tsconfigPaths(),
  babel({ presets: [reactCompilerPreset()] }),
];
