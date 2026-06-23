import type { TV } from 'tailwind-variants';

import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { tv as tvBase } from 'tailwind-variants';

export const mergeConfig = {
  classGroups: {
    'font-size': ['text-tiny', 'text-13', 'text-15', 'text-17'],
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
