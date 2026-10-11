import tailwindcss from '@tailwindcss/vite';
import { mkdir, mkdtemp, readFile, realpath, rm, utimes, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { expect, test } from 'vitest';

import { sharedCssPlugin } from './index';
import { partitionCss } from './partitionCss';

test('invalidates the real Tailwind compiler when a nested local import changes', async () => {
  const root = await fixture();
  const require = createRequire(import.meta.url);
  await writeFile(path.join(root, 'styles/nested/child.css'), '.nested { width: 133px; }');
  const child = await realpath(path.join(root, 'styles/nested/child.css'));
  await writeFile(
    path.join(root, 'styles/nested/screen.css'),
    "@import './child.css'; .service { color: red; }",
  );
  await writeFile(
    path.join(root, 'styles/index.css'),
    `@import '${require.resolve('tailwindcss/index.css')}';
@import '../shared.css';
@import './nested/screen.css';`,
  );
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [sharedCssPlugin(['../shared.css']), tailwindcss()],
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const before = await server.transformRequest('/styles/index.css?mfa-screen');
    expect(before?.code).toContain('width: 133px');
    expect(before?.code).not.toContain('shared-reset');
    expect(server.moduleGraph.getModulesByFile(child)?.size).toBeGreaterThan(0);

    await writeFile(child, '.nested { width: 173px; }');
    // Tailwind uses filesystem mtimes; make the change deterministic on coarse clocks.
    await utimes(child, new Date(), new Date(Date.now() + 1000));
    server.moduleGraph.onFileChange(child);

    const after = await server.transformRequest('/styles/index.css?mfa-screen');
    expect(after?.code).toContain('width: 173px');
    expect(after?.code).not.toContain('width: 133px');
    expect(after?.code).not.toContain('shared-reset');
    expect(after?.code).not.toContain('@reference');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

const fixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mfa-screen-css-'));

  await mkdir(path.join(root, 'styles/nested'), { recursive: true });
  await writeFile(path.join(root, 'shared.css'), '.shared-reset { display: none; }');
  await writeFile(path.join(root, 'styles/nested/font.woff2'), 'fixture-font');
  await writeFile(
    path.join(root, 'styles/nested/screen.css'),
    `@font-face { font-family: fixture; src: url('./font.woff2'); }
.service { background: url('https://images.example.com/logo.png'); }
.data { background: url('data:image/svg+xml;base64,PHN2Zy8+'); }`,
  );
  await writeFile(
    path.join(root, 'styles/index.css'),
    `@layer reset, components, utilities;
@import '../shared.css' layer(reset);
@import './nested/screen.css';`,
  );
  await writeFile(path.join(root, 'styles/editor.module.css'), '.editor { color: red; }');
  await writeFile(
    path.join(root, 'entry.ts'),
    "import './styles/index.css'; export { default as classes } from './styles/editor.module.css';",
  );

  return root;
};

test('builds only service CSS and preserves CSS Modules and imported asset URLs', async () => {
  const root = await fixture();

  try {
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [sharedCssPlugin(['../shared.css'])],
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        assetsInlineLimit: 0,
        rolldownOptions: {
          input: path.join(root, 'entry.ts'),
          preserveEntrySignatures: 'strict',
        },
      },
    });
    const outputs = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
    const css = outputs
      .filter((output) => output.type === 'asset')
      .filter((asset) => asset.fileName.endsWith('.css'))
      .map((asset) => asset.source)
      .join('\n');
    const entry = outputs
      .filter((output) => output.type === 'chunk')
      .find((chunk) => chunk.isEntry);

    expect(css).not.toContain('shared-reset');
    expect(css).toContain('@layer reset, components, utilities;');
    expect(css).toContain('.service');
    expect(css).toMatch(/font-[^)]*\.woff2/);
    expect(css).toContain('https://images.example.com/logo.png');
    expect(css).toContain('data:image/svg+xml;base64,PHN2Zy8+');
    expect(outputs.some((output) => output.fileName.endsWith('.woff2'))).toBe(true);
    expect(entry?.type).toBe('chunk');

    const mod = await import(
      `data:text/javascript;base64,${Buffer.from(entry!.code).toString('base64')}`
    );
    expect(mod.classes.editor).toBeTypeOf('string');
    expect(css).toContain(`.${mod.classes.editor}`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('watches local CSS dependencies and reloads their service styles', async () => {
  const root = await fixture();
  const watched: string[] = [];
  const screen = await realpath(path.join(root, 'styles/nested/screen.css'));
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [sharedCssPlugin(['../shared.css'])],
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const css = await partitionCss(path.join(root, 'styles/index.css'), ['../shared.css'], (file) =>
      watched.push(file),
    );
    expect(watched).toContain(screen);
    expect(css).toContain("url('./nested/font.woff2')");

    const before = await server.transformRequest('/styles/index.css?mfa-screen');
    expect(before?.code).toContain('.service');
    expect(before?.code).not.toContain('shared-reset');
    expect(server.moduleGraph.getModulesByFile(screen)?.size).toBeGreaterThan(0);

    await writeFile(screen, '.updated-service { display: flex; }');
    server.moduleGraph.onFileChange(screen);

    const after = await server.transformRequest('/styles/index.css?mfa-screen');
    expect(after?.code).toContain('.updated-service');
    expect(after?.code).not.toContain('.service {');
    expect(await readFile(path.join(root, 'shared.css'), 'utf8')).toContain('shared-reset');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects qualified local imports instead of silently changing their semantics', async () => {
  const root = await fixture();

  try {
    await writeFile(
      path.join(root, 'styles/index.css'),
      "@import './nested/screen.css' layer(components);",
    );

    await expect(partitionCss(path.join(root, 'styles/index.css'), [], () => {})).rejects.toThrow(
      'qualified local CSS imports cannot be partitioned safely',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['raw', 'url'])('rejects CSS exclusion bypass through ?%s', async (query) => {
  const root = await fixture();

  try {
    await writeFile(path.join(root, 'entry.ts'), `import './styles/index.css?${query}';`);

    await expect(
      build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [sharedCssPlugin(['../shared.css'])],
        build: { write: false, rolldownOptions: { input: path.join(root, 'entry.ts') } },
      }),
    ).rejects.toThrow('Import remote styles as CSS modules or with ?inline');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['', '?inline'])(
  'excludes a shared package imported from JS with query %s',
  async (query) => {
    const root = await fixture();
    const sharedPackage = path.join(root, 'node_modules/fixture-shared');

    try {
      await mkdir(sharedPackage, { recursive: true });
      await writeFile(path.join(sharedPackage, 'package.json'), '{"name":"fixture-shared"}');
      await writeFile(path.join(sharedPackage, 'reset.css'), '.shared-reset { display: none; }');
      await writeFile(
        path.join(root, 'entry.ts'),
        query
          ? `export { default as css } from 'fixture-shared/reset.css${query}';`
          : "import 'fixture-shared/reset.css'; export const page = true;",
      );
      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [sharedCssPlugin(['fixture-shared/reset.css'])],
        build: {
          write: false,
          minify: false,
          rolldownOptions: {
            input: path.join(root, 'entry.ts'),
            preserveEntrySignatures: 'strict',
          },
        },
      });
      const outputs = [result]
        .flat()
        .flatMap((bundle) => ('output' in bundle ? bundle.output : []));
      const code = outputs
        .map((output) => (output.type === 'chunk' ? output.code : output.source))
        .join('\n');
      expect(code).not.toContain('shared-reset');

      if (query) {
        const entry = outputs.find((output) => output.type === 'chunk' && output.isEntry);
        expect(entry?.type).toBe('chunk');
        if (entry?.type === 'chunk') {
          const mod = await import(
            `data:text/javascript;base64,${Buffer.from(entry.code).toString('base64')}`
          );
          expect(mod.css).toBe('');
        }
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test('partitions ?inline styles without injecting them and still updates local dependencies', async () => {
  const root = await fixture();
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [sharedCssPlugin(['../shared.css'])],
    server: { middlewareMode: true, watch: null },
  });

  try {
    const resolved = await server.pluginContainer.resolveId(
      './styles/index.css?inline',
      path.join(root, 'entry.ts'),
    );
    expect(resolved?.id).toContain('?inline&mfa-screen');
    const url = '/styles/index.css?inline&mfa-screen';
    const before = await server.transformRequest(url);
    expect(before?.code).not.toContain('shared-reset');
    expect(before?.code).toContain('.service');
    expect(before?.code).not.toContain('__vite__updateStyle');

    const screen = await realpath(path.join(root, 'styles/nested/screen.css'));
    await writeFile(screen, '.updated-inline { color: blue; }');
    server.moduleGraph.onFileChange(screen);
    const after = await server.transformRequest(url);
    expect(after?.code).toContain('.updated-inline');
    expect(after?.code).not.toContain('.service');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
