import type { TV } from 'tailwind-variants';

import { objectEntries } from '@inhouse/utils/object';
import { tv } from 'tailwind-variants';

import { createTailwindMergeWithPrefix, mergeConfig } from './merge';

// https://www.tailwind-variants.org/docs/config#advanced-custom-tv-wrapper
const baseTv: TV = (variants, config) => {
  return tv(variants, {
    ...config,
    twMergeConfig: {
      ...config?.twMergeConfig,
      classGroups: {
        ...config?.twMergeConfig?.classGroups,
        ...mergeConfig.classGroups,
      },
    },
  });
};

export const createTailwindVariantsUtil = (appPrefix: string) => {
  // NOTE: tailwind-variants 3.3.1의 twMerge가 experimentalParseClassName 옵션을 무시해서 내부 merger를 직접 넣어줘요.
  return new Proxy(baseTv, {
    apply(target, _receiver, args: Parameters<TV>) {
      const [variants, config] = args;
      const variantResult = target(variants, { ...config, twMerge: false });

      if (config?.twMerge === false) {
        return variantResult;
      }

      const merge = createTailwindMergeWithPrefix(appPrefix, {
        override: config?.twMergeConfig?.override,
        extend: {
          ...config?.twMergeConfig,
          ...config?.twMergeConfig?.extend,
          classGroups: {
            ...config?.twMergeConfig?.classGroups,
            ...config?.twMergeConfig?.extend?.classGroups,
            ...mergeConfig.classGroups,
          },
        },
      });

      return new Proxy(variantResult, {
        apply(t, r, a) {
          const value: unknown = Reflect.apply(t, r, a);

          if (typeof value === 'string') {
            return merge(value);
          }
          if (typeof value !== 'object' || value === null) {
            return value;
          }

          return Object.fromEntries(
            objectEntries(value).map(([slot, slotFn]) => [
              slot,
              typeof slotFn === 'function'
                ? new Proxy(slotFn, {
                    apply(slotTarget, slotReceiver, slotArgs) {
                      const classes = Reflect.apply(slotTarget, slotReceiver, slotArgs);
                      return typeof classes === 'string' ? merge(classes) : classes;
                    },
                  })
                : slotFn,
            ]),
          );
        },
      });
    },
  });
};
