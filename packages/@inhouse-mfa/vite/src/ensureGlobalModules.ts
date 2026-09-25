import type { Plugin, ResolvedConfig } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

import { buildFederationShared } from './shared';

interface Semver {
  major: number;
  minor: number;
  patch: number;
}

/** major.minor[.patch] 앞부분만 파싱한다. prerelease 접미사는 버전 비교에서 무시한다. */
const parseSemver = (value: string): Semver | undefined => {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(value.trim());
  if (!match) {
    return undefined;
  }
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3] ?? 0) };
};

const compareSemver = (a: Semver, b: Semver): number =>
  a.major - b.major || a.minor - b.minor || a.patch - b.patch;

/**
 * shared requiredVersion에 이 레포가 쓰는 범위 문법(`*`, exact, caret)으로 호환을 검사한다.
 * 지원하지 않는 문법은 검증 없이 통과시키지 않도록 실패한다.
 * ponytail: `^0.x` minor 잠금, prerelease 우선순위, 복합 범위는 현재 계약에 없어 생략.
 */
export const satisfiesRequiredVersion = (version: string, range: string): boolean => {
  const normalized = range.trim();
  if (normalized === '*') {
    return true;
  }
  const isCaret = normalized.startsWith('^');
  const required = parseSemver(isCaret ? normalized.slice(1) : normalized);
  const actual = parseSemver(version);
  if (!required || !actual) {
    throw new Error(
      `[mfa-vite] cannot compare version '${version}' with requiredVersion '${range}'`,
    );
  }
  if (isCaret) {
    return actual.major === required.major && compareSemver(actual, required) >= 0;
  }
  return compareSemver(actual, required) === 0;
};

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
export const ensureGlobalModulesPlugin = (): Plugin => ({
  name: 'mfa-ensure-global-modules',
  configResolved(resolved: ResolvedConfig) {
    for (const [dep, policy] of Object.entries(buildFederationShared())) {
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
