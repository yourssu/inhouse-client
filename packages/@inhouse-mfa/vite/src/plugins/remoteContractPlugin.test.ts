import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { expect, test } from 'vitest';

import { remoteContractPlugin } from './remoteContractPlugin';

test.each(['absent', 'init-only', 'bootstrap-only', 'component', 'both'])(
  'defers the optional %s global module until its loader is called',
  async (kind) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-contract-'));
    const key = `mfa-contract:${root}`;
    const stylesheet = kind === 'absent' ? undefined : './styles/index.css';
    try {
      await mkdir(path.join(root, 'src'), { recursive: true });
      await mkdir(path.join(root, 'inhouse-mfa'));
      await writeFile(
        path.join(root, 'src/main.tsx'),
        "throw new Error('Standalone main must never run through the route contract');",
      );
      if (stylesheet) {
        await mkdir(path.join(root, 'src/styles'));
        await writeFile(path.join(root, 'src', stylesheet), '.contract { display: block; }');
      }
      await writeFile(
        path.join(root, 'src/routes.ts'),
        `export const routeTree = ${JSON.stringify(root)};`,
      );
      await writeFile(
        path.join(root, 'inhouse-mfa/route.ts'),
        "export { routeTree } from '../src/routes';",
      );
      if (kind !== 'absent') {
        await writeFile(
          path.join(root, 'inhouse-mfa/global.tsx'),
          `
globalThis[${JSON.stringify(key)}] = { imports: 1, starts: 0, stops: 0 };
${kind === 'component' || kind === 'both' ? 'export const Global = () => null;' : ''}
${
  kind === 'bootstrap-only' || kind === 'both'
    ? `export const bootstrap = () => {
        globalThis[${JSON.stringify(key)}].starts += 1;
        return () => { globalThis[${JSON.stringify(key)}].stops += 1; };
      };`
    : ''
}
`,
        );
      }
      await writeFile(path.join(root, 'entry.ts'), "export * from './inhouse-mfa/route';");
      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [remoteContractPlugin()],
        build: {
          write: true,
          rolldownOptions: { output: { chunkFileNames: '[name]-[hash].mjs' } },
          minify: false,
          lib: {
            entry: path.join(root, 'entry.ts'),
            formats: ['es'],
            fileName: () => 'contract.mjs',
            cssFileName: 'contract',
          },
        },
      });
      const chunks = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      const chunk = chunks.find((output) => output.type === 'chunk' && output.isEntry);
      expect(chunk?.type).toBe('chunk');
      const url = pathToFileURL(path.join(root, 'dist', chunk!.fileName)).href;
      const mod = await import(url);
      expect(mod.routeTree).toBe(root);
      expect(
        chunks.some((output) => output.type === 'asset' && output.fileName.endsWith('.css')),
      ).toBe(Boolean(stylesheet));
      if (kind === 'absent') {
        expect(mod.global).toBeUndefined();
      } else {
        expect(Reflect.get(globalThis, key)).toBeUndefined();
        expect(typeof mod.global).toBe('function');

        const global = await mod.global();
        expect(await mod.global()).toBe(global);
        expect(Reflect.get(globalThis, key)).toEqual({ imports: 1, starts: 0, stops: 0 });
        expect(typeof global.Global).toBe(
          kind === 'component' || kind === 'both' ? 'function' : 'undefined',
        );

        const cleanup = global.bootstrap?.();
        cleanup?.();
        const expectedCalls = kind === 'bootstrap-only' || kind === 'both' ? 1 : 0;
        expect(Reflect.get(globalThis, key)).toEqual({
          imports: 1,
          starts: expectedCalls,
          stops: expectedCalls,
        });
      }
    } finally {
      Reflect.deleteProperty(globalThis, key);
      await rm(root, { recursive: true, force: true });
    }
  },
);
