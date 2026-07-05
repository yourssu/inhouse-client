import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { mfaVitePlugin } from '@yourssu-inhouse/mfa-vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { mfaConfig } from '../../mfa.config';

/*
  shell 은 Module Federation host("shell")예요.
  런타임에 scouter·inhouse remote 의 routeTree 를 loadRemote 로 가져와 자기 _auth 아래에 graft 해요.
  federation(shared/remotes/dev.remoteHmr) 은 mfaVitePlugin.shell 이 mfa.config 로부터 자동 생성해요.
  remoteEntry URL 은 dev(localhost 포트)를 기본으로 하고, prod 는 VITE_<ID>_URL env 로 덮어요.
*/
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      mfaVitePlugin.shell({ config: mfaConfig, env }),
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
