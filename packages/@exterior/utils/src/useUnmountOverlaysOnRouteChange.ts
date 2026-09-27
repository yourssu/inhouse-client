import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

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
