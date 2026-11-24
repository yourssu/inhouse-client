import type { Plugin } from 'vite';

import path from 'node:path';

import type { MfaRemoteEntry } from '../../core/config';

import { REMOTE_CONTRACT_ID } from '../../core/config';

export const remoteConfigPlugin = (
  remote: MfaRemoteEntry,
  configFiles: readonly string[],
): Plugin => {
  const watchedFiles = new Set(configFiles.map((file) => path.resolve(file)));

  return {
    name: 'mfa-remote-config',
    config(config) {
      if (config.build?.cssCodeSplit === false) {
        throw new Error(
          '[mfa] cssCodeSplit must remain enabled to load remote CSS through the Vite module graph.',
        );
      }

      return {
        build: {
          rolldownOptions: {
            input: REMOTE_CONTRACT_ID,
          },
        },
        server: {
          port: config.server?.port ?? remote.port,
          cors: true,
          // Vite serves file routes containing '~' on Windows through the workspace file system.
          fs: { strict: false },
        },
      };
    },
    configureServer(server) {
      server.watcher.add([...watchedFiles]);
    },
    async hotUpdate({ file, server }) {
      if (watchedFiles.has(path.resolve(file))) {
        await server.restart();
        return [];
      }
    },
  };
};
