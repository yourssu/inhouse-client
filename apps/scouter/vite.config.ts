import { federation } from '@module-federation/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/*
  scouter 는 Module Federation remote("scouter")예요.
  shell(host)가 런타임에 `loadRemote('scouter', './routeTree')` 로 라우트 서브트리(/recruit/*)를 가져와
  자기 _auth 아래에 graft 해요. standalone 부트(main.tsx/index.html)는 dev preview·빌드 entry용으로 남겨요.
*/
const shared = {
  react: { singleton: true, requiredVersion: '^19.2.6' },
  'react-dom': { singleton: true, requiredVersion: '^19.2.6' },
  '@tanstack/react-router': { singleton: true, requiredVersion: '^1.170.11' },
  '@tanstack/react-query': { singleton: true, requiredVersion: '^5.101.0' },
  '@yourssu-inhouse/interior': { singleton: true },
  '@yourssu-inhouse/exterior': { singleton: true },
  zod: { singleton: true },
  'es-toolkit': { singleton: true },
} as const;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: 'scouter',
      filename: 'remoteEntry.js',
      exposes: {
        './routeTree': './src/routeTree.gen.ts',
      },
      shared,
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 5174,
    cors: true,
  },
});
