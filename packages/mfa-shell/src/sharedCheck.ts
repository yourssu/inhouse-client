import { SHARED_DEPS } from '@yourssu-inhouse/mfa-core';

/*
  런타임에 shared dependency 버전이 정책(SHARED_DEPS.requiredVersion) 과 일치하는지 검사해요.
  mfa-core 가 build-time(node context, react types 없음) 에도 import 되므로, react 동적 import 가
  필요한 이 런타임 검사는 mfa-shell(app context, react types 있음) 이 수행해요.

  MF 자체도 singleton 위반을 잡지만, 정책에 명시된 requiredVersion 의 major 가 실제 로드된
  react/react-dom 과 다르면 plugin 경계에서 두 버전이 공존할 위험이 있어 명시적으로 throw 해요
  (POS global module 버전 검사와 같은 맥락). shell bootstrap 이 호출해요.
*/
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
