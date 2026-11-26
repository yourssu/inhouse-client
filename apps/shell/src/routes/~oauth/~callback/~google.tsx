import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod/v4';

const GoogleOAuthPending = () => (
  <div
    className="text-neutralMuted flex size-full flex-col items-center justify-center gap-3 font-medium"
    role="status"
  >
    <div
      aria-hidden
      className="size-6 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:animate-pulse"
    />
    로그인 중이에요
  </div>
);

export const Route = createFileRoute('/oauth/callback/google')({
  validateSearch: z.object({
    code: z.string().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    if (!search.code) {
      throw redirect({ to: '/signin', replace: true });
    }

    try {
      await context.auth.login(search.code);
    } catch {
      throw redirect({ to: '/signin', replace: true });
    }
    throw redirect({ to: '/', replace: true });
  },
  pendingMs: 0,
  pendingComponent: GoogleOAuthPending,
});
