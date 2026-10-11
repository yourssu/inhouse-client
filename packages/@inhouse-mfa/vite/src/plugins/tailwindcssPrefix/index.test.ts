import type { HotUpdateOptions, ViteDevServer } from 'vite';

import { transformAsync } from '@babel/core';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import tailwindcss from '@tailwindcss/vite';
import reactCompiler from 'babel-plugin-react-compiler';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { assert, expect, test } from 'vitest';

import { tailwindcssPrefix } from './index';

const require = createRequire(import.meta.url);
const tailwindRequire = createRequire(require.resolve('@tailwindcss/node'));
const theme = tailwindRequire.resolve('tailwindcss/theme.css');
const utilities = tailwindRequire.resolve('tailwindcss/utilities.css');
const utils = path.resolve(
  import.meta.dirname,
  '../../../../../@interior/tailwind/src/utils/index.ts',
);

const source = `
export { splitProps } from './class-usage.tsx?tsr-split=component';
import { columns as importedColumns } from '@/class-values';
const columnsAlias = importedColumns;
export const imported = { className: \`grid \${columnsAlias}\`, title: importedColumns };
const display = 'flex';
const status = 'hidden';
const clsx = (...values) => values.flatMap((value) =>
  typeof value === 'string' ? [value] : Object.entries(value).filter(([, enabled]) => enabled).map(([key]) => key)
).join(' ');
const tv = (recipe) => recipe;

export const plain = { className: display, style: { display }, title: 'hidden', label: 'px-8 py-4' };
export const prototypeUtility = { className: 'constructor' };
export const conditional = { className: status === 'hidden' ? 'block' : 'hidden' };
export const template = { className: \`px-8 \${status === 'hidden' ? 'hidden' : 'block'} custom-widget\` };
export const combined = { className: clsx('py-4', { 'md:hover:px-8': true, hidden: false }) };
export const recipe = tv({
  base: 'px-8',
  slots: { root: 'flex', icon: 'size-4' },
  variants: { state: { open: 'block', hidden: 'hidden' } },
  defaultVariants: { state: 'hidden' },
  compoundVariants: [{ state: 'hidden', class: 'opacity-50' }],
});
export const editor = { class: 'focus:outline-none hide-scrollbar' };
export const markers = { className: 'group/item peer group-hover/item:block peer-checked:block' };
export const arbitrary = { className: '[&_.custom-widget]:px-8 -mt-2 px-8! fixture__px-8' };
import { cn as actualCn, tv as actualTv } from './tailwind';
export const merged = actualCn('px-8', 'px-4');
const button = actualTv({ base: 'flex px-8', variants: { size: { small: 'text-sm' } }, defaultVariants: { size: 'small' } });
export const variantClass = button({ className: 'px-4' });
`;

test('namespaces emitted CSS and class values without changing styles or variant conditions', async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-tailwind-namespace-')));
  try {
    await mkdir(path.join(root, 'src/styles'), { recursive: true });
    await writeFile(
      path.join(root, 'src/styles/index.css'),
      `
@import ${JSON.stringify(theme)} layer(theme);
@import ${JSON.stringify(utilities)} layer(utilities) source(none);
@source '../';
@layer exterior { @layer utilities { .flex { display: flex; } } }
@utility hide-scrollbar { scrollbar-width: none; }
@utility constructor { display: block; }
`,
    );
    await writeFile(path.join(root, 'src/index.ts'), `import './styles/index.css';\n${source}`);
    await writeFile(
      path.join(root, 'src/constants.ts'),
      "export const columns = 'grid-cols-[minmax(36rem,1fr)_minmax(17.5rem,25rem)]';",
    );
    await writeFile(
      path.join(root, 'src/class-values.ts'),
      "export { columns } from './constants';",
    );
    await writeFile(
      path.join(root, 'src/class-usage.tsx'),
      "import { columns } from './constants'; export const splitProps = { className: `grid ${columns}`, title: columns };",
    );
    await writeFile(
      path.join(root, 'src/tailwind.ts'),
      `import { createTailwindUtils } from ${JSON.stringify(utils)};\nexport const { cn, tv } = createTailwindUtils({ prefix: 'fixture' });`,
    );
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      resolve: { alias: { '@': path.join(root, 'src') } },
      plugins: [tailwindcss(), tailwindcssPrefix({ prefix: 'fixture' })],
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        sourcemap: true,
        lib: {
          entry: path.join(root, 'src/index.ts'),
          formats: ['es'],
          fileName: 'fixture',
          cssFileName: 'fixture',
        },
      },
    });
    const outputs = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
    const css = outputs
      .flatMap((output) =>
        output.type === 'asset' && output.fileName.endsWith('.css') ? [output.source] : [],
      )
      .join('\n');
    const chunk = outputs.find((output) => output.type === 'chunk');
    if (!chunk?.map) {
      throw new Error('Expected a built JavaScript chunk with a source map.');
    }
    const code = chunk.code;
    const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

    expect(mod.imported.className).toBe(
      'fixture__grid fixture__grid-cols-[minmax(36rem,1fr)_minmax(17.5rem,25rem)]',
    );
    expect(mod.imported.title).toBe('grid-cols-[minmax(36rem,1fr)_minmax(17.5rem,25rem)]');
    expect(mod.splitProps).toEqual(mod.imported);
    expect(mod.plain.className).toBe('fixture__flex');
    expect(mod.plain.style.display).toBe('flex');
    expect(mod.plain.title).toBe('hidden');
    expect(mod.plain.label).toBe('px-8 py-4');
    expect(mod.prototypeUtility.className).toBe('fixture__constructor');
    expect(mod.conditional.className).toBe('fixture__block');
    expect(mod.template.className).toBe('fixture__px-8 fixture__hidden custom-widget');
    expect(mod.combined.className).toBe('fixture__py-4 fixture__md:hover:px-8');
    expect(mod.recipe.base).toBe('fixture__px-8');
    expect(mod.recipe.slots.icon).toBe('fixture__size-4');
    expect(mod.recipe.variants.state.hidden).toBe('fixture__hidden');
    expect(mod.recipe.defaultVariants.state).toBe('hidden');
    expect(mod.recipe.compoundVariants[0].state).toBe('hidden');
    expect(mod.recipe.compoundVariants[0].class).toBe('fixture__opacity-50');
    expect(mod.editor.class).toBe('fixture__focus:outline-none fixture__hide-scrollbar');
    expect(mod.merged).toBe('fixture__px-4');
    expect(mod.variantClass).toBe('fixture__flex fixture__text-sm fixture__px-4');
    expect(mod.markers.className).toBe(
      'fixture__group/item fixture__peer fixture__group-hover/item:block fixture__peer-checked:block',
    );
    expect(mod.arbitrary.className).toBe(
      'fixture__[&_.custom-widget]:px-8 fixture__-mt-2 fixture__px-8! fixture__px-8',
    );

    expect(css).toMatch(/\.fixture__px-8\s*\{/);
    expect(css).toMatch(/\.fixture__constructor\s*\{/);
    expect(css).toMatch(/fixture__md\\:hover\\:px-8/);
    expect(css).toMatch(/fixture__group\\\/item/);
    expect(css).toMatch(/fixture__peer/);
    expect(css).toMatch(/fixture__hide-scrollbar/);
    expect(css).toMatch(/\.custom-widget/);
    expect(css).not.toMatch(/fixture__custom-widget/);
    expect(css).not.toMatch(/(?:^|[\s,{])\.(?:px-8|hidden|py-4)\s*\{/);
    expect(css).toMatch(/\.flex\s*\{/);
    const prefix = code.slice(0, code.indexOf('fixture__px-8')).split('\n');
    const position = originalPositionFor(new TraceMap(chunk.map.toString()), {
      line: prefix.length,
      column: prefix[prefix.length - 1].length,
    });
    assert.exists(position.source);
    assert.exists(position.line);
    expect(position.source).toMatch(/src\/index\.ts$/);
    const originalSource = chunk.map.sourcesContent[chunk.map.sources.indexOf(position.source)];
    expect(originalSource.split('\n')[position.line - 1]).toMatch(/px-8/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('uses the same prefix format as createTailwindUtils', () => {
  expect(() => tailwindcssPrefix({ prefix: 'member' })).not.toThrow();
  expect(() => tailwindcssPrefix({ prefix: 'my-remote' })).not.toThrow();
  for (const prefix of ['', 'Member', 'member__', 'my--remote']) {
    expect(() => tailwindcssPrefix({ prefix })).toThrow(/prefix/);
  }
});

test('namespaces conditional classes with React Compiler ordered last', async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-tailwind-compiler-')));

  try {
    await mkdir(path.join(root, 'src/styles'), { recursive: true });
    await writeFile(
      path.join(root, 'src/styles/index.css'),
      `@import ${JSON.stringify(theme)} layer(theme);
@import ${JSON.stringify(utilities)} layer(utilities) source(none);
@source '../';`,
    );
    // Only the renderer and memo cache are stubbed; compilation uses the real React Compiler.
    await writeFile(
      path.join(root, 'src/react.ts'),
      `export const c = (size) => Array(size).fill(Symbol.for('react.memo_cache_sentinel'));
export const jsxDEV = (tag, props) => props;
export const jsx = jsxDEV;
export const jsxs = jsxDEV;
export default { createElement: jsxDEV };`,
    );
    await writeFile(
      path.join(root, 'src/index.tsx'),
      `import './styles/index.css';
import React from 'react';
const clsx = (...values) => values.filter(Boolean).join(' ');
export const CalendarCell = ({ today }) => (
  <div className={clsx('border', today ? 'bg-white border-red-500' : 'border-transparent')} title="border-transparent" />
);`,
    );

    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      resolve: {
        alias: [
          {
            find: /^react(?:\/(?:compiler-runtime|jsx-dev-runtime|jsx-runtime))?$/,
            replacement: path.join(root, 'src/react.ts'),
          },
        ],
      },
      plugins: [
        tailwindcss(),
        tailwindcssPrefix({ prefix: 'fixture' }),
        {
          name: 'react-compiler',
          enforce: 'pre',
          async transform(code, id) {
            if (!id.endsWith('.tsx')) {
              return;
            }

            const compiled = await transformAsync(code, {
              filename: id,
              babelrc: false,
              configFile: false,
              parserOpts: { plugins: ['typescript', 'jsx'] },
              plugins: [[reactCompiler, { target: '19' }]],
            });

            return compiled?.code ? { code: compiled.code, map: compiled.map } : undefined;
          },
        },
      ],
      build: {
        write: false,
        minify: false,
        lib: {
          entry: path.join(root, 'src/index.tsx'),
          formats: ['es'],
          fileName: 'fixture',
          cssFileName: 'fixture',
        },
      },
    });
    const outputs = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
    const chunk = outputs.find((output) => output.type === 'chunk');
    assert.exists(chunk);
    expect(chunk.code).toContain('react.memo_cache_sentinel');
    const mod = await import(
      `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`
    );

    expect(mod.CalendarCell({ today: false })).toEqual({
      className: 'fixture__border fixture__border-transparent',
      title: 'border-transparent',
    });
    expect(mod.CalendarCell({ today: true })).toEqual({
      className: 'fixture__border fixture__bg-white fixture__border-red-500',
      title: 'border-transparent',
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('refreshes source mappings when stylesheets or imported constants change in dev', async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-tailwind-hmr-')));
  const cssFile = path.join(root, 'src/styles/index.css');
  const stylesheet = `@import ${JSON.stringify(theme)} layer(theme);
@import ${JSON.stringify(utilities)} layer(utilities) source(none);
@source '../';`;
  let server: undefined | ViteDevServer;
  try {
    await mkdir(path.dirname(cssFile), { recursive: true });
    await writeFile(cssFile, stylesheet);
    const constantsFile = path.join(root, 'src/constants.ts');
    await writeFile(constantsFile, "export const display = 'flex';");
    await writeFile(
      path.join(root, 'src/index.ts'),
      "import './styles/index.css'; import { display } from './constants'; export const props = { className: 'fresh-util', title: 'fresh-util' }; export const imported = { className: display, title: display };",
    );
    const prefixPlugins = tailwindcssPrefix({ prefix: 'fixture' });
    server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [tailwindcss(), prefixPlugins],
      server: { middlewareMode: true, watch: null, hmr: false },
    });
    const before = await server.transformRequest('/src/index.ts');
    assert.exists(before);
    expect(before.code).not.toMatch(/fixture__fresh-util/);
    expect(before.code).toMatch(/className: "fixture__flex"/);
    await server.transformRequest('/src/styles/index.css');

    await writeFile(cssFile, `${stylesheet}\n@utility fresh-util { display: flex; }`);
    const hook = prefixPlugins[0].hotUpdate;
    const handler = typeof hook === 'function' ? hook : hook?.handler;
    if (!handler) {
      throw new Error('Expected the source plugin to register a hotUpdate hook.');
    }
    await Reflect.apply(handler, { environment: server.environments.client }, [
      {
        type: 'update',
        file: cssFile,
        server,
        timestamp: Date.now(),
        modules: [],
        read: () => readFile(cssFile, 'utf8'),
      } satisfies HotUpdateOptions,
    ]);
    const after = await server.transformRequest('/src/index.ts');
    assert.exists(after);
    expect(after.code).toMatch(/className: "fixture__fresh-util"/);
    expect(after.code).toMatch(/title: ["']fresh-util["']/);
    const css = await server.transformRequest('/src/styles/index.css');
    assert.exists(css);
    expect(css.code).toMatch(/fixture__fresh-util/);

    await writeFile(constantsFile, "export const display = 'block';");
    await Reflect.apply(handler, { environment: server.environments.client }, [
      {
        type: 'update',
        file: constantsFile,
        server,
        timestamp: Date.now(),
        modules: [],
        read: () => readFile(constantsFile, 'utf8'),
      } satisfies HotUpdateOptions,
    ]);
    const updated = await server.transformRequest('/src/index.ts');
    assert.exists(updated);
    expect(updated.code).toMatch(/className: "fixture__block"/);
    expect(updated.code).toMatch(/title: display/);
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('registers only prefix transforms so Tailwind can be configured separately', () => {
  expect(tailwindcssPrefix({ prefix: 'fixture' }).map((plugin) => plugin.name)).toStrictEqual([
    'mfa-tailwind-prefix-source',
    'mfa-tailwind-prefix-css',
  ]);
});
