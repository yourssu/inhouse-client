/*
  MFA 의 단일 출처 설정 계약이에요. 이전에는 remote 하나를 추가할 때 plugins.config.ts·shell
  vite.config.ts(federation remotes)·turbo.json build depends·shell CSS @source 가 모두 같은
  remote 정보를 다른 형태로 들고 있었어요. 이제 이 MfaConfig 한 곳에서 remote id, port, plugin
  소스 경로를 선언해요. 빌드 순서(turbo depends)는 mfa.config 가 안 다뤄요 — turbo.json 이
  유일한 출처이므로 새 remote 추가 시 turbo.json 의 shell#build.dependsOn 에 직접 한 줄 넣어요.

  "remote 는 항상 `./plugin` 하나만 노출한다" 는 컨벤션을 고정 계약으로 코드에 박았어요.
  expose 키(`PLUGIN_EXPOSE_KEY`)와 remoteEntry 산출물명(`REMOTE_ENTRY_FILENAME`)은 상수라
  설정에서 적지 않아도 돼요. shell·remote 양쪽이 같은 상수에서 파생하므로 loadRemote 매칭이
  깨지지 않아요.

  이 계약은 mfa-core(공용 계층) 에 두어요:
  - mfa-vite(빌드 계층) 가 federation/shared/ports 를 여기서 파생하고,
  - mfa-shell(런타임 계층) 이 buildRemoteSpecs(config.remotes) 로 runtime 레지스트리를 파생해요.

  mfa-core 는 node/Vite 타입을 끌어오지 않아요. 그래서 shell app 이 mfa.config.ts 를 임포트해도
  @module-federation/vite → vite → @rolldown → @types/node 체인이 app 프로그램으로 유입되지
  않아요(setInterval 이 NodeJS.Timeout 로 오염되는 현상 방지).
*/

/** 모든 remote 가 shell 에 노출하는 단일 expose 키(고정 계약). */
export const PLUGIN_EXPOSE_KEY = './plugin' as const;

/** remoteEntry 산출물 파일명(고정 계약). */
export const REMOTE_ENTRY_FILENAME = 'remoteEntry.js' as const;

/** Plugin 매니페스트 소스 경로 기본값. */
export const DEFAULT_PLUGIN_PATH = './src/plugin.ts' as const;

/** remote 가 노출할 Plugin 매니페스트 설정. path 생략 시 DEFAULT_PLUGIN_PATH 사용. */
export interface PluginSpec {
  /** Plugin 매니페스트 소스 경로. 기본 './src/plugin.ts'. */
  path?: string;
}

export interface MfaRemoteEntry {
  /** Module Federation remote 이름이자 shell 레지스트리 키. */
  id: string;
  /** Plugin 매니페스트 설정. path 생략 시 기본 './src/plugin.ts'. */
  plugin?: PluginSpec;
  /** remote dev 서버 포트. shell 이 dev entry URL 을 조립할 때 써요. */
  port: number;
}

export interface MfaConfig {
  remotes: readonly MfaRemoteEntry[];
}

export const remoteEntryDevUrl = (remote: MfaRemoteEntry): string =>
  `http://localhost:${remote.port}/${REMOTE_ENTRY_FILENAME}`;

/*
  prod 에서 shell 이 각 remote 의 remoteEntry URL 을 env 로 받아요(예: VITE_SCOUTER_URL).
  없으면 dev 기본 URL 로 폴백해요.
*/
export const envKeyForRemote = (remote: MfaRemoteEntry): string =>
  `VITE_${remote.id.toUpperCase()}_URL`;
