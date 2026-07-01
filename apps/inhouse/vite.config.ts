import { federation } from '@module-federation/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/*
  inhouse 는 Module Federation remote("inhouse")예요.
  shell(host)가 `loadRemote('inhouse', './routeTree')` 로 /members/* 서브트리를 가져와 graft 하고,
  dev 에선 `loadRemote('inhouse', './mocks/handlers')` 로 MSW 핸들러를 가져와 shell 프로세스에서 mock 해요.
  standalone 부트(main.tsx/index.html)는 dev preview·빌드 entry용으로 남겨요.
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
      name: 'inhouse',
      filename: 'remoteEntry.js',
      exposes: {
        './routeTree': './src/routeTree.gen.ts',
        './mocks/handlers': './src/mocks/handlers.ts',
      },
      shared,
      // host(shell) 가 remoteHmr 을 켰을 때 대응하는 remote 측 설정.
      // remote 가 /@react-refresh proxy(React native)와 __mf_hmr metadata(full-reload)
      // 를 서빙하도록 해요. host·remote 양쪽 모두 켜야 cross-federation HMR 이 동작해요.
      dev: { remoteHmr: true },
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
    port: 5175,
    cors: true,
  },
});
