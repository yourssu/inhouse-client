import type { PluginOption } from 'vite';

import type { MfaConfig } from '../../core/config';

export const remoteIdsPlugin = (config: MfaConfig): PluginOption => ({
  name: 'mfa-shell-remote-ids',
  config: () => ({
    define: {
      MFA_REMOTE_IDS: JSON.stringify(config.remotes.map((remote) => remote.workspace)),
    },
  }),
});
