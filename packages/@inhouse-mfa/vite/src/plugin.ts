import type { PluginOption } from 'vite';

import { PLUGIN_EXPOSE_KEY } from '@inhouse-mfa/core';
import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import path from 'node:path';

import {
  DEFAULT_PLUGIN_PATH,
  envKeyForRemote,
  type MfaConfig,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from './config';
import { ensureGlobalModulesPlugin } from './ensureGlobalModules';
import { loadRemoteConfig } from './loadMfaConfig';
import { buildFederationShared } from './shared';
import { sharedCssPlugin } from './sharedCss';

const remoteIdsPlugin = (config: MfaConfig): PluginOption => ({
  name: 'mfa-shell-remote-ids',
  config: () => ({
    define: {
      MFA_REMOTE_IDS: JSON.stringify(config.remotes.map((remote) => remote.workspace)),
    },
  }),
});

interface ShellPluginOptions {
  config: MfaConfig;
  /** loadEnv 로 읽은 env(빈 값이면 dev 기본 URL 폴백). */
  env?: Record<string, string | undefined>;
  /** shell 이 추가로 선언할 federation 옵션. */
  federationOptions?: Partial<ModuleFederationOptions>;
}

const SHELL_FEDERATION_NAME = 'shell';

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
      name: SHELL_FEDERATION_NAME,
      remotes,
      runtimePlugins: ['@inhouse-mfa/vite/retry-plugin'],
      shared,
      // remote DTS 산출물을 소비하는 곳이 없어 tsc 자식 프로세스 비용만 발생해요.
      dts: false,
      dev: { remoteHmr: true },
      ...federationOptions,
    }),
    ensureGlobalModulesPlugin(shared),
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
  const exposes: ModuleFederationOptions['exposes'] = {
    [PLUGIN_EXPOSE_KEY]: entry.plugin?.path ?? DEFAULT_PLUGIN_PATH,
  };
  const watchedFiles = new Set(configFiles.map((file) => path.resolve(file)));

  return [
    sharedCssPlugin(config.sharedCSS ?? [], entry.workspace),
    {
      name: 'mfa-remote-config',
      config(viteConfig) {
        if (viteConfig.build?.cssCodeSplit === false) {
          throw new Error(
            '[mfa] cssCodeSplit must remain enabled to load remote CSS through the Vite module graph.',
          );
        }
        return { server: { port: viteConfig.server?.port ?? entry.port } };
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
    },
    federation({
      name: entry.workspace,
      filename: REMOTE_ENTRY_FILENAME,
      exposes,
      shared,
      dts: false,
      dev: { remoteHmr: true },
    }),
    ensureGlobalModulesPlugin(shared),
  ];
};

export const mfaVitePlugin = { remote, shell };
