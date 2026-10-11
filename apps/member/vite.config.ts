import { mfaVitePlugin } from '@inhouse-mfa/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [mfaVitePlugin.remote()],
});
