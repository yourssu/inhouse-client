import type { MfaConfig } from '@inhouse-mfa/vite';

export const mfaConfig: MfaConfig = {
  remotes: [
    {
      port: 5174,
      workspace: '@yourssu-inhouse/scouter',
    },
    {
      port: 5175,
      workspace: '@yourssu-inhouse/member',
    },
  ],
  sharedCSS: [
    '@interior/react/reset.css',
    '@interior/react/token.css',
    '@interior/react/component.css',
    '@exterior/layout/index.css',
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
