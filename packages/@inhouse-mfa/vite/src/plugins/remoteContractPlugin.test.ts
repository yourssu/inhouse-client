import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { expect, test } from 'vitest';

import { remoteContractPlugin } from './remoteContractPlugin';

test.each(['absent', 'init-only', 'component'])(
  'loads the route contract and optional %s global module without an app manifest',
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
globalThis[${JSON.stringify(key)}] = (globalThis[${JSON.stringify(key)}] ?? 0) + 1;
${kind === 'component' ? 'export const Global = () => null;' : ''}
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
          write: false,
          minify: false,
          lib: {
            entry: path.join(root, 'entry.ts'),
            formats: ['es'],
            fileName: 'contract',
            cssFileName: 'contract',
          },
        },
      });
      const chunks = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      const chunk = chunks.find((output) => output.type === 'chunk');
      expect(chunk?.type).toBe('chunk');
      const url = `data:text/javascript;base64,${Buffer.from(chunk!.code).toString('base64')}`;
      const mod = await import(url);
      expect(mod.routeTree).toBe(root);
      expect(
        chunks.some((output) => output.type === 'asset' && output.fileName.endsWith('.css')),
      ).toBe(Boolean(stylesheet));
      if (kind === 'absent') {
        expect(mod.global).toBeUndefined();
      } else {
        expect(Reflect.get(globalThis, key)).toBe(1);
        await import(url);
        expect(Reflect.get(globalThis, key)).toBe(1);
        expect(typeof mod.global.Global).toBe(kind === 'component' ? 'function' : 'undefined');
      }
    } finally {
      Reflect.deleteProperty(globalThis, key);
      await rm(root, { recursive: true, force: true });
    }
  },
);
