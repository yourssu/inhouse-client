/** 모든 remote 가 shell 에 노출하는 단일 expose 키. */
export const PLUGIN_EXPOSE_KEY = './plugin' as const;

/** remoteEntry 산출물 파일명. */
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
  /** remote dev 서버 포트. */
  port: number;
}

export interface MfaConfig {
  remotes: readonly MfaRemoteEntry[];
}

export const remoteEntryDevUrl = (remote: MfaRemoteEntry): string =>
  `http://localhost:${remote.port}/${REMOTE_ENTRY_FILENAME}`;

export const envKeyForRemote = (remote: MfaRemoteEntry): string =>
  `VITE_${remote.id.toUpperCase()}_URL`;
