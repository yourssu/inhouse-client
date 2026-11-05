import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import path from 'node:path';
import { expect, test, vi } from 'vitest';

import { createClassMapper } from './createClassMapper';
import { createClassValueResolver } from './createClassValueResolver';
import { namespaceSource } from './namespaceSource';

const mapClassList = createClassMapper('fixture', (value) =>
  ['block', 'flex', 'px-8', 'py-4'].includes(value),
).mapClassList;

const createResolver = (modules: Record<string, string>) => {
  const loadModule = vi.fn(async (filename: string) => modules[filename]);
  const values = createClassValueResolver(loadModule);
  const filename = '/src/entry.tsx';

  const resolveModule = async (source: string, importer: string) => {
    const resolved = path.posix.resolve(path.posix.dirname(importer), source);
    return [resolved, `${resolved}.ts`].find((candidate) => candidate in modules);
  };

  return {
    loadModule,
    values,
    transform: (code: string) =>
      namespaceSource(code, filename, mapClassList, (valuePath) =>
        values.resolveValue(valuePath, filename, resolveModule),
      ),
  };
};

test('resolves named imports and local aliases only at their class usages', async () => {
  const { transform } = createResolver({
    '/src/classes.ts': "export const columns = 'px-8';",
  });
  const code = `import { columns as grid } from './classes';
const alias = grid;
export const result = { className: alias, title: alias };`;
  const result = await transform(code);

  expect(result.code).toContain('className: "fixture__px-8", title: alias');
  expect(result.code).toContain('const alias = grid;');
  expect(result.code).toContain("import { columns as grid } from './classes'");
  expect((await transform(result.code)).code).toBe(result.code);
});

test('resolves default imports, string concatenation, templates and TypeScript wrappers', async () => {
  const { transform } = createResolver({
    '/src/base.ts': "export const base = 'px-8';",
    '/src/classes.ts':
      "import { base } from './base'; const combined = `${base} flex` as string; export default combined satisfies string;",
  });
  const result = await transform(`import columns from './classes';
const combined = columns + ' custom-widget';
export const result = { className: combined, title: combined };`);

  expect(result.code).toContain(
    'className: "fixture__px-8 fixture__flex custom-widget", title: combined',
  );
});

test('follows named re-exports, export stars and imported local exports', async () => {
  const { transform } = createResolver({
    '/src/base.ts': "export const columns = 'py-4';",
    '/src/local.ts': "import { columns as grid } from './base'; export { grid };",
    '/src/named.ts': "export { grid as columns } from './local';",
    '/src/classes.ts': "export * from './named';",
  });
  const result = await transform(
    "import { columns } from './classes'; export const result = { className: columns };",
  );

  expect(result.code).toContain('className: "fixture__py-4"');
});

test('resolves namespace properties without changing their non-class uses', async () => {
  const { transform } = createResolver({
    '/src/classes.ts': "export const columns = 'px-8';",
  });
  const result = await transform(`import * as classes from './classes';
export const result = [{ className: classes.columns, title: classes.columns }, { className: classes['columns'] }];`);

  expect(result.code).toContain('className: "fixture__px-8", title: classes.columns');
  expect(result.code.match(/fixture__px-8/g)).toHaveLength(2);
});

test('preserves shadowed bindings and variable declarations', async () => {
  const { transform } = createResolver({
    '/src/classes.ts': "export const display = 'flex';",
  });
  const result = await transform(`import { display } from './classes';
const inner = () => { const display = 'block'; return { className: display, title: display }; };
export const result = { className: display, title: display };`);

  expect(result.code).toContain("const display = 'block';");
  expect(result.code).toContain('className: "fixture__block", title: display');
  expect(result.code).toContain('className: "fixture__flex", title: display');
});

test('leaves mutable and runtime exports unresolved and never executes imported modules', async () => {
  const { transform } = createResolver({
    '/src/classes.ts': `throw new Error('must not execute');
export let display = 'flex';
export const runtime = getClassName();
export const fixed = 'px-8';
export const update = () => { display = 'block'; };`,
  });
  const result = await transform(`import { display, runtime, fixed } from './classes';
export const result = [{ className: display }, { className: runtime }, { className: fixed }];`);

  expect(result.code).toContain('{ className: display }, { className: runtime }');
  expect(result.code).toContain('className: "fixture__px-8"');
});

test('handles cyclic re-exports and does not export defaults through export stars', async () => {
  const { transform } = createResolver({
    '/src/a.ts': "export * from './b';",
    '/src/b.ts': "export * from './a'; export const columns = 'px-8'; export default 'flex';",
  });
  const result = await transform(`import defaultValue, { columns, missing } from './a';
export const result = [{ className: columns }, { className: missing }, { className: defaultValue }];`);

  expect(result.code).toContain('className: "fixture__px-8"');
  expect(result.code).toContain('{ className: missing }, { className: defaultValue }');
});

test('caches parsed modules and invalidates them when an imported source changes', async () => {
  const modules = { '/src/classes.ts': "export const display = 'flex';" };
  const { transform, loadModule, values } = createResolver(modules);
  const code = "import { display } from './classes'; const result = { className: display };";

  expect((await transform(code)).code).toContain('fixture__flex');
  expect((await transform(code)).code).toContain('fixture__flex');
  expect(loadModule).toHaveBeenCalledTimes(1);
  expect(values.invalidate('/src/unrelated.ts')).toBe(false);

  modules['/src/classes.ts'] = "export const display = 'block';";
  expect(values.invalidate('/src/classes.ts')).toBe(true);
  expect((await transform(code)).code).toContain('fixture__block');
  expect(loadModule).toHaveBeenCalledTimes(2);
});

test('maps replaced imports back to the original class reference in source maps', async () => {
  const { transform } = createResolver({
    '/src/classes.ts': "export const columns = 'px-8';",
  });
  const code =
    "import { columns } from './classes';\nexport const result = { className: columns, title: columns };";
  const result = await transform(code);
  const prefix = result.code.slice(0, result.code.indexOf('fixture__px-8')).split('\n');
  const original = originalPositionFor(new TraceMap(result.map.toString()), {
    line: prefix.length,
    column: prefix[prefix.length - 1].length,
  });

  expect(original).toMatchObject({
    source: '/src/entry.tsx',
    line: 2,
    column: code.split('\n')[1].indexOf('columns'),
  });
});
