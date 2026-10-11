import { mfaVitePlugin } from '@inhouse-mfa/vite';
import { defineConfig, loadEnv } from 'vite';

import { mfaConfig } from '../../mfa.config';

export default defineConfig(({ mode }) => ({
  plugins: [mfaVitePlugin.shell({ config: mfaConfig, env: loadEnv(mode, process.cwd(), '') })],
  server: { port: 5173, fs: { strict: false } },
}));
