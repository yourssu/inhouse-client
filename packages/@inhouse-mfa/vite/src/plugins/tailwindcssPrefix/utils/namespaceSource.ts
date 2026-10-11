import MagicString from 'magic-string';

import type { ClassValuePath } from './classContextAdapters';

import { collectClassReferences } from './collectClassReferences.ts';

export const namespaceSource = async (
  code: string,
  filename: string,
  mapClassList: (value: string) => string,
  resolveValue?: (path: ClassValuePath) => Promise<string | undefined>,
) => {
  const output = new MagicString(code);

  for (const reference of await collectClassReferences(code, filename, resolveValue)) {
    const value = mapClassList(reference.value);

    if (value !== reference.value) {
      output.update(reference.start, reference.end, reference.serialize(value));
    }
  }

  return {
    code: output.toString(),
    map: output.generateMap({ source: filename, includeContent: true, hires: true }),
  };
};
