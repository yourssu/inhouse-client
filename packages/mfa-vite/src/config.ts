/** remote plugin manifest source의 기본 경로. */
export const DEFAULT_PLUGIN_PATH = './src/plugin.ts' as const;

/** remoteEntry 산출물 파일명. */
export const REMOTE_ENTRY_FILENAME = 'remoteEntry.js' as const;

export interface PluginSpec {
  /** Plugin manifest source path. 기본값은 './src/plugin.ts'. */
  path?: string;
}

export interface MfaRemoteEntry {
  /** Shell Tailwind build에 포함할 remote CSS source. */
  cssEntry?: string;
  /** Module Federation remote name이자 shell registry key. */
  id: string;
  /** Plugin manifest 설정. */
  plugin?: PluginSpec;
  /** Remote dev server port. */
  port: number;
}

export interface MfaConfig {
  remotes: readonly MfaRemoteEntry[];
}

export const remoteEntryDevUrl = (remote: MfaRemoteEntry): string =>
  `http://localhost:${remote.port}/${REMOTE_ENTRY_FILENAME}`;

export const envKeyForRemote = (remote: MfaRemoteEntry): string =>
  `VITE_${remote.id.toUpperCase()}_URL`;
