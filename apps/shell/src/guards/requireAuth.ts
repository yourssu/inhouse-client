import { redirect } from '@tanstack/react-router';
import { getAuthTokens, removeAuthTokens } from '@yourssu-inhouse/auth';

/**
 * TanStack Router 의 `beforeLoad` 에서 쓰는 인증 가드예요.
 * 토큰이 없으면 `/signin` 으로 리다이렉트해요.
 *
 * React context 없이 cookie 저장소에서 직접 토큰을 읽어요 —
 * 로더에서 context plumbing 이 필요 없고, Module Federation(host/remote) 경계에서도 안전해요.
 *
 * shell 전용 가드예요. `/signin` 은 shell 라우트라 typed redirect 를 shell 에서 걸어요.
 * 공용 auth 패키지에 두면 각 remote 의 routeTree(scouter/member 에는 `/signin` 없음)로
 * 컴파일되는 시점에 `to: '/signin'` literal 이 cross-Register 오류를 일으켜요.
 */
export const requireAuth = () => async (): Promise<void> => {
  if (getAuthTokens()) {
    return;
  }
  removeAuthTokens();
  throw redirect({ to: '/signin' });
};
