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
  /** shell 이 추가로 선언할 federation 옵션. */
  federationOptions?: Partial<ModuleFederationOptions>;
}

const federationDefaults = {
  dts: false,
  dev: { remoteHmr: true },
} satisfies Partial<ModuleFederationOptions>;

const shell = ({ config, env = {}, federationOptions }: ShellPluginOptions): PluginOption => {
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
      ...federationOptions,
    }),
    ensureGlobalModulesPlugin(shared),
    ...appPlugins('shell'),
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
    ...appPlugins(entry.workspace.slice(entry.workspace.lastIndexOf('/') + 1)),
  ];
};

export const mfaVitePlugin = { remote, shell };
