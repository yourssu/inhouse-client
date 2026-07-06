import type { PluginOption } from 'vite';

import { federation, type ModuleFederationOptions } from '@module-federation/vite';
import { buildFederationShared } from '@yourssu-inhouse/mfa-core';

import { envKeyForRemote, type MfaConfig, type MfaRemoteEntry, remoteEntryDevUrl } from './config';

export interface ShellPluginOptions {
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
  <entryPath>) 로 폴백해요. type:'module' 은 ESM remoteEntry 로드에 필수예요.
*/
export const shell = ({
  config,
  env = {},
  federationOptions,
}: ShellPluginOptions): PluginOption => {
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

export interface RemotePluginOptions {
  federationOptions?: Partial<ModuleFederationOptions>;
  /** 이 remote 의 id(MfaConfig remotes 중 하나). */
  id: string;
  /** 해당 remote 의 MfaRemoteEntry(보통 MfaConfig.remotes 에서 id 로 찾음). */
  remote: MfaRemoteEntry;
}

/*
  remote 용 Vite 플러그인. remote id·entryPath·expose·sourcePath·shared 를 MfaRemoteEntry
  하나로부터 자동 생성해요. 각 remote vite.config 가 federation({name, filename, exposes,
  shared, dev}) 를 복붙하던 걸 대체해요.
*/
export const remote = ({ remote, federationOptions }: RemotePluginOptions): PluginOption => {
  const exposes: ModuleFederationOptions['exposes'] = {
    [remote.expose]: remote.sourcePath,
  };

  return federation({
    name: remote.id,
    filename: remote.entryPath,
    exposes,
    shared: buildFederationShared(),
    // host 가 remoteHmr 을 켰을 때 대응하는 remote 측 설정. 양쪽 모두 켜야 cross-federation HMR.
    dev: { remoteHmr: true },
    ...federationOptions,
  });
};

export const mfaVitePlugin = { remote, shell };
