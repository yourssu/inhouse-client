import { SHARED_DEPS } from '@yourssu-inhouse/mfa-core';

const parseMajor = (range: string): number | undefined => {
  const match = range.match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

export const assertSharedVersions = async (): Promise<void> => {
  const checks: Array<Promise<void>> = [];

  const reactPolicy = SHARED_DEPS.react;
  if (reactPolicy.requiredVersion) {
    const expectedMajor = parseMajor(reactPolicy.requiredVersion);
    checks.push(
      import('react').then((mod) => {
        const actual = (mod as any).version as string | undefined;
        if (expectedMajor !== undefined && actual && !actual.startsWith(`${expectedMajor}.`)) {
          throw new Error(
            `[mfa-shell] react version mismatch: policy '${reactPolicy.requiredVersion}' but loaded '${actual}'`,
          );
        }
      }),
    );
  }

  const domPolicy = SHARED_DEPS['react-dom'];
  if (domPolicy.requiredVersion) {
    const expectedMajor = parseMajor(domPolicy.requiredVersion);
    checks.push(
      import('react-dom').then((mod) => {
        const actual = (mod as any).version as string | undefined;
        if (expectedMajor !== undefined && actual && !actual.startsWith(`${expectedMajor}.`)) {
          throw new Error(
            `[mfa-shell] react-dom version mismatch: policy '${domPolicy.requiredVersion}' but loaded '${actual}'`,
          );
        }
      }),
    );
  }

  await Promise.all(checks);
};
