import type { PluginOption } from 'vite';

import { PLUGIN_EXPOSE_KEY } from '@inhouse-mfa/core';
import { federation, type ModuleFederationOptions } from '@module-federation/vite';

import {
  DEFAULT_ROUTE_PATH,
  envKeyForRemote,
  type MfaConfig,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from '../../core/config';
import { loadRemoteConfig } from '../../core/loadMfaConfig';
import { buildFederationShared } from '../../core/shared';
import { remoteAssetsPlugin } from '../remoteAssetsPlugin';
import { remoteContractPlugin } from '../remoteContractPlugin';
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
  const remotes: ModuleFederationOptions['remotes'] = Object.fromEntries(
    config.remotes.map((remote) => [
      remote.workspace,
      {
        type: 'module',
        name: remote.workspace,
        entry: env[envKeyForRemote(remote)] ?? remoteEntryDevUrl(remote),
      },
    ]),
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

const remote = async (): Promise<PluginOption[]> => {
  const {
    config,
    configFiles,
    remote: entry,
    workspaceRoot,
  } = await loadRemoteConfig(process.cwd());
  const shared = buildFederationShared(config.sharedDependencies, workspaceRoot);
  return [
    remoteAssetsPlugin(),
    remoteContractPlugin(),
    sharedCssPlugin(config.sharedCSS ?? [], entry.workspace),
    remoteConfigPlugin(entry, [
      ...configFiles,
      ...['route.ts', 'global.ts', 'global.tsx'].map(
        (file) => `${process.cwd()}/inhouse-mfa/${file}`,
      ),
    ]),
    federation({
      ...federationDefaults,
      name: entry.workspace,
      filename: REMOTE_ENTRY_FILENAME,
      exposes: { [PLUGIN_EXPOSE_KEY]: DEFAULT_ROUTE_PATH },
      shared,
    }),
    ensureGlobalModulesPlugin(shared),
    ...appPlugins(),
  ];
};

export const mfaVitePlugin = { remote, shell };
