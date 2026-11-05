import { createTailwindClassNameUtil } from './cn';
import { regex } from './regex';
import { createTailwindVariantsUtil } from './tv';

interface Options {
  prefix: string;
}

export const createTailwindUtils = ({ prefix }: Options) => {
  if (!regex.tailwindPrefixOption.test(prefix)) {
    throw new Error(
      '[@interior/tailwind] Prefix must be a lowercase name, optionally separated by single hyphens.',
    );
  }

  const appPrefix = `${prefix}__`;

  return { cn: createTailwindClassNameUtil(appPrefix), tv: createTailwindVariantsUtil(appPrefix) };
};
