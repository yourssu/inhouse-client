import { federation } from '@module-federation/vite';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { remoteConfigPlugin } from './mfaVitePlugin/remoteConfigPlugin';
import { remoteAssetsPlugin } from './remoteAssetsPlugin';
import { remoteContractPlugin } from './remoteContractPlugin';
import { sharedCssPlugin } from './sharedCssPlugin';

beforeEach(() => vi.stubEnv('MFE_VITE_NO_TEST_ENV_CHECK', 'true'));
afterEach(() => vi.unstubAllEnvs());

const fixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'inhouse-remote-build-'));

  await mkdir(path.join(root, 'inhouse-mfa'));
  await mkdir(path.join(root, 'src/styles'), { recursive: true });
  await mkdir(path.join(root, 'public'));
  await writeFile(path.join(root, 'public/logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(root, 'src/main.tsx'), "throw new Error('REMOTE_MAIN_MUST_NOT_RUN');");
  await writeFile(path.join(root, 'src/styles/index.css'), '.service { display: block; }');
  await writeFile(path.join(root, 'inhouse-mfa/route.ts'), 'export const routeTree = {};');

  return root;
};

const plugins = () => [
  remoteConfigPlugin({ workspace: 'fixture', port: 0 }, []),
  remoteAssetsPlugin(),
  remoteContractPlugin(),
  sharedCssPlugin([]),
  federation({
    name: 'fixture',
    filename: 'remoteEntry.js',
    exposes: { [PLUGIN_EXPOSE_KEY]: './inhouse-mfa/route.ts' },
    shared: {},
    dts: false,
  }),
];

test.each(['./', '/remote/'])(
  'builds a federation remote without HTML or app bootstrap (base %s)',
  async (base) => {
    const root = await fixture();

    try {
      const result = await build({
        root,
        base,
        configFile: false,
        logLevel: 'silent',
        plugins: plugins(),
      });
      const outputs = [result]
        .flat()
        .flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      const code = outputs
        .filter((output) => output.type === 'chunk')
        .map((chunk) => chunk.code)
        .join('\n');

      expect(outputs.map((output) => output.fileName)).toContain('remoteEntry.js');
      expect(outputs.some((output) => output.fileName.endsWith('.css'))).toBe(true);
      expect(outputs.some((output) => output.fileName.endsWith('.html'))).toBe(false);
      expect(code).not.toContain('REMOTE_MAIN_MUST_NOT_RUN');
      expect(code).not.toContain('mfa-standalone');
      expect(await readFile(path.join(root, 'dist/logo.svg'), 'utf8')).toContain('<svg');
      await expect(access(path.join(root, 'dist/index.html'))).rejects.toThrow();
      await expect(access(path.join(root, 'index.html'))).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test('serves remote modules and assets without synthesizing an app page', async () => {
  const root = await fixture();
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: plugins(),
    server: { port: 0, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    await server.listen();
    const url = server.resolvedUrls!.local[0];

    for (const route of ['', 'index.html', 'nested/route']) {
      const response = await fetch(new URL(route, url), { headers: { Accept: 'text/html' } });
      expect(response.status).toBe(404);
    }

    const entry = await fetch(new URL('remoteEntry.js', url));
    expect(entry.status, await entry.clone().text()).toBe(200);
    expect(await entry.text()).not.toContain('REMOTE_MAIN_MUST_NOT_RUN');

    const contract = await server.transformRequest('/inhouse-mfa/route.ts');
    expect(contract?.code).toContain('routeTree');
    expect(contract?.code).toContain('src/styles/index.css');
    expect(contract?.code).not.toContain('src/main.tsx');

    const asset = await fetch(new URL('logo.svg', url));
    expect(await asset.text()).toContain('<svg');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
import { PLUGIN_EXPOSE_KEY } from '@inhouse-mfa/core';
