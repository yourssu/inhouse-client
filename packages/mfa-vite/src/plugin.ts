import type { PluginOption } from 'vite';

import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import { buildFederationShared } from '@yourssu-inhouse/mfa-core';
import fs from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_PLUGIN_PATH,
  envKeyForRemote,
  type MfaConfig,
  type MfaRemoteEntry,
  PLUGIN_EXPOSE_KEY,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from './config';

/**
 * shell 이 remote 커스텀 CSS 를 단일 Tailwind 빌드에 병합하기 위해 생성하는 파일 이름.
 * apps/<shell>/src/styles/ 아래에 두고 index.css 가 일반 @import 한 줄로 로드해요.
 * 각 remote 의 plugin.ts cssEntry 를 스크랩해 @import 줄을 채워요. routeTree.gen.ts 와 동일하게 커밋해요.
 */
const REMOTE_CSS_GEN_FILENAME = 'mfa-remotes.gen.css';

/**
 * plugin.ts 소스에서 cssEntry 값을 정규식으로 추출해요.
 * plugin.ts 가 routeTree 를 import 해 빌드 타임에 실행할 수 없어 import 로 읽지 못하고 소스 텍스트를 스크랩해요.
 * plugin.ts 당 defineRemotePlugin 호출 하나라 첫 번째 매치를 써요.
 */
const CSS_ENTRY_RE = /cssEntry\s*:\s*['"]([^'"]+)['"]/;

/** CSS @import 경로는 POSIX 슬래시여야 해요. Windows 백슬래시를 정규화해요. */
const toPosix = (p: string): string => p.split(path.sep).join('/');

/**
 * 각 remote 의 보조 CSS 를 @import 로 모은 gen 파일 내용을 만들어요.
 * shell vite root(= apps/<shell>) 의 한 단계 위가 apps/ 라는 모노레포 구조를 가정해요.
 * 각 remote 의 plugin.ts(remote.plugin?.path, 기본값 DEFAULT_PLUGIN_PATH) 를 읽어 cssEntry 를 스크랩하고,
 * 그 경로가 가리키는 파일이 존재하면 gen 파일 기준 상대 @import 줄을 추가해요.
 * cssEntry 가 없거나 대상 파일이 없는 remote(member 등)는 건너뛰어요.
 */
const buildRemoteCssContent = (root: string, config: MfaConfig): string => {
  const appsDir = path.resolve(root, '..');
  const genDir = path.resolve(root, 'src/styles');
  const lines: string[] = [
    '/* 자동 생성 파일 — 직접 수정하지 마세요. packages/mfa-vite 가 각 remote plugin.ts 의 cssEntry 를 스크랩해 생성해요. */',
  ];
  for (const remote of config.remotes) {
    const pluginRel = remote.plugin?.path ?? DEFAULT_PLUGIN_PATH;
    const pluginAbs = path.resolve(appsDir, remote.id, pluginRel);
    const src = fs.existsSync(pluginAbs) ? fs.readFileSync(pluginAbs, 'utf8') : '';
    const match = CSS_ENTRY_RE.exec(src);
    if (!match) {
      continue;
    }
    const cssEntryAbs = path.resolve(appsDir, remote.id, match[1]);
    if (!fs.existsSync(cssEntryAbs)) {
      continue;
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
      shared: buildFederationShared(),
      dev: { remoteHmr: true },
      ...federationOptions,
    }),
    remoteCssGenPlugin(config),
  ];
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
