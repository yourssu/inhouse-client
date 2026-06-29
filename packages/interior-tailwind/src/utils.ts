import type { TV } from 'tailwind-variants';

import { objectKeys } from '@yourssu-inhouse/inhouse-utils/object';
import { vars } from '@yourssu-inhouse/interior-vars';
import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { tv as tvBase } from 'tailwind-variants';

const toClassGroup = (keys: ReadonlyArray<number | string>, prefix: string) =>
  keys.map((key) => `${prefix}-${key}`);

const mergeConfig = {
  classGroups: {
    'font-size': toClassGroup(objectKeys(vars.typography.fontSize), 'text'),
    leading: toClassGroup(objectKeys(vars.typography.lineHeight), 'leading'),
    rounded: toClassGroup(objectKeys(vars.radius), 'rounded'),
    h: toClassGroup(objectKeys(vars.uniformHeight), 'h'),
    z: toClassGroup(objectKeys(vars.zIndex), 'z'),
  },
};

// https://www.tailwind-variants.org/docs/config#advanced-custom-tv-wrapper
export const tv: TV = (options, config) =>
  tvBase(options, {
    ...config,
    twMerge: config?.twMerge ?? true,
    twMergeConfig: {
      ...config?.twMergeConfig,
      classGroups: {
        ...config?.twMergeConfig?.classGroups,
        ...mergeConfig.classGroups,
      },
    },
  });

/**
 * DOM 클래스 이름들을 받아서,
 * - 중복 클래스 이름을 제거해요.
 * - 조건부 클래스 이름을 처리해요.
 * - `twMerge` 함수 대신 사용해주세요.
 */
export const cn = (...v: ClassValue[]) => {
  const customMerger = extendTailwindMerge({
    extend: mergeConfig,
  });
  return customMerger(clsx(v));
};
