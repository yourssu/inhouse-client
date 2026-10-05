import { expect, test } from 'vitest';

import { createClassMapper } from './createClassMapper';

test('maps source and CSS classes consistently across prefixes and preserves custom classes', () => {
  const candidates = new Set(['flex', 'group/item', 'md:hover:px-8', 'peer', 'px-8']);
  const shell = createClassMapper('shell', (value) => candidates.has(value));
  const member = createClassMapper('member', (value) => candidates.has(value));
  expect(
    shell.mapClassList('flex\tpx-8 md:hover:px-8 group/item peer custom-widget shell__px-8'),
  ).toBe(
    'shell__flex\tshell__px-8 shell__md:hover:px-8 shell__group/item shell__peer custom-widget shell__px-8',
  );
  for (const candidate of candidates) {
    expect(shell.mapClassName(candidate)).toBe(`shell__${candidate}`);
    expect(shell.mapClassName(shell.mapClassName(candidate))).toBe(`shell__${candidate}`);
    expect(member.mapClassName(candidate)).toBe(`member__${candidate}`);
  }
});

test('preserves distinct arbitrary escapes and utility names matching object prototype properties', () => {
  const candidates = [String.raw`content-['a\b']`, "content-['ab']", 'constructor', '__proto__'];
  const mapper = createClassMapper('fixture', (value) => candidates.includes(value));
  for (const candidate of candidates) {
    expect(mapper.mapClassName(candidate)).toBe(`fixture__${candidate}`);
    expect(mapper.mapClassName(candidate)).toBe(`fixture__${candidate}`);
  }
});

test('caches candidate classification and lets a fresh mapper reflect stylesheet changes', () => {
  const checked: string[] = [];
  const mapper = createClassMapper('fixture', (value) => {
    checked.push(value);
    return value === 'flex';
  });
  mapper.mapClassList('flex flex custom-widget custom-widget fixture__flex');
  expect(checked).toStrictEqual(['flex', 'custom-widget']);
  expect(mapper.mapClassName('custom-widget')).toBe('custom-widget');
  expect(createClassMapper('fixture', () => true).mapClassName('custom-widget')).toBe(
    'fixture__custom-widget',
  );
});
