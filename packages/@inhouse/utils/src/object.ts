import type { ValueOf } from '@yourssu-inhouse/inhouse-utils/type';

export const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof T>;
export const objectValues = <T extends object>(obj: T) => Object.values(obj) as Array<ValueOf<T>>;
export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
