import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createServer } from 'vite';
import { expect, test } from 'vitest';

import { remoteContractPlugin } from './remoteContractPlugin';

test('creates a lazy dev global boundary that accepts contract changes and reports the remote identity', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-global-hmr-'));
  await mkdir(path.join(root, 'inhouse-mfa'), { recursive: true });
  await mkdir(path.join(root, 'src'));
  const contract = path.join(root, 'inhouse-mfa/global.ts');
  await writeFile(path.join(root, 'src/global.ts'), 'export const bootstrap = () => () => {};');
  await writeFile(contract, "export { bootstrap } from '../src/global';");
  await writeFile(path.join(root, 'inhouse-mfa/route.ts'), 'export const routeTree = {};');
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [remoteContractPlugin('fixture-service')],
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, fs: { strict: false } },
  });
  try {
    const route = await server.transformRequest('/inhouse-mfa/route.ts');
    expect(route?.code).toContain('module.getGlobal()');
    const wrapper = await server.transformRequest('virtual:inhouse-mfa-global');
    expect(wrapper?.code).toContain('fixture-service');
    expect(wrapper?.code).toContain('REMOTE_GLOBAL_UPDATE_EVENT');
    expect(wrapper?.code).not.toContain('bootstrap()');
    const module = server.moduleGraph.getModuleById('\0virtual:inhouse-mfa-global');
    expect([...module!.acceptedHmrDeps].map((dependency) => dependency.file)).toEqual([
      await realpath(contract),
    ]);
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
