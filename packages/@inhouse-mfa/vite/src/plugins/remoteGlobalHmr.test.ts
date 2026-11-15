import type { RemotePluginDefinition } from '@inhouse-mfa/core';

import { createRootRoute } from '@tanstack/react-router';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createServer } from 'vite';
import { expect, test, vi } from 'vitest';

import { REMOTE_CONTRACT_ID } from '../core/config';
import { remoteContractPlugin } from './remoteContractPlugin';

test('accepts plugin dependency updates and publishes the latest global without running bootstrap', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-global-hmr-'));
  await mkdir(path.join(root, 'src'));
  const entry = path.join(root, 'remotePlugin.ts');
  const implementation = path.join(root, 'src/global.ts');
  await writeFile(implementation, 'export const bootstrap = () => () => {};');
  await writeFile(
    entry,
    "import { bootstrap } from './src/global';\nimport { routeTree } from './src/routes';\nexport default { routeTree, global: { bootstrap } };",
  );
  await writeFile(path.join(root, 'src/routes.ts'), 'export const routeTree = {};');
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [remoteContractPlugin('fixture-service')],
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, fs: { strict: false } },
  });
  try {
    await server.transformRequest(REMOTE_CONTRACT_ID);
    await server.transformRequest('/remotePlugin.ts');
    await server.transformRequest('/src/global.ts');
    const boundary = server.moduleGraph.getModuleById(`\0${REMOTE_CONTRACT_ID}`)!;
    expect([...boundary.acceptedHmrDeps].map((dependency) => dependency.file)).toEqual([
      await realpath(entry),
    ]);
    const implementationModule = server.moduleGraph.getModuleById(await realpath(implementation))!;
    expect([...implementationModule.importers].map((module) => module.file)).toContain(
      await realpath(entry),
    );

    const source = await server.pluginContainer.load(`\0${REMOTE_CONTRACT_ID}`);
    const code = typeof source === 'string' ? source : source!.code;
    const bootstrap = vi.fn();
    const initialPlugin = { routeTree: createRootRoute(), global: { bootstrap } };
    const dispatchEvent = vi.fn();
    const hot = { data: {}, accept: vi.fn(), invalidate: vi.fn() };
    // Execute the generated module with a browser HMR context; dependencies were resolved above.
    const contract = vm.runInNewContext(
      `(() => {
${code
  .replace(/^import .*;$/gm, '')
  .replaceAll('import.meta', 'meta')
  .replaceAll('export const', 'const')}
return { routeTree, global };
})()`,
      {
        initialPlugin,
        meta: { hot },
        window: { dispatchEvent },
        CustomEvent,
        REMOTE_GLOBAL_UPDATE_EVENT: 'inhouse-mfa:remote-global-update',
      },
    );
    const accept: (module: { default: RemotePluginDefinition }) => void =
      hot.accept.mock.calls[0][1];
    expect(await contract.global()).toBe(initialPlugin.global);
    expect(bootstrap).not.toHaveBeenCalled();

    const next = { ...initialPlugin, global: { bootstrap: vi.fn() } };
    accept({ default: next });
    expect(await contract.global()).toBe(next.global);
    expect(dispatchEvent.mock.calls[0][0].detail).toEqual({
      name: 'fixture-service',
      global: next.global,
    });
    expect(next.global.bootstrap).not.toHaveBeenCalled();
    expect(hot.invalidate).not.toHaveBeenCalled();

    accept({ default: { ...next, global: { ...next.global, Global: () => null } } });
    expect(hot.invalidate).not.toHaveBeenCalled();
    accept({ default: { routeTree: next.routeTree } });
    expect(hot.invalidate).toHaveBeenCalledOnce();
    accept({ default: { ...next, routeTree: createRootRoute() } });
    expect(hot.invalidate).toHaveBeenCalledTimes(2);
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
