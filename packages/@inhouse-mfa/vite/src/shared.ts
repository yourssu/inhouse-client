import fs from 'node:fs';
import path from 'node:path';

import type { MfaConfig } from './config';

import { findWorkspaceRoot } from './loadMfaConfig';

interface SharedDepPolicy {
  requiredVersion?: string;
  singleton?: boolean;
}

export type FederationSharedConfig = Record<string, SharedDepPolicy>;

/** catalog 블록의 평평한 key: value만 파싱한다. ponytail: named catalog·주석이 필요해지면 yaml 파서로 교체한다. */
const parseCatalog = (workspaceYaml: string): Record<string, string> => {
  const lines = workspaceYaml.split('\n');
  const catalogStart = lines.findIndex((line) => line.trim() === 'catalog:');
  if (catalogStart === -1) {
    throw new Error('[mfa-vite] pnpm-workspace.yaml has no catalog block');
  }
  const catalog: Record<string, string> = {};
  for (const line of lines.slice(catalogStart + 1)) {
    if (line.trim() && !line.startsWith(' ')) {
      break;
    }
    const entry = /^\s+'?([^':]+)'?:\s*'?(.+?)'?\s*$/.exec(line);
    if (entry) {
      catalog[entry[1].trim()] = entry[2].trim();
    }
  }
  return catalog;
};

/** shared 버전의 단일 원천인 pnpm workspace catalog를 읽는다. */
const readWorkspaceCatalog = (startDir: string = process.cwd()): Record<string, string> => {
  const workspaceRoot = findWorkspaceRoot(startDir);
  return parseCatalog(fs.readFileSync(path.join(workspaceRoot, 'pnpm-workspace.yaml'), 'utf8'));
};

export const buildFederationShared = (
  sharedDependencies: MfaConfig['sharedDependencies'],
  startDir: string = process.cwd(),
): FederationSharedConfig => {
  const needsCatalog = Object.values(sharedDependencies).some(
    (policy) => policy.version === 'catalog',
  );
  const catalog = needsCatalog ? readWorkspaceCatalog(startDir) : undefined;
  const shared: FederationSharedConfig = {};
  for (const [dep, policy] of Object.entries(sharedDependencies)) {
    const entry: SharedDepPolicy = {};
    if (policy.version === 'catalog') {
      const catalogKey = dep.replace(/\/+$/, '');
      const requiredVersion = catalog?.[catalogKey];
      if (!requiredVersion) {
        throw new Error(
          `[mfa-vite] pnpm workspace catalog has no '${catalogKey}' entry required by shared dep '${dep}'`,
        );
      }
      entry.requiredVersion = requiredVersion;
    }
    if (policy.singleton !== undefined) {
      entry.singleton = policy.singleton;
    }
    shared[dep] = entry;
  }
  return shared;
};
