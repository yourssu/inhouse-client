import type { ModuleFederationOptions } from '@module-federation/vite';

import { beforeEach, expect, expectTypeOf, test, vi } from 'vitest';

import type { MfaConfig } from '../../core/config';

import { buildFederationShared } from '../../core/shared';
import { ensureGlobalModulesPlugin } from './ensureGlobalModulesPlugin';
import { mfaVitePlugin } from './index';

const { federation } = vi.hoisted(() => ({
  federation: vi.fn<(options: ModuleFederationOptions) => []>(() => []),
}));

vi.mock('@module-federation/vite', () => ({ federation }));
vi.mock('./appPlugins', () => ({ appPlugins: () => [] }));
vi.mock('./ensureGlobalModulesPlugin', () => ({
  ensureGlobalModulesPlugin: vi.fn(() => ({ name: 'mfa-ensure-global-modules' })),
}));

const config = {
  remotes: [{ workspace: '@yourssu-inhouse/member', port: 5175 }],
  sharedDependencies: { react: { version: 'catalog', singleton: true } },
} satisfies MfaConfig;

beforeEach(() => vi.clearAllMocks());

test('keeps federation policy and installed-version validation on the same shared config', () => {
  mfaVitePlugin.shell({ config });

  const options = vi.mocked(federation).mock.calls[0]?.[0];
  expect(options).toMatchObject({
    name: 'shell',
    shareStrategy: 'version-first',
    remotes: {
      '@yourssu-inhouse/member': {
        name: '@yourssu-inhouse/member',
        type: 'module',
        entry: 'http://localhost:5175/remoteEntry.js',
      },
    },
    runtimePlugins: ['@inhouse-mfa/vite/retry-plugin'],
    shared: buildFederationShared(config.sharedDependencies),
  });
  expect(vi.mocked(ensureGlobalModulesPlugin).mock.calls[0]?.[0]).toBe(options?.shared);
});

test('allows remote URL configuration through the shell environment', () => {
  mfaVitePlugin.shell({
    config,
    env: { VITE_MEMBER_URL: 'https://member.example/remoteEntry.js' },
  });

  expect(vi.mocked(federation).mock.calls[0]?.[0].remotes).toMatchObject({
    '@yourssu-inhouse/member': { entry: 'https://member.example/remoteEntry.js' },
  });
});

test.each([
  { shared: { react: { singleton: false, requiredVersion: '^18' } } },
  { shareStrategy: 'loaded-first' },
  { remotes: {} },
  { name: 'another-shell' },
  { runtimePlugins: [] },
  {},
  undefined,
])('rejects federationOptions supplied through a variable: %j', (federationOptions) => {
  const options = { config, federationOptions };

  expect(() => mfaVitePlugin.shell(options)).toThrow('federationOptions is not supported');
  expect(federation).not.toHaveBeenCalled();
  expect(ensureGlobalModulesPlugin).not.toHaveBeenCalled();
});

test('does not expose federation options in either app API', () => {
  expectTypeOf<Parameters<typeof mfaVitePlugin.shell>[0]>().not.toHaveProperty('federationOptions');
  expectTypeOf<Parameters<typeof mfaVitePlugin.remote>>().toEqualTypeOf<[]>();
});
