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
