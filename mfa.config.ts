import type { MfaConfig } from '@yourssu-inhouse/mfa-vite';

export const mfaConfig: MfaConfig = {
  remotes: [
    {
      cssEntry: './src/styles/runtime.css',
      id: 'scouter',
      port: 5174,
    },
    {
      id: 'member',
      port: 5175,
    },
  ],
};
