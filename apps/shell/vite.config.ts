import { mfaVitePlugin, tailwindcssPrefix } from '@inhouse-mfa/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

import { mfaConfig } from '../../mfa.config';

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    tailwindcssPrefix({ prefix: 'shell' }),
    mfaVitePlugin.shell({ config: mfaConfig, env: loadEnv(mode, process.cwd(), '') }),
  ],
  server: { port: 5173, fs: { strict: false } },
}));
