import type { PluginOption } from 'vite';

import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import { PLUGIN_EXPOSE_KEY } from '@yourssu-inhouse/mfa-core';
import fs from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_PLUGIN_PATH,
  envKeyForRemote,
  type MfaConfig,
  type MfaRemoteEntry,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from './config';
import { buildFederationShared } from './shared';

/** shell Tailwind build에 remote CSS import를 생성하는 파일 이름. */
const REMOTE_CSS_GEN_FILENAME = 'mfa-remotes.gen.css';

/** CSS @import 경로는 POSIX 슬래시여야 해요. Windows 백슬래시를 정규화해요. */
const toPosix = (p: string): string => p.split(path.sep).join('/');

const buildRemoteCssContent = (root: string, config: MfaConfig): string => {
  const appsDir = path.resolve(root, '..');
  const genDir = path.resolve(root, 'src/styles');
  const lines: string[] = [
    '/* 자동 생성 파일 — 직접 수정하지 마세요. mfa.config.ts의 cssEntry로 생성해요. */',
  ];

  for (const remote of config.remotes) {
    if (!remote.cssEntry) {
      continue;
    }

    const cssEntryAbs = path.resolve(appsDir, remote.id, remote.cssEntry);
    if (!fs.existsSync(cssEntryAbs)) {
      throw new Error(`[mfa-vite] '${remote.id}' cssEntry not found: ${cssEntryAbs}`);
    }
    lines.push(`@import '${toPosix(path.relative(genDir, cssEntryAbs))}';`);
  }

  return `${lines.join('\n')}\n`;
};

/**
 * configResolved 에서 gen 파일을 (내용이 바뀐 경우만) 작성해요.
 * 내용이 같으면 write 를 skip 해 mtime 갱신으로 인한 파일 감시자 불필요 반응을 막아요.
 * gen 파일은 커밋 대상이라 신규 클론에도 존재하지만, 매 빌드/dev 시작에 최신 상태로 보정해요.
 */
const writeRemoteCssGen = (root: string, config: MfaConfig): void => {
  const genPath = path.resolve(root, 'src/styles', REMOTE_CSS_GEN_FILENAME);
  const next = buildRemoteCssContent(root, config);
  const prev = fs.existsSync(genPath) ? fs.readFileSync(genPath, 'utf8') : null;
  if (next === prev) {
    return;
  }
  fs.mkdirSync(path.dirname(genPath), { recursive: true });
  fs.writeFileSync(genPath, next);
};

const remoteCssGenPlugin = (config: MfaConfig): PluginOption => ({
  name: 'mfa-shell-remote-css',
  configResolved(resolved) {
    writeRemoteCssGen(resolved.root, config);
  },
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

  return [
    federation({
      name: SHELL_FEDERATION_NAME,
      remotes,
      runtimePlugins: ['@yourssu-inhouse/mfa-vite/retry-plugin'],
      shared: buildFederationShared(),
      dev: { remoteHmr: true },
      ...federationOptions,
    }),
    remoteCssGenPlugin(config),
  ];
};

interface RemotePluginOptions {
  federationOptions?: Partial<ModuleFederationOptions>;
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
