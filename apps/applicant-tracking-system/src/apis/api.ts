import {
  createAuthApiClient,
  getAuthTokens,
  removeAuthTokens,
  setAuthTokens,
} from '@yourssu-inhouse/auth';

import { config } from '@/config';

/*
  ATS 의 인증/비즈니스 API 클라이언트예요.
  인증 로직(토큰 주입·갱신·재시도·errorCode 처리)은 @yourssu-inhouse/auth 팩토리가 책임져요.
  이 모듈은 앱 전역에서 재사용하는 클라이언트 싱글톤을 노출해요.
*/
export const { api, nativeApi } = createAuthApiClient({
  apiBaseURL: config.apiBaseURL,
  getTokens: getAuthTokens,
  removeTokens: removeAuthTokens,
  setTokens: setAuthTokens,
  onUnauthorized: () => {
    // pre-MF standalone 에서는 하드 리다이렉트가 안전해요. MF(#5)에서 라우터 기반으로 정제해요.
    window.location.href = '/signin';
  },
});
