import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@yourssu-inhouse/auth';
import { useToast } from '@yourssu-inhouse/interior';
import { useEffect, useRef } from 'react';
import { z } from 'zod/v4';

const GoogleOAuthCallback = () => {
  const { code } = Route.useRouteContext();
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isAuthorizationCodeUsedRef = useRef(false);

  useEffect(() => {
    // 인가 코드는 일회용이라 StrictMode의 Effect 재실행에서도 한 번만 교환해요.
    if (isAuthorizationCodeUsedRef.current) {
      return;
    }
    isAuthorizationCodeUsedRef.current = true;

    login(code)
      .then(() => {
        navigate({ to: '/', replace: true });
      })
      .catch(() => {
        toast.error('로그인하지 못했어요. 다시 시도해주세요.');
        navigate({ to: '/signin', replace: true });
      });
  }, [code, login, navigate, toast]);

  return (
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
};

export const Route = createFileRoute('/oauth/callback/google')({
  validateSearch: z.object({
    code: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.code) {
      throw redirect({ to: '/signin', replace: true });
    }
    return { code: search.code };
  },
  component: GoogleOAuthCallback,
});
