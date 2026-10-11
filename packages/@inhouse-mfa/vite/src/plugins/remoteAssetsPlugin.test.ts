import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { expect, test } from 'vitest';

import { remoteAssetsPlugin } from './remoteAssetsPlugin';

const fixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'inhouse-remote-assets-'));
  await mkdir(path.join(root, 'src'), { recursive: true });
  await mkdir(path.join(root, 'public'));
  await writeFile(path.join(root, 'public/logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(root, 'src/logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(root, 'src/font.woff2'), 'fixture-font');
  return root;
};

test.each(['./', '/remote/', 'https://cdn.example.com/remotes/member/'])(
  'resolves public, imported and CSS assets from the remote chunk with base %s',
  async (base) => {
    const root = await fixture();
    try {
      await writeFile(
        path.join(root, 'src/index.ts'),
        `
import './styles.css';
import image from './logo.svg';
export { publicAsset } from '@inhouse-mfa/vite/assets';
export { image };
`,
      );
      await writeFile(
        path.join(root, 'src/styles.css'),
        `
@font-face { font-family: fixture; src: url('./font.woff2'); }
.external { background: url('https://images.example.com/logo.png'); }
.data { background: url('data:image/svg+xml;base64,PHN2Zy8+'); }
`,
      );
      await build({
        root,
        base,
        configFile: false,
        logLevel: 'silent',
        plugins: [remoteAssetsPlugin()],
        build: {
          assetsInlineLimit: 0,
          minify: true,
          rollupOptions: {
            input: path.join(root, 'src/index.ts'),
            preserveEntrySignatures: 'strict',
            output: {
              entryFileNames: 'chunks/nested/main.js',
              assetFileNames: 'static/[name]-[hash][extname]',
            },
          },
        },
      });
      const chunkUrl = 'https://remote.example.com/deploy/member/chunks/nested/main.js';
      const code = (
        await readFile(path.join(root, 'dist/chunks/nested/main.js'), 'utf8')
      ).replaceAll('import.meta.url', JSON.stringify(chunkUrl));
      const mod = await import(
        `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
      );
      expect(mod.publicAsset('logo.svg')).toBe('https://remote.example.com/deploy/member/logo.svg');
      expect(mod.publicAsset('/logo.svg')).toBe(
        'https://remote.example.com/deploy/member/logo.svg',
      );
      expect(mod.publicAsset('https://images.example.com/logo.png')).toBe(
        'https://images.example.com/logo.png',
      );
      expect(mod.publicAsset('data:image/svg+xml;base64,PHN2Zy8+')).toBe(
        'data:image/svg+xml;base64,PHN2Zy8+',
      );
      expect(mod.image).toMatch(
        /^https:\/\/remote\.example\.com\/deploy\/member\/static\/logo-.*\.svg$/,
      );
      const { readdir } = await import('node:fs/promises');
      const files = await readdir(path.join(root, 'dist/static'));
      const css = await readFile(
        path.join(
          root,
          'dist/static',
          files.find((file) => file.endsWith('.css'))!,
        ),
        'utf8',
      );
      expect(css).toMatch(/url\([^)]*font-.*\.woff2\)/);
      expect(css).not.toContain('url(/');
      expect(css).toContain('https://images.example.com/logo.png');
      expect(css).toContain('data:image/svg+xml;base64,PHN2Zy8+');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test('serves publicAsset using the remote dev server and enforces public and CSS URL contracts', async () => {
  const root = await fixture();
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [remoteAssetsPlugin()],
    server: { middlewareMode: true, watch: null },
  });
  try {
    const result = await server.transformRequest('@inhouse-mfa/vite/assets');
    expect(result?.code).toBeDefined();
    const code = result!.code.replaceAll(
      'import.meta.url',
      JSON.stringify('http://localhost:5174/@id/assets'),
    );
    const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    expect(mod.publicAsset('logo.svg')).toBe('http://localhost:5174/logo.svg');
    await writeFile(
      path.join(root, 'src/bad.tsx'),
      'export const image = <img src="/logo.svg" />;',
    );
    await expect(server.transformRequest('/src/bad.tsx')).rejects.toThrow('Use publicAsset()');
    await writeFile(
      path.join(root, 'src/good.ts'),
      "import { publicAsset } from '@inhouse-mfa/vite/assets'; export const image = publicAsset('/logo.svg');",
    );
    await expect(server.transformRequest('/src/good.ts')).resolves.toBeDefined();
    await writeFile(
      path.join(root, 'src/alias.ts'),
      "import { publicAsset as asset } from '@inhouse-mfa/vite/assets'; export const image = asset('/logo.svg');",
    );
    await expect(server.transformRequest('/src/alias.ts')).resolves.toBeDefined();
    await writeFile(
      path.join(root, 'src/namespace.ts'),
      "import * as assets from '@inhouse-mfa/vite/assets'; export const image = assets.publicAsset('/logo.svg');",
    );
    await expect(server.transformRequest('/src/namespace.ts')).resolves.toBeDefined();
    await writeFile(
      path.join(root, 'src/shadow.ts'),
      "const publicAsset = (value: string) => value; export const image = publicAsset('/logo.svg');",
    );
    await expect(server.transformRequest('/src/shadow.ts')).rejects.toThrow('Use publicAsset()');
    await writeFile(path.join(root, 'src/bad.css'), '.image { background: url(/logo.svg); }');
    await expect(server.transformRequest('/src/bad.css')).rejects.toThrow('source-relative CSS');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
