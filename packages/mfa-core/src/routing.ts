import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * path 가 실제로 바뀐 navigation 에서만 unmountAll 을 호출해요. search param 만 바뀌는
 * navigation(예: 목록 필터)은 pathChanged 가드로 제외해요. remote 의 grafted 진입 레이아웃
 * (예: `~_auth/~recruit/~route.tsx`) 에서 그 remote 로컬 overlay-kit 의 `unmountAll` 을
 * 넘겨 호출해요.
 */
export const useUnmountOverlaysOnRouteChange = (unmountAll: () => void): void => {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe('onResolved', ({ pathChanged }) => {
        if (pathChanged) {
          unmountAll();
        }
      }),
    [router, unmountAll],
  );
};
