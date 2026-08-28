import type { MfaConfig } from '@yourssu-inhouse/mfa-vite';
import { resolve } from 'node:path';

export const mfaConfig: MfaConfig = {
  remotes: [
    {
      cssEntry: resolve(import.meta.dirname, 'apps/scouter/src/styles/runtime.css'),
      id: 'scouter',
      port: 5174,
    },
    {
      id: 'member',
      port: 5175,
    },
  ],
};
