import { objectKeys } from '@inhouse/utils/object';
import { vars } from '@interior/vars';
import { extendTailwindMerge } from 'tailwind-merge';

import { regex } from './regex';

const toClassGroup = (keys: ReadonlyArray<number | string>, prefix: string) =>
  keys.map((key) => `${prefix}-${key}`);

export const mergeConfig = {
  classGroups: {
    'font-size': toClassGroup(objectKeys(vars.typography.fontSize), 'text'),
    leading: toClassGroup(objectKeys(vars.typography.lineHeight), 'leading'),
    rounded: toClassGroup(objectKeys(vars.radius), 'rounded'),
    h: toClassGroup(objectKeys(vars.uniformHeight), 'h'),
    z: toClassGroup(objectKeys(vars.zIndex), 'z'),
  },
};

type Config = Parameters<typeof extendTailwindMerge>[0];

export const createTailwindMergeWithPrefix = (appPrefix: string, config: Config = {}) => {
  return extendTailwindMerge({
    ...config,
    experimentalParseClassName: ({ className, parseClassName }) => {
      const utility = className.startsWith(appPrefix)
        ? className.slice(appPrefix.length)
        : className.replace(regex.tailwindAppPrefix, '');
      return parseClassName(utility);
    },
  });
};
