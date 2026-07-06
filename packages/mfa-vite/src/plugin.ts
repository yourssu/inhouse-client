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
  /** shell 이 추가로 선언할 federation 옵션(예: dev.remoteHmr override). */
  federationOptions?: Partial<ModuleFederationOptions>;
}

const SHELL_FEDERATION_NAME = 'shell';

/*
  shell(host) 용 Vite 플러그인. MfaConfig 의 remotes 로부터 federation remotes(mf 원격 등록)와
  shared(mfa-core 단일 정책)를 자동 생성해요. shell vite.config 가 직접 federation({remotes,
  shared, dev}) 를 복붙하던 걸 대체해요.

  remotes 의 entry URL 은 prod env(VITE_<ID>_URL) 를 우선하고, dev 기본(localhost:<port>/
  remoteEntry.js) 로 폴백해요. type:'module' 은 ESM remoteEntry 로드에 필수예요.
*/
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
    // dev 에서 remote 파일 저장 시 HMR 이 전파되도록 해요. host·remote 양쪽 모두 켜야 동작해요.
    dev: { remoteHmr: true },
    ...federationOptions,
  });
};

interface RemotePluginOptions {
  federationOptions?: Partial<ModuleFederationOptions>;
  /** 이 remote 의 id(MfaConfig remotes 중 하나). */
  id: string;
  /** 해당 remote 의 MfaRemoteEntry(보통 MfaConfig.remotes 에서 id 로 찾음). */
  remote: MfaRemoteEntry;
}

/*
  remote 용 Vite 플러그인. remote id·plugin.path·shared 를 MfaRemoteEntry 하나로부터 자동
  생성해요. expose 키(`./plugin`)·remoteEntry 파일명(`remoteEntry.js`)은 고정 계약 상수라
  설정에서 적지 않아도 돼요. 각 remote vite.config 가 federation({name, filename, exposes,
  shared, dev}) 를 복붙하던 걸 대체해요.
*/
const remote = ({ remote, federationOptions }: RemotePluginOptions): PluginOption => {
  const exposes: ModuleFederationOptions['exposes'] = {
    [PLUGIN_EXPOSE_KEY]: remote.plugin?.path ?? DEFAULT_PLUGIN_PATH,
  };

  return federation({
    name: remote.id,
    filename: REMOTE_ENTRY_FILENAME,
    exposes,
    shared: buildFederationShared(),
    // host 가 remoteHmr 을 켰을 때 대응하는 remote 측 설정. 양쪽 모두 켜야 cross-federation HMR.
    dev: { remoteHmr: true },
    ...federationOptions,
  });
};

export const mfaVitePlugin = { remote, shell };
