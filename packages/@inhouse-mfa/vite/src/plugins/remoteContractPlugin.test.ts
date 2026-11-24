import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { expect, test } from 'vitest';

import { REMOTE_CONTRACT_ID } from '../core/config';
import { remoteContractPlugin } from './remoteContractPlugin';

test.each(['absent', 'empty', 'bootstrap-only', 'component', 'both'])(
  'loads %s global declarations without activating the service',
  async (kind) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-contract-'));
    const key = `mfa-contract:${root}`;
    try {
      await mkdir(path.join(root, 'src/styles'), { recursive: true });
      await writeFile(
        path.join(root, 'src/main.tsx'),
        "throw new Error('Standalone main must never run');",
      );
      await writeFile(path.join(root, 'src/styles/index.css'), '.contract { display: block; }');
      await writeFile(
        path.join(root, 'src/routes.ts'),
        `export const routeTree = ${JSON.stringify(root)};`,
      );
      await writeFile(
        path.join(root, 'src/global.ts'),
        `
const state = globalThis[${JSON.stringify(key)}] = { imports: 1, starts: 0, stops: 0, renders: 0 };
export const bootstrap = () => {
  state.starts += 1;
  return () => { state.stops += 1; };
};
export const Global = ({ children }) => { state.renders += 1; return children; };
`,
      );
      const fields = [
        ...(kind === 'bootstrap-only' || kind === 'both' ? ['bootstrap'] : []),
        ...(kind === 'component' || kind === 'both' ? ['Global'] : []),
      ];
      await writeFile(
        path.join(root, 'remotePlugin.ts'),
        `
import { routeTree } from './src/routes';
${fields.length ? `import { ${fields.join(', ')} } from './src/global';` : ''}
export default { routeTree, ${kind === 'absent' ? '' : `global: { ${fields.join(', ')} }`} };
`,
      );
      await writeFile(path.join(root, 'entry.ts'), `export * from '${REMOTE_CONTRACT_ID}';`);
      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [remoteContractPlugin()],
        build: {
          minify: false,
          lib: {
            entry: path.join(root, 'entry.ts'),
            formats: ['es'],
            cssFileName: 'contract',
            fileName: () => 'contract.mjs',
          },
        },
      });
      const chunks = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      expect(chunks.some((output) => output.fileName.endsWith('.css'))).toBe(true);
      const mod = await import(pathToFileURL(path.join(root, 'dist/contract.mjs')).href);
      expect(mod.routeTree).toBe(root);
      const state = fields.length ? { imports: 1, starts: 0, stops: 0, renders: 0 } : undefined;
      expect(Reflect.get(globalThis, key)).toEqual(state);
      if (kind === 'absent') {
        expect(mod.global).toBeUndefined();
      } else {
        const global = await mod.global();
        expect(await mod.global()).toBe(global);
        expect(Reflect.get(globalThis, key)).toEqual(state);
        expect(typeof global.Global).toBe(fields.includes('Global') ? 'function' : 'undefined');
        const cleanup = global.bootstrap?.();
        cleanup?.();
        if (state) {
          const calls = fields.includes('bootstrap') ? 1 : 0;
          expect(Reflect.get(globalThis, key)).toEqual({ ...state, starts: calls, stops: calls });
        }
      }
    } finally {
      Reflect.deleteProperty(globalThis, key);
      await rm(root, { recursive: true, force: true });
    }
  },
);

test.each(['./remotePlugin.ts', './integration/customPlugin.ts'])(
  'resolves %s against the Vite root and includes remote CSS',
  async (pluginEntry) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-custom-entry-'));
    try {
      await mkdir(path.dirname(path.join(root, pluginEntry)), { recursive: true });
      await mkdir(path.join(root, 'src/styles'), { recursive: true });
      await writeFile(path.join(root, 'src/styles/index.css'), '.custom { color: red; }');
      await writeFile(
        path.join(root, pluginEntry),
        'export default { routeTree: { custom: true } };',
      );
      await writeFile(path.join(root, 'entry.ts'), `export * from '${REMOTE_CONTRACT_ID}';`);
      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [remoteContractPlugin('custom', pluginEntry)],
        build: {
          lib: {
            entry: path.join(root, 'entry.ts'),
            formats: ['es'],
            cssFileName: 'contract',
            fileName: () => 'contract.mjs',
          },
        },
      });
      const chunks = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      expect(chunks.some((output) => output.fileName.endsWith('.css'))).toBe(true);
      const mod = await import(pathToFileURL(path.join(root, 'dist/contract.mjs')).href);
      expect(mod.routeTree).toEqual({ custom: true });
      expect(mod.global).toBeUndefined();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test.each([
  ['missing entry', undefined, 'plugin entry not found'],
  ['missing default export', 'export const routeTree = {};', 'default'],
  ['missing routeTree', 'export default {};', 'must default-export a remote plugin with routeTree'],
])('diagnoses %s', async (_kind, source, message) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-invalid-entry-'));
  try {
    if (source) {
      await writeFile(path.join(root, 'remotePlugin.ts'), source);
    }
    const run = async () => {
      await writeFile(path.join(root, 'entry.ts'), `export * from '${REMOTE_CONTRACT_ID}';`);
      await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [remoteContractPlugin('invalid')],
        build: {
          lib: {
            entry: path.join(root, 'entry.ts'),
            formats: ['es'],
            cssFileName: 'contract',
            fileName: () => 'contract.mjs',
          },
        },
      });
      await import(pathToFileURL(path.join(root, 'dist/contract.mjs')).href);
    };
    await expect(run()).rejects.toThrow(message);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
