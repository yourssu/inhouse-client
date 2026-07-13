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
    fs: {
      // NOTE: Window에서 ~ 라우팅이 예약어인 이슈가 있어 우회합니다.
      strict: false,
    },
  },
});
