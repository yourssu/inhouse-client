import { federation } from '@module-federation/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/*
  shell 은 Module Federation host("shell")예요.
  런타임에 scouter·inhouse remote 의 routeTree 를 loadRemote 로 가져와 자기 _auth 아래에 graft 해요.
  remoteEntry URL 은 dev(localhost 포트)를 기본으로 하고, prod 는 VITE_SCOUTER_URL·VITE_INHOUSE_URL env 로 덮어요.
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const scouterUrl = env.VITE_SCOUTER_URL ?? 'http://localhost:5174/remoteEntry.js';
  const inhouseUrl = env.VITE_INHOUSE_URL ?? 'http://localhost:5175/remoteEntry.js';

  return {
    plugins: [
      federation({
        name: 'shell',
        // type:'module' → 런타임이 remoteEntry 를 classic <script> 가 아니라
        // dynamic import() 로 로드해요. Vite(dev·build 모두)가 내보내는 ESM remoteEntry
        // 는 import 구문을 쓰므로 classic script 로는 "Cannot use import statement
        // outside a module" 가 발생해요. remoteEntry 내부의 절대경로 import 는
        // remote 자기 origin(5174/5175, cors:true)으로 해석돼요.
        remotes: {
          scouter: { type: 'module', name: 'scouter', entry: scouterUrl },
          inhouse: { type: 'module', name: 'inhouse', entry: inhouseUrl },
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
      port: 5173,
    },
  };
});
