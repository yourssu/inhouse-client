import { assert } from 'es-toolkit';

export function assertNonNullish<T>(
  value: null | T | undefined,
  error: string = '값이 비어 있어요.',
): asserts value is NonNullable<T> {
  assert(value !== null && value !== undefined, error);
}
