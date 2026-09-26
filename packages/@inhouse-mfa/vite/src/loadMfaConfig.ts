import fs from 'node:fs';
import path from 'node:path';
import { runnerImport } from 'vite';

import type { MfaConfig, MfaRemoteEntry } from './config';

const mfaConfigFilename = 'mfa.config.ts';
const workspaceFilename = 'pnpm-workspace.yaml';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMfaConfig = (value: unknown): value is MfaConfig =>
  isRecord(value) &&
  Array.isArray(value.remotes) &&
  value.remotes.every(
    (remote: unknown) =>
      isRecord(remote) &&
      typeof remote.id === 'string' &&
      typeof remote.port === 'number' &&
      typeof remote.workspace === 'string',
  ) &&
  isRecord(value.sharedDependencies) &&
  Object.values(value.sharedDependencies).every(
    (policy) =>
      isRecord(policy) &&
      (policy.version === undefined || policy.version === 'catalog') &&
      (policy.singleton === undefined || typeof policy.singleton === 'boolean'),
  );

export const findWorkspaceRoot = (startDir: string): string => {
  let current = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(current, workspaceFilename))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`[mfa-vite] ${workspaceFilename} not found above ${startDir}`);
    }
    current = parent;
  }
};

interface LoadedRemoteConfig {
  config: MfaConfig;
  configFiles: string[];
  remote: MfaRemoteEntry;
  workspaceRoot: string;
}

export const loadRemoteConfig = async (appRoot: string): Promise<LoadedRemoteConfig> => {
  const packagePath = path.join(appRoot, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error(`[mfa-vite] remote workspace package.json not found: ${packagePath}`);
  }
  let packageJson: unknown;
  try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (error) {
    throw new Error(`[mfa-vite] cannot read remote workspace package: ${packagePath}`, {
      cause: error,
    });
  }
  if (!isRecord(packageJson) || typeof packageJson.name !== 'string') {
    throw new Error(`[mfa-vite] remote workspace package name is missing: ${packagePath}`);
  }

  const workspaceRoot = findWorkspaceRoot(appRoot);
  const configPath = path.join(workspaceRoot, mfaConfigFilename);
  if (!fs.existsSync(configPath)) {
    throw new Error(`[mfa-vite] central config not found: ${configPath}`);
  }
  const loaded = await runnerImport<{ mfaConfig?: unknown }>(configPath, { root: workspaceRoot });
  if (!isMfaConfig(loaded.module.mfaConfig)) {
    throw new Error(
      `[mfa-vite] ${configPath} must export mfaConfig with remotes and sharedDependencies.`,
    );
  }
  const remotes = loaded.module.mfaConfig.remotes.filter(
    (remote) => remote.workspace === packageJson.name,
  );
  if (remotes.length !== 1) {
    throw new Error(
      `[mfa-vite] workspace '${packageJson.name}' has ${remotes.length} remote registrations in ${configPath}; expected exactly one.`,
    );
  }

  return {
    config: loaded.module.mfaConfig,
    configFiles: [configPath, path.join(workspaceRoot, workspaceFilename), ...loaded.dependencies],
    remote: remotes[0],
    workspaceRoot,
  };
};
