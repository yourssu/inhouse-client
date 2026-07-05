/*
  plugin 별 query key namespace helper. plugin 들이 같은 react-query QueryClient 를 공유하므로,
  각 plugin 이 자기 name 으로 key 를 namespace 하지 않으면 서로 cache 를 덮어쓸 수 있어요.
  플랫폼이 namespace 규칙을 강제해요.

  사용 예:
    const qk = pluginQueryKey('scouter');
    useQuery({ queryKey: qk(['recruits', listId]), ... })
*/
export const pluginQueryKey = (pluginName: string) => {
  const base = [pluginName] as const;
  return {
    base,
    /** `(parts) => [pluginName, ...parts]` 형태의 namespaced key 를 만들어요. */
    for: (...parts: readonly unknown[]) => [pluginName, ...parts] as const,
  };
};
