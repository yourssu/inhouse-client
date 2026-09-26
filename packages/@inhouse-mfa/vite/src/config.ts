/** remote plugin manifest source의 기본 경로. */
export const DEFAULT_PLUGIN_PATH = './src/plugin.ts' as const;

/** remoteEntry 산출물 파일명. */
export const REMOTE_ENTRY_FILENAME = 'remoteEntry.js' as const;

export interface PluginSpec {
  /** Plugin manifest source path. 기본값은 './src/plugin.ts'. */
  path?: string;
}

export interface MfaRemoteEntry {
  /** Shell Tailwind build에 포함할 remote CSS source의 절대 경로. */
  cssEntry?: string;
  /** Plugin manifest 설정. */
  plugin?: PluginSpec;
  /** Remote dev server port. */
  port: number;
  /** 이 remote를 소유한 workspace package name이자 Module Federation remote id. */
  workspace: string;
}

export interface MfaSharedDependency {
  singleton?: boolean;
  /** pnpm workspace catalog에서 requiredVersion을 읽는다. */
  version?: 'catalog';
}

export interface MfaConfig {
  remotes: readonly MfaRemoteEntry[];
  sharedDependencies: Record<string, MfaSharedDependency>;
}

export const remoteEntryDevUrl = (remote: MfaRemoteEntry): string =>
  `http://localhost:${remote.port}/${REMOTE_ENTRY_FILENAME}`;

/** env var key에는 '@'·'/'를 쓸 수 없어 마지막 세그먼트만 써요. */
export const envKeyForRemote = (remote: MfaRemoteEntry): string =>
  `VITE_${remote.workspace.slice(remote.workspace.lastIndexOf('/') + 1).toUpperCase()}_URL`;
