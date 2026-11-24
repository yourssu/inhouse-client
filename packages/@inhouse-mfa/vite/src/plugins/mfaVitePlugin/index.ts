import type { PluginOption } from 'vite';

import { PLUGIN_EXPOSE_KEY } from '@inhouse-mfa/core';
import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import { keyBy, mapValues } from 'es-toolkit';

import {
  DEFAULT_PLUGIN_ENTRY,
  envKeyForRemote,
  type MfaConfig,
  REMOTE_CONTRACT_ID,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from '../../core/config';
import { loadRemoteConfig } from '../../core/loadMfaConfig';
import { buildFederationShared } from '../../core/shared';
import { remoteAssetsPlugin } from '../remoteAssetsPlugin';
import { remoteContractPlugin } from '../remoteContractPlugin';
import { remoteHmrPlugin } from '../remoteHmrPlugin';
import { sharedCssPlugin } from '../sharedCssPlugin';
import { appPlugins } from './appPlugins';
import { ensureGlobalModulesPlugin } from './ensureGlobalModulesPlugin';
import { remoteConfigPlugin } from './remoteConfigPlugin';
import { remoteIdsPlugin } from './remoteIdsPlugin';

interface ShellPluginOptions {
  config: MfaConfig;
  /** loadEnv 로 읽은 env(빈 값이면 dev 기본 URL 폴백). */
  env?: Record<string, string | undefined>;
}

export interface RemotePluginOptions {
  /** Vite root 기준 remote plugin 진입점. 기본 './remotePlugin.ts'. */
  pluginEntry?: string;
}

const federationDefaults = {
  dts: false,
  dev: { remoteHmr: true },
  shareStrategy: 'version-first',
} satisfies Partial<ModuleFederationOptions>;

const shell = (options: ShellPluginOptions): PluginOption => {
  if ('federationOptions' in options) {
    throw new Error(
      '[mfa-vite] federationOptions is not supported. Configure shared dependencies and remotes through mfa.config.ts.',
    );
  }

  const { config, env = {} } = options;
  const shared = buildFederationShared(config.sharedDependencies);
  const remotes: ModuleFederationOptions['remotes'] = mapValues(
    keyBy(config.remotes, (remote) => remote.workspace),
    (remote) => ({
      type: 'module',
      name: remote.workspace,
      entry: env[envKeyForRemote(remote)] ?? remoteEntryDevUrl(remote),
    }),
  );

  return [
    remoteIdsPlugin(config),
    federation({
      ...federationDefaults,
      name: 'shell',
      remotes,
      runtimePlugins: ['@inhouse-mfa/vite/retry-plugin'],
      shared,
    }),
    ensureGlobalModulesPlugin(shared),
    ...appPlugins(),
  ];
};

const remote = async ({ pluginEntry = DEFAULT_PLUGIN_ENTRY }: RemotePluginOptions = {}): Promise<
  PluginOption[]
> => {
  const {
    config,
    configFiles,
    remote: entry,
    workspaceRoot,
  } = await loadRemoteConfig(process.cwd());
  const shared = buildFederationShared(config.sharedDependencies, workspaceRoot);

  return [
    remoteAssetsPlugin(),
    remoteContractPlugin(entry.workspace, pluginEntry),
    sharedCssPlugin(config.sharedCSS ?? []),
    remoteConfigPlugin(entry, configFiles),
    federation({
      ...federationDefaults,
      name: entry.workspace,
      filename: REMOTE_ENTRY_FILENAME,
      exposes: { [PLUGIN_EXPOSE_KEY]: REMOTE_CONTRACT_ID },
      shared,
    }),
    ensureGlobalModulesPlugin(shared),
    ...appPlugins(),
    remoteHmrPlugin(),
  ];
};

export const mfaVitePlugin = { remote, shell };
