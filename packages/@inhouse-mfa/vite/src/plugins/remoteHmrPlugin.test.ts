import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { createServer } from 'vite';
import { expect, test, vi } from 'vitest';

import { appPlugins } from './mfaVitePlugin/appPlugins';
import { remoteHmrPlugin } from './remoteHmrPlugin';

test('reloads after route generation adds or removes a service route', async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-route-structure-')));
  await mkdir(path.join(root, 'src/routes'), { recursive: true });
  await writeFile(
    path.join(root, 'src/routes/~__root.tsx'),
    "import { createRootRoute } from '@tanstack/react-router'; export const Route = createRootRoute();",
  );
  const service = path.join(root, 'src/routes/~service.tsx');
  const child = path.join(root, 'src/routes/~service.~child.tsx');
  await writeFile(
    service,
    "import { createFileRoute } from '@tanstack/react-router'; export const Route = createFileRoute('/service')({component: () => null});",
  );
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [appPlugins(), remoteHmrPlugin()],
    resolve: {
      alias: {
        '@tanstack/react-router': createRequire(import.meta.url).resolve('@tanstack/react-router'),
      },
    },
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const send = vi.spyOn(server.ws, 'send');
  const reloads = () => {
    const messages: readonly (readonly unknown[])[] = send.mock.calls;

    return messages.filter(
      ([payload]) =>
        typeof payload === 'object' &&
        payload !== null &&
        'type' in payload &&
        payload.type === 'full-reload',
    );
  };

  try {
    await writeFile(
      child,
      "import { createFileRoute } from '@tanstack/react-router'; export const Route = createFileRoute('/service/child')({component: () => null});",
    );
    await vi.waitFor(() => expect(reloads()).toHaveLength(1));
    await vi.waitFor(async () =>
      expect(await readFile(path.join(root, 'src/routeTree.gen.ts'), 'utf8')).toContain('/child'),
    );
    await server.transformRequest('/src/routes/~service.~child.tsx');
    await rm(child);
    await vi.waitFor(async () =>
      expect(await readFile(path.join(root, 'src/routeTree.gen.ts'), 'utf8')).not.toContain(
        '/child',
      ),
    );
    await vi.waitFor(() => expect(reloads()).toHaveLength(2), { timeout: 3000 });
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('replaces only remote root and auth HMR while retaining service route HMR', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-remote-route-hmr-'));
  const require = createRequire(import.meta.url);
  await mkdir(path.join(root, 'src/routes'), { recursive: true });
  await writeFile(
    path.join(root, 'src/routes/~__root.tsx'),
    "import { createRootRoute, Outlet } from '@tanstack/react-router'; export const Route = createRootRoute({component: () => <Outlet />, head: () => ({meta:[{title:'remote'}]})});",
  );
  await writeFile(
    path.join(root, 'src/routes/~_auth.tsx'),
    "import { createFileRoute, Outlet } from '@tanstack/react-router'; export const Route = createFileRoute('/_auth')({component: () => <Outlet />});",
  );
  await writeFile(
    path.join(root, 'src/routes/~_auth.~service.tsx'),
    "import { createFileRoute } from '@tanstack/react-router'; export const Route = createFileRoute('/_auth/service')({component: () => <div>service</div>});",
  );

  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [appPlugins(), remoteHmrPlugin()],
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: {
      alias: [
        {
          find: /^@tanstack\/react-router$/,
          replacement: require.resolve('@tanstack/react-router'),
        },
        { find: /^react\/jsx-dev-runtime$/, replacement: require.resolve('react/jsx-dev-runtime') },
        {
          find: /^react\/compiler-runtime$/,
          replacement: require.resolve('react/compiler-runtime'),
        },
        { find: /^react$/, replacement: require.resolve('react') },
      ],
    },
    server: { middlewareMode: true, watch: null },
  });

  try {
    const rootModule = await server.transformRequest('/src/routes/~__root.tsx');
    const authModule = await server.transformRequest('/src/routes/~_auth.tsx');
    const serviceModule = await server.transformRequest('/src/routes/~_auth.~service.tsx');
    expect(rootModule?.code).toContain('import.meta.hot.accept()');
    expect(rootModule?.code).not.toContain('window.__TSR_ROUTER__');
    expect(authModule?.code).not.toContain('window.__TSR_ROUTER__');
    expect(authModule?.code).toContain('import.meta.hot.accept()');
    expect(serviceModule?.code).toContain('window.__TSR_ROUTER__');
    expect(serviceModule?.code).not.toContain('__mfaUpdateRoot');
    expect(rootModule?.map).toBeDefined();
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
