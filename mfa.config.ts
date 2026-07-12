import type { MfaConfig } from '@yourssu-inhouse/mfa-core';

export const mfaConfig: MfaConfig = {
  remotes: [
    {
      id: 'scouter',
      port: 5174,
    },
    {
      id: 'inhouse',
      port: 5175,
    },
  ],
};
