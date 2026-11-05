import { expect, test } from 'vitest';

import { collectClassReferences } from './collectClassReferences';

test('context adapters collect class references without mapping shared values or recipe conditions', async () => {
  const code = `
const display = 'flex';
const status = 'hidden';
const props = { className: status === 'hidden' ? display : 'block', style: { display }, title: 'px-8' };
const recipe = tv({ base: 'py-4', variants: { status: { hidden: 'hidden' } }, defaultVariants: { status: 'hidden' } });
`;
  const references = await collectClassReferences(code, 'fixture.ts');
  expect(references.map(({ value }) => value)).toStrictEqual(['flex', 'block', 'py-4', 'hidden']);
  expect(code.slice(references[0].start, references[0].end)).toBe('display');
});
