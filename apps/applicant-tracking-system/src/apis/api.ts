import ky from 'ky';

import { refreshToken } from '@/apis/auth';
import { config } from '@/config';
import { authErrorCodeMap } from '@/types/auth';
import { getAuthTokens, removeAuthTokens, setAuthTokens } from '@/utils/auth';
import { handleError } from '@/utils/error';

type AuthErrorCode = (typeof authErrorCodeMap)[keyof typeof authErrorCodeMap];

/*
  API 토큰이 필요없는 상황에서 사용해요.
*/
export const nativeApi = ky.create({
  prefixUrl: config.apiBaseURL,
  retry: {
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [400, 401, 403],
    limit: 3,
  },
});

export const api = nativeApi.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        const authTokens = getAuthTokens();
        if (authTokens) {
          request.headers.set('Authorization', `Bearer ${authTokens.accessToken}`);
          request.headers.set('Content-Type', 'application/json');
        }
      },
    ],
    beforeRetry: [
      async ({ error: unknownError }) => {
        const throwToSigninPage = () => {
          removeAuthTokens();
          window.location.href = '/signin';
        };

        const { type, error } = handleError(unknownError);
        if (type !== 'KyHTTPError') {
          return;
        }

        const { response } = error;
        if (response.status !== 400 && response.status !== 401 && response.status !== 403) {
          return;
        }

        // 1. 토큰 자체가 없는 경우
        const authTokens = getAuthTokens();
        if (!authTokens) {
          throwToSigninPage();
          return;
        }

        // 2. 유효하지 않은 토큰의 경우
        // Todo: refresh token 이 유효한지 체크하는 로직 추가하기
        // - reconsentRequired는 정책상 유저 피드백이 필요하므로 /signin 페이지로 떨구지 않아요.
        // - auth001 에러의 경우는 토큰 리프레싱을 시도해요.
        const { errorCode } = await response.json<{ errorCode?: AuthErrorCode }>();
        if (errorCode === authErrorCodeMap.reconsentRequired) {
          throw Error(authErrorCodeMap.reconsentRequired);
        }
        if (
          errorCode &&
          errorCode !== 'Auth-001' &&
          Object.values(authErrorCodeMap).includes(errorCode)
        ) {
          throwToSigninPage();
          return;
        }

        // 3. 이상이 없다면 토큰 갱신을 시도해요.
        try {
          setAuthTokens(await refreshToken(authTokens.refreshToken));
        } catch (e: unknown) {
          // 3-a. 만약 토큰 갱신에 실패했다면 로그아웃해요.
          const { type, error } = handleError(e);
          if (type === 'KyHTTPError' && error.response.status === 401) {
            throwToSigninPage();
          }
        }
      },
    ],
  },
});
