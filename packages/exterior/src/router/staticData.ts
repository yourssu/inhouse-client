import { useMatches } from '@tanstack/react-router';

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    shellOptions?: {
      collapsible?: boolean;
    };
  }
}

/** 현재 라우트 트리에서 가장 가까운(leaf 방향) 정의된 shellOptions.collapsible 값을 반환. 기본 false. */
export const useCollapsible = (): boolean => {
  const matches = useMatches();

  for (let i = matches.length - 1; i >= 0; i--) {
    const collapsible = matches[i]?.staticData?.shellOptions?.collapsible;
    if (collapsible !== undefined) {
      return collapsible;
    }
  }

  return false;
};
