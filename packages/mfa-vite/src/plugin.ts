import type { PluginOption } from 'vite';

import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import { buildFederationShared } from '@yourssu-inhouse/mfa-core';

import {
  DEFAULT_PLUGIN_PATH,
  envKeyForRemote,
  type MfaConfig,
  type MfaRemoteEntry,
  PLUGIN_EXPOSE_KEY,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from './config';

interface ShellPluginOptions {
  config: MfaConfig;
  /** loadEnv 로 읽은 env(빈 값이면 dev 기본 URL 폴백). */
  env?: Record<string, string | undefined>;
  /** shell 이 추가로 선언할 federation 옵션. */
  federationOptions?: Partial<ModuleFederationOptions>;
}

const SHELL_FEDERATION_NAME = 'shell';

const shell = ({ config, env = {}, federationOptions }: ShellPluginOptions): PluginOption => {
  const remotes: ModuleFederationOptions['remotes'] = Object.fromEntries(
    config.remotes.map((remote) => [
      remote.id,
      {
        type: 'module',
        name: remote.id,
        entry: env[envKeyForRemote(remote)] ?? remoteEntryDevUrl(remote),
      },
    ]),
  );

  return federation({
    name: SHELL_FEDERATION_NAME,
    remotes,
    shared: buildFederationShared(),
    dev: { remoteHmr: true },
    ...federationOptions,
  });
};

interface RemotePluginOptions {
  federationOptions?: Partial<ModuleFederationOptions>;
  /** 이 remote 의 id(MfaConfig remotes 중 하나). */
  id: string;
  /** 해당 remote 의 MfaRemoteEntry. */
  remote: MfaRemoteEntry;
}

const remote = ({ remote, federationOptions }: RemotePluginOptions): PluginOption => {
  const exposes: ModuleFederationOptions['exposes'] = {
    [PLUGIN_EXPOSE_KEY]: remote.plugin?.path ?? DEFAULT_PLUGIN_PATH,
  };

  return federation({
    name: remote.id,
    filename: REMOTE_ENTRY_FILENAME,
    exposes,
    shared: buildFederationShared(),
    dev: { remoteHmr: true },
    ...federationOptions,
  });
};

export const mfaVitePlugin = { remote, shell };
