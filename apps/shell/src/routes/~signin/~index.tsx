import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/signin/')({
  head: () => ({
    meta: [{ title: '유어슈 인하우스 | 로그인' }],
  }),
});
