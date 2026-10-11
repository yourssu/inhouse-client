import { ClassGenerator } from '@tailwindcss-mangle/shared';

export const createClassMapper = (prefix: string, isTailwindClass: (value: string) => boolean) => {
  const namespace = `${prefix}__`;
  const candidates = new Map<string, boolean>();

  // ClassGenerator removes backslashes from keys; encode them to preserve arbitrary values.
  const generator = new ClassGenerator({
    customGenerate: (key) => namespace + decodeURIComponent(key.slice('class:'.length)),
  });

  const mapClassName = (value: string): string => {
    if (value.startsWith(namespace)) {
      return value;
    }

    const valid = candidates.get(value) ?? isTailwindClass(value);
    candidates.set(value, valid);

    return valid ? generator.generateClassName(`class:${encodeURIComponent(value)}`).name : value;
  };

  return {
    mapClassName,
    mapClassList: (value: string) => value.replace(/\S+/g, mapClassName),
  };
};
