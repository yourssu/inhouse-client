import { createFileRoute } from '@tanstack/react-router';

import { tabs, type TabType } from '@/type';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { tab: TabType } => {
    return {
      tab: tabs.includes(search?.tab as any) ? (search.tab as TabType) : 'Lottie',
    };
  },
});
