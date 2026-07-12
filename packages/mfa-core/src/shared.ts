interface SharedDepPolicy {
  requiredVersion?: string;
  singleton: true;
}

type FederationSharedConfig = Record<string, SharedDepPolicy>;

export const SHARED_DEPS = {
  react: { requiredVersion: '^19.2.6', singleton: true },
  'react-dom': { requiredVersion: '^19.2.6', singleton: true },
  '@tanstack/react-router': { requiredVersion: '^1.170.11', singleton: true },
  '@tanstack/react-query': { requiredVersion: '^5.101.0', singleton: true },
  '@yourssu-inhouse/interior': { singleton: true },
  '@yourssu-inhouse/exterior': { singleton: true },
  '@yourssu-inhouse/exterior/layout': { singleton: true },
  'react-simplikit': { singleton: true },
  'overlay-kit': { singleton: true },
  motion: { singleton: true },
  zod: { singleton: true },
  'es-toolkit': { singleton: true },
} as const satisfies Record<string, SharedDepPolicy>;

export const buildFederationShared = (): FederationSharedConfig => ({ ...SHARED_DEPS });

export const SINGLETON_CONTEXT_PACKAGES = [
  'react-simplikit',
  'overlay-kit',
  'motion',
  '@yourssu-inhouse/interior',
  '@yourssu-inhouse/exterior',
  '@yourssu-inhouse/exterior/layout',
] as const;
