import { isEqual, isNil } from 'es-toolkit';

import type { ValueOf } from '@/types/misc';

export const hasNilValue = (val: unknown): boolean => {
  if (isNil(val)) {
    return true;
  }
  if (typeof val === 'object' && val !== null) {
    return Object.values(val).some(hasNilValue);
  }
  return false;
};

export const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof T>;
export const objectValues = <T extends object>(obj: T) => Object.values(obj) as Array<ValueOf<T>>;
export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

export const getDiffOf = <T extends object>(a: T, b: object) => {
  const diff: Partial<T> = {};
  objectKeys(a).forEach((key) => {
    const bothHasKey = Object.hasOwn(a, key) && Object.hasOwn(b, key);
    const isDifferent = !isEqual(a[key], b[key as keyof typeof b]);
    if (bothHasKey && isDifferent) {
      diff[key] = a[key];
    }
  });
  return diff;
};
