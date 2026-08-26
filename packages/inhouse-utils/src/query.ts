export const createQueryKeyNamespace = (namespace: string) => ({
  base: [namespace] as const,
  for: (...parts: readonly unknown[]) => [namespace, ...parts] as const,
});
