import type { PropsWithChildren } from 'react';

import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { subscribeScouterAnalytics } from '@/analytics/client';

export { bootstrapScouterAnalytics as bootstrap } from '@/analytics/client';

export const GlobalComponent = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  useEffect(() => {
    return subscribeScouterAnalytics(router);
  }, [router]);

  return children;
};
