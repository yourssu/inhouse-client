import { mfaVitePlugin, tailwindcssPrefix } from '@inhouse-mfa/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), tailwindcssPrefix({ prefix: 'member' }), mfaVitePlugin.remote()],
});
