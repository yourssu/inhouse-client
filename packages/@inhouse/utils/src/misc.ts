import type { GetFieldTypeStrictly, Mutable, Prettify } from '@yourssu-inhouse/inhouse-utils/type';

import { get } from 'es-toolkit/compat';

export const getIn = <TObject, TPath extends string = string>(
  object: TObject,
  path: TPath,
): GetFieldTypeStrictly<TObject, TPath> => {
  return get(object, path as string);
};

export function mutable<T>(v: T) {
  return v as Prettify<Mutable<T>>;
}
