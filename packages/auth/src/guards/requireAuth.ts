import { redirect } from '@tanstack/react-router';

import { getAuthTokens, removeAuthTokens } from '../storage/tokens';

/**
 * TanStack Router 의 `beforeLoad` 에서 쓰는 인증 가드예요.
 * 토큰이 없으면 `/signin` 으로 리다이렉트해요.
 *
 * React context 없이 cookie 저장소에서 직접 토큰을 읽어요 —
 * 로더에서 context plumbing 이 필요 없고, Module Federation(host/remote) 경계에서도 안전해요.
 */
export const requireAuth = () => async (): Promise<void> => {
  if (getAuthTokens()) {
    return;
  }
  removeAuthTokens();
  throw redirect({ to: '/signin' });
};
