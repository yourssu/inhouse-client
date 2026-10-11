import type { PluginOption, ViteDevServer } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { assert, expect, test, vi } from 'vitest';

import { cssResolverOptions } from '../../cssResolver';
import { remoteAssetsPlugin } from '../remoteAssetsPlugin';
import { tailwindcssPrefix } from '../tailwindcssPrefix';
import { sharedCssPlugin } from './index';

const require = createRequire(import.meta.url);
const theme = require.resolve('tailwindcss/theme.css');
const utilities = require.resolve('tailwindcss/utilities.css');

const fixture = async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-native-css-')));
  await mkdir(path.join(root, 'src/styles/nested'), { recursive: true });
  await writeFile(path.join(root, 'shared.css'), '.shared-output { display: none; }');
  await writeFile(
    path.join(root, 'src/styles/nested/service.css'),
    '@import "../../../shared.css"; .service { color: red; }',
  );
  await writeFile(
    path.join(root, 'src/styles/index.css'),
    `
@layer reset, theme, utilities;
@import '../../shared.css' layer(reset);
@import ${JSON.stringify(theme)} layer(theme);
@import ${JSON.stringify(utilities)} layer(utilities);
@import './nested/service.css';
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
`,
  );
  await writeFile(
    path.join(root, 'src/entry.ts'),
    `import './styles/index.css'; export const props = { className: 'flex fresh-util shared-output dark:block' };`,
  );
  return root;
};

const plugins = (root: string): PluginOption[] => [
  tailwindcss(),
  tailwindcssPrefix({ prefix: 'fixture' }),
  sharedCssPlugin([path.join(root, 'shared.css')]),
  remoteAssetsPlugin(),
];

const buildFixture = async (root: string, extra: PluginOption[] = []) => {
  const result = await build({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [...extra, ...plugins(root)],
    build: {
      write: false,
      minify: false,
      cssMinify: false,
      assetsInlineLimit: 0,
      rolldownOptions: {
        input: path.join(root, 'src/entry.ts'),
        preserveEntrySignatures: 'strict',
      },
    },
  });
  return [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
};

const serverFixture = (root: string, list = plugins(root)) =>
  createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: list,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
  });

test('uses real empty CSS for aliases, absolute paths and symlinks while preserving distinct files', async () => {
  const root = await fixture();
  let server: undefined | ViteDevServer;
  try {
    await symlink(path.join(root, 'shared.css'), path.join(root, 'shared-link.css'));
    await writeFile(
      path.join(root, 'same-content.css'),
      await readFile(path.join(root, 'shared.css')),
    );
    server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      resolve: { alias: { 'shared-alias': path.join(root, 'shared-link.css') } },
      plugins: [
        sharedCssPlugin([path.join(root, 'shared.css'), path.join(root, 'shared-link.css')]),
      ],
      optimizeDeps: { noDiscovery: true, include: [] },
      server: { middlewareMode: true, watch: null },
    });
    const importer = path.join(root, 'src/entry.ts');
    const resolved = await Promise.all(
      ['../shared.css', '../shared-link.css', 'shared-alias', path.join(root, 'shared.css')].map(
        (source) => server!.pluginContainer.resolveId(source, importer),
      ),
    );
    const empty = resolved[0]?.id;
    assert.exists(empty);
    expect(new Set(resolved.map((result) => result?.id)).size).toBe(1);
    expect(empty).toMatch(/empty\.css$/);
    expect(await readFile(empty, 'utf8')).toBe('');
    const native = server.config.createResolver(cssResolverOptions);
    expect(await native('../shared-link.css', importer)).toBe(empty);
    expect(await native('../same-content.css', importer)).toBe(path.join(root, 'same-content.css'));
    expect(await server.transformRequest(`/@fs/${empty}?inline`)).toMatchObject({
      code: expect.stringContaining('export default ""'),
    });
    expect(await readFile(path.join(root, 'shared.css'), 'utf8')).toContain('shared-output');
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['missing.css', 'bad.module.css', 'definitions.css', 'nested-definitions.css'])(
  'rejects invalid shared output CSS: %s',
  async (name) => {
    const root = await fixture();
    try {
      await writeFile(path.join(root, 'bad.module.css'), '.class { display: block; }');
      await writeFile(path.join(root, 'definitions.css'), '@utility custom { display: flex; }');
      await writeFile(path.join(root, 'nested-definitions.css'), '@import "./definitions.css";');
      await expect(serverFixture(root, [sharedCssPlugin([path.join(root, name)])])).rejects.toThrow(
        /sharedCSS|compiler definitions/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test('keeps native Tailwind definitions, CSS Modules, references, dark variants and namespace analysis aligned', async () => {
  const root = await fixture();
  try {
    await writeFile(
      path.join(root, 'src/styles/nested/service.css'),
      '@utility fresh-util { display: grid; } .service { color: red; }',
    );
    await writeFile(path.join(root, 'src/styles/base.module.css'), '.base { color: red; }');
    await writeFile(
      path.join(root, 'src/styles/editor.module.css'),
      '@reference "./index.css"; .editor { composes: base from "./base.module.css"; @apply flex; }',
    );
    await writeFile(
      path.join(root, 'src/entry.ts'),
      `import './styles/index.css'; export { default as classes } from './styles/editor.module.css'; export const props = { className: 'flex fresh-util shared-output dark:block' };`,
    );
    const outputs = await buildFixture(root);
    const css = outputs
      .flatMap((output) =>
        output.type === 'asset' && output.fileName.endsWith('.css') ? [output.source] : [],
      )
      .join('\n');
    const entry = outputs.find((output) => output.type === 'chunk' && output.isEntry);
    assert.exists(entry);
    assert(entry.type === 'chunk');
    const mod = await import(
      `data:text/javascript;base64,${Buffer.from(entry.code).toString('base64')}`
    );
    expect(mod.props.className).toBe(
      'fixture__flex fixture__fresh-util shared-output fixture__dark:block',
    );
    expect(css).not.toContain('.shared-output');
    expect(css).toContain('.fixture__flex');
    expect(css).toContain('.fixture__fresh-util');
    expect(css).toContain('data-theme="dark"');
    expect(css).toMatch(/@layer reset, theme;[\s\S]*@layer utilities/);
    for (const classname of mod.classes.editor.split(' ')) {
      expect(css).toContain(`.${classname}`);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each([false, true])(
  'validates original nested CSS asset URLs (Tailwind=%s)',
  async (withTailwind) => {
    const root = await fixture();
    let server: undefined | ViteDevServer;
    try {
      await writeFile(
        path.join(root, 'src/styles/nested/service.css'),
        '.bad { background: url(/logo.svg); }',
      );
      if (!withTailwind) {
        await writeFile(path.join(root, 'src/styles/index.css'), '@import "./nested/service.css";');
      }
      server = await serverFixture(
        root,
        withTailwind ? plugins(root) : [sharedCssPlugin([]), remoteAssetsPlugin()],
      );
      await expect(server.transformRequest('/src/styles/index.css')).rejects.toThrow(
        'source-relative CSS',
      );
    } finally {
      await server?.close();
      await rm(root, { recursive: true, force: true });
    }
  },
);

test('isolates simultaneous remote policies and leaves shell CSS intact', async () => {
  const first = await fixture(),
    second = await fixture();
  const servers: ViteDevServer[] = [];
  try {
    for (const root of [first, second]) {
      servers.push(await serverFixture(root));
    }
    servers.push(await serverFixture(first, [tailwindcss()]));
    const css = await Promise.all(
      servers.map((server) => server.transformRequest('/src/styles/index.css?inline')),
    );
    expect(css[0]?.code).not.toContain('shared-output');
    expect(css[1]?.code).not.toContain('shared-output');
    expect(css[2]?.code).toContain('shared-output');
  } finally {
    await Promise.all(servers.map((server) => server.close()));
    await Promise.all([first, second].map((root) => rm(root, { recursive: true, force: true })));
  }
});

test('tracks nested Tailwind CSS changes and recovers after rename, deletion and syntax errors without changing the entry', async () => {
  const root = await fixture();
  const list = plugins(root);
  const server = await serverFixture(root, list);
  const nested = path.join(root, 'src/styles/nested/service.css');
  const index = path.join(root, 'src/styles/index.css');
  const original = await readFile(index, 'utf8');
  try {
    await server.transformRequest('/src/entry.ts');
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).toContain(
      '.service',
    );
    expect(server.environments.client.moduleGraph.getModulesByFile(nested)?.size).toBeGreaterThan(
      0,
    );
    const update = async () => {
      server.environments.client.moduleGraph.onFileChange(nested);
      const hook = list
        .flat()
        .find(
          (plugin) =>
            typeof plugin === 'object' &&
            plugin &&
            'name' in plugin &&
            plugin.name === 'mfa-tailwind-prefix-source',
        );
      assert(hook && typeof hook === 'object' && 'hotUpdate' in hook);
      const handler =
        typeof hook.hotUpdate === 'function' ? hook.hotUpdate : hook.hotUpdate?.handler;
      assert.exists(handler);
      await Reflect.apply(handler, { environment: server.environments.client }, [
        { file: nested, timestamp: Date.now(), modules: [], server },
      ]);
    };
    await writeFile(nested, '@utility fresh-util { display: grid; } .updated { color: blue; }');
    await update();
    expect((await server.transformRequest('/src/entry.ts'))?.code).toContain('fixture__fresh-util');
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).toContain(
      '.fixture__fresh-util',
    );
    expect(await readFile(index, 'utf8')).toBe(original);
    await writeFile(nested, '.removed { color: red; }');
    await update();
    expect((await server.transformRequest('/src/entry.ts'))?.code).not.toContain(
      'fixture__fresh-util',
    );
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).not.toContain(
      'fixture__fresh-util',
    );
    await writeFile(nested, '.broken {');
    await expect(update()).rejects.toThrow();
    await writeFile(nested, '.recovered { color: blue; }');
    await update();
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).toContain(
      '.recovered',
    );
    await rename(nested, `${nested}.renamed`);
    await expect(update()).rejects.toThrow();
    await rename(`${nested}.renamed`, nested);
    await update();
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).toContain(
      '.recovered',
    );
    await rm(nested);
    await expect(update()).rejects.toThrow();
    await writeFile(nested, '.restored { color: blue; }');
    await update();
    expect((await server.transformRequest('/src/styles/index.css?inline'))?.code).toContain(
      '.restored',
    );
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('resolves conditional package exports in dev and build and distinguishes another installed version', async () => {
  const root = await fixture();
  let server: undefined | ViteDevServer;
  try {
    for (const folder of ['node_modules/output-css', 'secondary/node_modules/output-css']) {
      const directory = path.join(root, folder);
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({
          name: 'output-css',
          exports: {
            './styles': {
              development: './dev.css',
              production: './prod.css',
              default: './prod.css',
            },
          },
        }),
      );
      await writeFile(path.join(directory, 'dev.css'), '.development-output { color: red; }');
      await writeFile(path.join(directory, 'prod.css'), '.production-output { color: red; }');
    }
    server = await serverFixture(root, [sharedCssPlugin(['output-css/styles'])]);
    const main = await server.pluginContainer.resolveId(
      'output-css/styles',
      path.join(root, 'src/entry.ts'),
    );
    expect(main?.id).toMatch(/empty\.css$/);
    await mkdir(path.join(root, 'secondary/node_modules/consumer'), { recursive: true });
    const importer = path.join(root, 'secondary/node_modules/consumer/index.css');
    await writeFile(importer, '@import "output-css/styles";');
    const second = await server.config.createResolver(cssResolverOptions)(
      'output-css/styles',
      importer,
    );
    expect(second).toBe(path.join(root, 'secondary/node_modules/output-css/dev.css'));
    await writeFile(
      path.join(root, 'src/entry.ts'),
      "import 'output-css/styles'; export const ready = true;",
    );
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [sharedCssPlugin(['output-css/styles'])],
      build: { write: false, rolldownOptions: { input: path.join(root, 'src/entry.ts') } },
    });
    const outputs = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
    expect(
      outputs.map((output) => (output.type === 'chunk' ? output.code : output.source)).join('\n'),
    ).not.toContain('production-output');
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('excludes shared styles in lazy chunks without producing empty CSS assets', async () => {
  const root = await fixture();
  try {
    await writeFile(
      path.join(root, 'src/lazy.ts'),
      "import '../shared.css'; import './styles/nested/service.css'; export const loaded = true;",
    );
    await writeFile(
      path.join(root, 'src/entry.ts'),
      "import './styles/index.css'; export const load = () => import('./lazy.ts');",
    );
    const outputs = await buildFixture(root);
    expect(outputs.some((output) => output.type === 'chunk' && !output.isEntry)).toBe(true);
    const assets = outputs.filter(
      (output) => output.type === 'asset' && output.fileName.endsWith('.css'),
    );
    expect(assets.length).toBeGreaterThan(0);
    for (const asset of assets) {
      assert(asset.type === 'asset');
      expect(String(asset.source).trim().length).toBeGreaterThan(0);
      expect(String(asset.source)).not.toContain('shared-output');
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['raw', 'url'])('rejects shared CSS query bypass: %s', async (query) => {
  const root = await fixture();
  const server = await serverFixture(root);
  try {
    await expect(
      server.pluginContainer.resolveId(`../shared.css?${query}`, path.join(root, 'src/entry.ts')),
    ).rejects.toThrow('Import remote styles as CSS modules or with ?inline');
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects copied public CSS as a shared module', async () => {
  const root = await fixture();
  try {
    await mkdir(path.join(root, 'public'));
    await writeFile(path.join(root, 'public/shared.css'), '.shared { color: red; }');
    await expect(
      serverFixture(root, [sharedCssPlugin([path.join(root, 'public/shared.css')])]),
    ).rejects.toThrow('not copied public CSS');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['./', '/remote/', 'https://cdn.example.com/scouter/'])(
  'preserves nested asset spaces, queries and fragments with base %s',
  async (base) => {
    const root = await fixture();
    try {
      const folder = path.join(root, 'src/styles/nested');
      await writeFile(
        path.join(folder, 'image space.svg'),
        '<svg xmlns="http://www.w3.org/2000/svg"/>',
      );
      await writeFile(path.join(folder, 'font.woff2'), 'fixture-font');
      await writeFile(
        path.join(folder, 'service.css'),
        `.service { background: image-set(url('./image space.svg?rev=1#mark') 1x); }
@font-face { font-family: fixture; src: url('./font.woff2?rev=1#font'); }`,
      );
      const outputs = await buildFixture(root, [
        { name: 'fixture-base', config: () => ({ base }) },
      ]);
      const css = outputs
        .flatMap((output) =>
          output.type === 'asset' && output.fileName.endsWith('.css') ? [output.source] : [],
        )
        .join('\n');
      expect(outputs.some((output) => output.fileName.endsWith('.svg'))).toBe(true);
      expect(outputs.some((output) => output.fileName.endsWith('.woff2'))).toBe(true);
      expect(css).toContain('image-set(');
      expect(css).toContain('?rev=1#mark');
      expect(css).toContain('?rev=1#font');
      expect(css).not.toContain('localhost:5173');
      expect(css).not.toContain('./nested/');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test.each(['directory', 'file', 'nested-directory', 'extensionless-file'])(
  'rejects public CSS exposed through a %s symlink',
  async (kind) => {
    const root = await fixture();
    const publicRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), 'mfa-public-css-')));
    try {
      await writeFile(path.join(publicRoot, 'shared.css'), '.shared-public { color: red; }');
      let exposed = path.join(root, 'public/shared.css');

      if (kind === 'directory') {
        await symlink(publicRoot, path.join(root, 'public'));
      } else {
        await mkdir(path.join(root, 'public'));
        if (kind === 'file' || kind === 'extensionless-file') {
          if (kind === 'extensionless-file') {
            exposed = path.join(root, 'public/styles');
          }
          await symlink(path.join(publicRoot, 'shared.css'), exposed);
        } else {
          await symlink(publicRoot, path.join(root, 'public/nested'));
          exposed = path.join(root, 'public/nested/shared.css');
        }
      }

      const source = kind === 'extensionless-file' ? path.join(publicRoot, 'shared.css') : exposed;
      await expect(serverFixture(root, [sharedCssPlugin([source])])).rejects.toThrow(
        'not copied public CSS',
      );
      // Aliases/package exports can resolve directly to the same copied file.
      await expect(
        serverFixture(root, [sharedCssPlugin([path.join(publicRoot, 'shared.css')])]),
      ).rejects.toThrow('not copied public CSS');
    } finally {
      await rm(root, { recursive: true, force: true });
      await rm(publicRoot, { recursive: true, force: true });
    }
  },
);

test('handles missing public directories, broken links and symlink cycles', async () => {
  const root = await fixture();
  let server: undefined | ViteDevServer;
  try {
    await mkdir(path.join(root, 'public'));
    await symlink(path.join(root, 'public'), path.join(root, 'public/cycle'));
    await symlink(path.join(root, 'missing.css'), path.join(root, 'public/broken.css'));
    server = await serverFixture(root, [sharedCssPlugin([path.join(root, 'shared.css')])]);
    expect(
      (await server.pluginContainer.resolveId('../shared.css', path.join(root, 'src/entry.ts')))
        ?.id,
    ).toMatch(/empty\.css$/);
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});

test.each([true, false])('preserves generated CSS IDs inside remote root=%s', async (inside) => {
  const root = await fixture();
  try {
    const filename = inside ? path.join(root, 'src/generated.css') : `${root}-generated.css`;
    await writeFile(path.join(root, 'src/entry.ts'), "import 'generated-service.css';");
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [
        sharedCssPlugin([path.join(root, 'shared.css')]),
        remoteAssetsPlugin(),
        {
          name: 'fixture-generated-css',
          resolveId(source) {
            return source === 'generated-service.css' ? filename : undefined;
          },
          load(id) {
            return id === filename ? '.generated-service { color: red; }' : undefined;
          },
        },
      ],
      build: {
        write: false,
        cssMinify: false,
        rolldownOptions: { input: path.join(root, 'src/entry.ts') },
      },
    });
    const outputs = [result].flat().flatMap((bundle) => ('output' in bundle ? bundle.output : []));
    expect(
      outputs.some(
        (output) => output.type === 'asset' && String(output.source).includes('.generated-service'),
      ),
    ).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('does not read external/package CSS for asset checks but validates local nested sources', async () => {
  const root = await fixture();
  const server = await serverFixture(root, [sharedCssPlugin([])]);
  const external = `${root}-external.css`;
  const vendor = path.join(root, 'node_modules/css-vendor/index.css');
  const local = path.join(root, 'src/styles/nested/service.css');
  try {
    await mkdir(path.dirname(vendor), { recursive: true });
    await writeFile(external, '.external { background: url(/external.svg); }');
    await writeFile(vendor, '.vendor { background: url(/vendor.svg); }');
    await writeFile(local, '.local { background: url(/local.svg); }');
    const read = vi.spyOn(fs, 'readFile');
    try {
      const resolve = server.config.createResolver(cssResolverOptions);
      const importer = path.join(root, 'src/styles/index.css');
      expect(await resolve(external, importer)).toBe(external);
      expect(await resolve(vendor, importer)).toBe(vendor);
      expect(read.mock.calls.some(([file]) => file === external || file === vendor)).toBe(false);
      await expect(resolve(local, importer)).rejects.toThrow('source-relative CSS');
      expect(read.mock.calls.some(([file]) => file === local)).toBe(true);
    } finally {
      read.mockRestore();
    }
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
    await rm(external, { force: true });
  }
});

test('uses the real watcher and HMR socket for nested imports, file renames and syntax error recovery', async () => {
  const root = await fixture();
  const index = path.join(root, 'src/styles/index.css');
  const nested = path.join(root, 'src/styles/nested/service.css');
  const added = path.join(root, 'src/styles/nested/added.css');
  const renamed = path.join(root, 'src/styles/nested/renamed.css');
  const final = path.join(root, 'src/styles/nested/final.css');
  const entry = path.join(root, 'src/entry.ts');
  await writeFile(
    entry,
    `${await readFile(entry, 'utf8')}\nif (import.meta.hot) import.meta.hot.accept();`,
  );
  const originalIndex = await readFile(index, 'utf8');
  const originalEntry = await readFile(entry, 'utf8');
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: plugins(root),
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { host: '127.0.0.1', port: 0, watch: { awaitWriteFinish: false } },
  });
  let socket: undefined | WebSocket;
  try {
    await server.listen();
    const address = server.httpServer?.address();
    assert(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const frames: string[] = [];
    const watched: string[] = [];
    server.watcher.on('all', (event, file) => watched.push(`${event}:${file}`));
    socket = new WebSocket(
      `ws://127.0.0.1:${address.port}/?token=${server.config.webSocketToken}`,
      'vite-hmr',
    );
    socket.addEventListener('message', (event) => frames.push(String(event.data)));
    await vi.waitFor(() =>
      expect(frames.some((frame) => frame.includes('"type":"connected"'))).toBe(true),
    );
    const request = async (url: string) => {
      const response = await fetch(`${origin}${url}`);
      expect(response.status).toBe(200);
      return await response.text();
    };
    const waitForUpdate = async (offset: number, path: string) => {
      await vi.waitFor(
        () =>
          expect(
            frames
              .slice(offset)
              .some((frame) => frame.includes('"type":"update"') && frame.includes(path)),
          ).toBe(true),
        { timeout: 5000 },
      );
    };
    expect(await request('/src/entry.ts')).not.toContain('fixture__fresh-util');
    await request('/src/styles/index.css');
    await vi.waitFor(() =>
      expect(server.watcher.getWatched()[path.dirname(nested)]).toContain('service.css'),
    );

    await writeFile(added, '@utility fresh-util { display: grid; } .added-style { color: blue; }');
    let offset = frames.length;
    await writeFile(nested, `@import './added.css'; .service { color: red; }`);
    await waitForUpdate(offset, '/src/entry.ts');
    expect(await request('/src/entry.ts')).toContain('fixture__fresh-util');
    expect(await request('/src/styles/index.css')).toContain('.fixture__fresh-util');
    expect(server.environments.client.moduleGraph.getModulesByFile(added)?.size).toBeGreaterThan(0);

    offset = frames.length;
    await writeFile(nested, '.without-added { color: red; }');
    await waitForUpdate(offset, '/src/entry.ts');
    expect(await request('/src/entry.ts')).not.toContain('fixture__fresh-util');
    expect(await request('/src/styles/index.css')).not.toContain('.added-style');

    await rename(added, renamed);
    offset = frames.length;
    await writeFile(nested, `@import './renamed.css'; .service { color: red; }`);
    await waitForUpdate(offset, '/src/entry.ts');
    expect(await request('/src/entry.ts')).toContain('fixture__fresh-util');
    expect(await request('/src/styles/index.css')).toContain('.added-style');

    offset = frames.length;
    await rename(renamed, final);
    await writeFile(nested, `@import './final.css'; .service { color: red; }`);
    await waitForUpdate(offset, '/src/styles/index.css');
    expect(await request('/src/styles/index.css')).toContain('.fixture__fresh-util');
    expect(await request('/src/entry.ts')).toContain('fixture__fresh-util');
    await vi.waitFor(() => {
      expect(watched).toContain(`unlink:${renamed}`);
      expect(watched).toContain(`add:${final}`);
    });
    expect(server.environments.client.moduleGraph.getModulesByFile(final)?.size).toBeGreaterThan(0);
    expect(frames.some((frame) => frame.includes('"type":"error"'))).toBe(false);

    offset = frames.length;
    await writeFile(final, '.broken {');
    await vi.waitFor(
      () =>
        expect(
          frames
            .slice(offset)
            .some(
              (frame) =>
                frame.includes('"type":"error"') &&
                frame.includes('Unclosed block') &&
                frame.includes(final),
            ),
        ).toBe(true),
      { timeout: 5000 },
    );
    expect(socket.readyState).toBe(WebSocket.OPEN);

    const recoveryOffset = frames.length;
    await writeFile(final, '.recovered { color: green; }');
    await waitForUpdate(recoveryOffset, '/src/styles/index.css');
    await waitForUpdate(recoveryOffset, '/src/entry.ts');
    const recoveredCss = await request('/src/styles/index.css');
    expect(recoveredCss).toContain('.recovered');
    expect(recoveredCss).not.toContain('.fixture__fresh-util');
    expect(await request('/src/entry.ts')).not.toContain('fixture__fresh-util');

    offset = frames.length;
    await writeFile(
      final,
      '@utility fresh-util { display: flex; } .after-recovery { color: blue; }',
    );
    await waitForUpdate(offset, '/src/styles/index.css');
    await waitForUpdate(offset, '/src/entry.ts');
    const updatedCss = await request('/src/styles/index.css');
    expect(updatedCss).toContain('.after-recovery');
    expect(updatedCss).toContain('.fixture__fresh-util');
    expect(await request('/src/entry.ts')).toContain('fixture__fresh-util');
    expect(socket.readyState).toBe(WebSocket.OPEN);
    expect(await readFile(index, 'utf8')).toBe(originalIndex);
    expect(await readFile(entry, 'utf8')).toBe(originalEntry);
    expect(frames.some((frame) => frame.includes('"type":"full-reload"'))).toBe(false);
    expect(frames.slice(recoveryOffset).some((frame) => frame.includes('"type":"error"'))).toBe(
      false,
    );
  } finally {
    socket?.close();
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
}, 15000);
