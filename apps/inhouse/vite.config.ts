import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { mfaVitePlugin } from '@yourssu-inhouse/mfa-vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { mfaConfig } from '../../mfa.config';

const remote = mfaConfig.remotes.find((entry) => entry.id === 'inhouse');

if (!remote) {
  throw new Error('[inhouse] mfa.config 에 inhouse remote 가 없어요');
}

/*
  inhouse 는 Module Federation remote("inhouse")예요.
  shell(host)가 런타임에 `loadRemote('inhouse/plugin')` 로 Plugin manifest 를 가져와 자기 _auth
  아래에 graft 하고 init/mocks lifecycle 을 중앙 실행해요. federation(name/filename/exposes/
  shared/dev.remoteHmr) 은 mfaVitePlugin.remote 가 mfa.config 의 inhouse entry 로부터 자동
  생성해요. preview 부트(main.tsx)는 dev preview·빌드 entry 용으로 남겨요.
*/
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mfaVitePlugin.remote({ id: 'inhouse', remote }),
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
    cors: true,
    port: 5175,
  },
});
