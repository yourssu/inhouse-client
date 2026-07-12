export const pluginQueryKey = (pluginName: string) => {
  const base = [pluginName] as const;
  return {
    base,
    /** `(parts) => [pluginName, ...parts]` 형태의 namespaced key 를 만들어요. */
    for: (...parts: readonly unknown[]) => [pluginName, ...parts] as const,
  };
};
