import type { Plugin, ResolvedConfig } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

import type { FederationSharedConfig } from '../../core/shared';

import { satisfiesRequiredVersion } from '../../core/version';

/** 앱 root 아래 실제 설치된 버전을 읽는다. pnpm symlink는 fs가 그대로 따라간다. */
const readInstalledVersion = (root: string, pkg: string): string | undefined => {
  const manifest = path.join(root, 'node_modules', pkg, 'package.json');
  if (!fs.existsSync(manifest)) {
    return undefined;
  }
  try {
    return (JSON.parse(fs.readFileSync(manifest, 'utf8')) as { version?: string }).version;
  } catch (error) {
    throw new Error(`[mfa-vite] cannot read installed version from ${manifest}`, {
      cause: error,
    });
  }
};

/**
 * shell·remote 구동 시점에 앱에 실제 설치된 의존성 버전이 shared requiredVersion과 맞는지
 * 검사한다. 어긋나면 build를 실패시켜 runtime 버전 협상 실패가 화면 장애로 번지는 일을
 * 사전에 차단한다. requiredVersion이 없는 workspace 의존성은 항상 같은 소스라 제외한다.
 */
export const ensureGlobalModulesPlugin = (shared: FederationSharedConfig): Plugin => ({
  name: 'mfa-ensure-global-modules',
  configResolved(resolved: ResolvedConfig) {
    for (const [dep, policy] of Object.entries(shared)) {
      if (!policy.requiredVersion) {
        continue;
      }
      const pkg = dep.replace(/\/+$/, '');
      const version = readInstalledVersion(resolved.root, pkg);
      if (version && !satisfiesRequiredVersion(version, policy.requiredVersion)) {
        throw new Error(
          `[mfa-vite] ${pkg}@${version} does not satisfy the shared requiredVersion '${policy.requiredVersion}'. Update '${pkg}' in ${resolved.root} and reinstall.`,
        );
      }
    }
  },
});
