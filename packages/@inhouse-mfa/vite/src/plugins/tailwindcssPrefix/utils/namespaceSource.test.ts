import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { JsxEmit, ModuleKind, transpileModule } from 'typescript';
import { expect, test } from 'vitest';

import { sourceCases } from '../../../__fixtures__/namespaceSource';
import { createClassMapper } from './createClassMapper';
import { namespaceSource } from './namespaceSource';

const namespaceClasses = createClassMapper('fixture', (candidate) =>
  ['block', "content-['a\"b']", 'flex', 'hidden', 'opacity-50', 'px-8', 'py-4', 'text-sm'].includes(
    candidate,
  ),
).mapClassList;

const executeSource = async (code: string): Promise<{ result: unknown }> => {
  const { outputText } = transpileModule(code, {
    compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.React, jsxFactory: 'element' },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

test.each(sourceCases)('$name', async (scenario) => {
  const filename = scenario.filename ?? 'fixture.ts';
  const first = await namespaceSource(scenario.code, filename, namespaceClasses);
  expect((await executeSource(first.code)).result).toStrictEqual(scenario.expected);
  const second = await namespaceSource(first.code, filename, namespaceClasses);
  expect((await executeSource(second.code)).result).toStrictEqual(scenario.expected);
});

test('source map points unchanged code after edits to its original location', async () => {
  const code = `// keep this comment\nexport const before = 'hidden';\nexport const classes = { className: 'px-8 py-4' };\nexport const after = 42;`;
  const result = await namespaceSource(code, '/src/fixture.ts', namespaceClasses);
  const offset = result.code.indexOf('after =');
  const prefix = result.code.slice(0, offset).split('\n');
  const original = originalPositionFor(new TraceMap(result.map.toString()), {
    line: prefix.length,
    column: prefix[prefix.length - 1].length,
  });
  expect(original.source).toMatch(/fixture\.ts$/);
  expect(original.line).toBe(4);
  expect(original.column).toBe(13);
  expect(result.code).toMatch(/keep this comment/);
  expect(result.map.sourcesContent).toContain(code);
});

test('preserves unmodified source formatting and skips files without class edits', async () => {
  const code =
    "/* comment */\nconst untouched={display:'flex'};\nexport const result = { className: 'px-8' }; // trailing\n";
  const result = await namespaceSource(code, 'fixture.ts', namespaceClasses);
  expect(result.code.startsWith("/* comment */\nconst untouched={display:'flex'};\n")).toBeTruthy();
  expect(result.code.endsWith(' // trailing\n')).toBeTruthy();
  const unchanged = "// comment\nexport const result={title:'hidden',display:'flex'};\n";
  expect((await namespaceSource(unchanged, 'fixture.ts', namespaceClasses)).code).toBe(unchanged);
});

test('source map maps changed class values back to the original literal', async () => {
  const code = "export const result = { className: 'px-8' };";
  const result = await namespaceSource(code, 'fixture.ts', namespaceClasses);
  const column = result.code.indexOf('fixture__px-8');
  const position = originalPositionFor(new TraceMap(result.map.toString()), { line: 1, column });
  expect(position.line).toBe(1);
  expect(position.column).toBeGreaterThanOrEqual(code.indexOf("'px-8'"));
  expect(position.column).toBeLessThanOrEqual(code.indexOf("'px-8'") + 1);
});
