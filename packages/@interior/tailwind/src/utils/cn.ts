import clsx, { type ClassValue } from 'clsx';

import { createTailwindMergeWithPrefix, mergeConfig } from './merge';

export const createTailwindClassNameUtil = (appPrefix: string) => {
  const merge = createTailwindMergeWithPrefix(appPrefix, { extend: mergeConfig });
  return (...v: ClassValue[]) => merge(clsx(v));
};
