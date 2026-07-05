/*
  MFA 의 단일 출처 설정 계약이에요. 이전에는 remote 하나를 추가할 때 plugins.config.ts·shell
  vite.config.ts(federation remotes)·turbo.json build depends·shell CSS @source 가 모두 같은
  remote 정보를 다른 형태로 들고 있었어요. 이제 이 MfaConfig 한 곳에서 remote id, port, entry,
  expose, build dependency, css source 를 선언해요.

  이 계약은 mfa-core(공용 계층) 에 두어요:
  - mfa-vite(빌드 계층) 가 federation/shared/ports 와 turbo 의존성을 여기서 파생하고,
  - mfa-shell(런타임 계층) 이 buildRemoteSpecs(config.remotes) 로 runtime 레지스트리를 파생해요.

  mfa-core 는 node/Vite 타입을 끌어오지 않아요. 그래서 shell app 이 mfa.config.ts 를 임포트해도
  @module-federation/vite → vite → @rolldown → @types/node 체인이 app 프로그램으로 유입되지
  않아요(setInterval 이 NodeJS.Timeout 로 오염되는 현상 방지). 새 remote 추가 시 이 파일 한 곳 +
  (필요 시) turbo build depends 한 줄만 고쳐요.
*/
export interface MfaRemoteEntry {
  /*
    이 remote 가 빌드되어야 shell 빌드가 의존하는 패키지 이름들(turbo build depends 용).
    mfa-vite 가 turbo.json 의존성을 자동 수정하지는 않지만, 이 필드를 두어 설정 한 곳에서
    의존성을 추적해요.
  */
  buildDeps?: string[];
  /** remoteEntry 산출물 파일명(예: 'remoteEntry.js'). */
  entryPath: string;
  /** shell 이 loadRemote 로 가져올 expose 키(예: './plugin'). */
  expose: string;
  /** Module Federation remote 이름이자 shell 레지스트리 키. */
  id: string;
  /** remote dev 서버 포트. shell 이 dev entry URL 을 조립할 때 써요. */
  port: number;
  /** expose 가 가리키는 소스 경로(예: './src/plugin.ts'). */
  sourcePath: string;
}

export interface MfaConfig {
  remotes: readonly MfaRemoteEntry[];
}

export const remoteEntryDevUrl = (remote: MfaRemoteEntry): string =>
  `http://localhost:${remote.port}/${remote.entryPath}`;

/*
  prod 에서 shell 이 각 remote 의 remoteEntry URL 을 env 로 받아요(예: VITE_SCOUTER_URL).
  없으면 dev 기본 URL 로 폴백해요.
*/
export const envKeyForRemote = (remote: MfaRemoteEntry): string =>
  `VITE_${remote.id.toUpperCase()}_URL`;
