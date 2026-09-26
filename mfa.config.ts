import type { MfaConfig } from '@inhouse-mfa/vite';
import { resolve } from 'node:path';

export const mfaConfig: MfaConfig = {
  remotes: [
    {
      cssEntry: resolve(import.meta.dirname, 'apps/scouter/src/styles/runtime.css'),
      id: 'scouter',
      port: 5174,
      workspace: '@yourssu-inhouse/scouter',
    },
    {
      id: 'member',
      port: 5175,
      workspace: '@yourssu-inhouse/member',
    },
  ],
  sharedDependencies: {
    react: { version: 'catalog', singleton: true },
    'react/': { version: 'catalog', singleton: true },
    'react-dom': { version: 'catalog', singleton: true },
    'react-dom/': { version: 'catalog', singleton: true },
    '@tanstack/react-router': { version: 'catalog', singleton: true },
    '@tanstack/react-query': { version: 'catalog', singleton: true },
    '@inhouse/auth': { singleton: true },
    '@interior/react': { singleton: true },
    '@exterior/layout': { singleton: true },
  },
};
