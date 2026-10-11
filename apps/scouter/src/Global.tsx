import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { subscribeScouterAnalytics } from '@/analytics/client';

export const Global = () => {
  const router = useRouter();
  useEffect(() => subscribeScouterAnalytics(router), [router]);
  return null;
};
