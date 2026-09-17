import { isKyHTTPError } from '@yourssu-inhouse/inhouse-utils/ky';
import ky, { type KyInstance } from 'ky';

import { refreshToken } from './endpoints';
import { type AuthErrorCode, authErrorCodeMap } from './errorCodes';
import { type AuthTokenType } from './schema';

export interface AuthApiClient {
  /** 인증 토큰을 주입하고 갱신/재시도를 처리하는 클라이언트예요. */
  api: KyInstance;
  /** 인증 토큰이 필요없는 상황에서 사용해요. */
  nativeApi: KyInstance;
}

interface CreateAuthApiClientOptions {
  apiBaseURL: string;
  errorCodes?: typeof authErrorCodeMap;
  getTokens: () => AuthTokenType | undefined;
  /**
   * 인증 실패(토큰 없음/갱신 실패) 시 호출돼요.
   * 기본 동작은 `/signin` 으로 하드 리다이렉트예요. 라우터 인스턴스를 쓰는 등 앱에서 오버라이드할 수 있어요.
   */
  onUnauthorized?: () => void;
  removeTokens: () => void;
  setTokens: (tokens: AuthTokenType) => void;
}

export const createAuthApiClient = (options: CreateAuthApiClientOptions): AuthApiClient => {
  const {
    apiBaseURL,
    getTokens,
    setTokens,
    removeTokens,
    onUnauthorized,
    errorCodes = authErrorCodeMap,
  } = options;

  const handleUnauthorized = () => {
    if (onUnauthorized) {
      onUnauthorized();
      return;
    }
    window.location.href = '/signin';
  };

  /*
    API 토큰이 필요없는 상황에서 사용해요.
  */
  const nativeApi = ky.create({
    prefix: apiBaseURL,
    retry: {
      methods: ['get', 'post', 'put', 'delete'],
      statusCodes: [400, 401, 403],
      limit: 3,
    },
  });

  const api = nativeApi.extend({
    hooks: {
      beforeRequest: [
        ({ request }) => {
          const authTokens = getTokens();
          if (authTokens) {
            request.headers.set('Authorization', `Bearer ${authTokens.accessToken}`);
            request.headers.set('Content-Type', 'application/json');
          }
        },
      ],
      beforeRetry: [
        async ({ request, error: unknownError }) => {
          if (!isKyHTTPError(unknownError)) {
            return;
          }

          const { response } = unknownError;
          if (response.status !== 400 && response.status !== 401 && response.status !== 403) {
            return;
          }

          // 1. 토큰 자체가 없는 경우
          const authTokens = getTokens();
          if (!authTokens) {
            removeTokens();
            handleUnauthorized();
            return;
          }

          // 2. 유효하지 않은 토큰의 경우
          // - reconsentRequired는 정책상 유저 피드백이 필요하므로 /signin 페이지로 떨구지 않아요.
          // - auth001 에러의 경우는 토큰 리프레싱을 시도해요.
          // ky 2.0+는 HTTPError 생성 시 response body를 미리 읽어 error.data에 파싱해둬요.
          // 따라서 response.json()/clone()은 모두 "body already used"로 실패하고,
          // 대신 error.data를 써야 해요.
          const errorCode = (unknownError.data as undefined | { errorCode?: AuthErrorCode })
            ?.errorCode;
          if (errorCode === errorCodes.reconsentRequired) {
            throw Error(errorCodes.reconsentRequired);
          }
          if (
            errorCode &&
            errorCode !== 'Auth-001' &&
            Object.values(errorCodes).includes(errorCode)
          ) {
            removeTokens();
            handleUnauthorized();
            return;
          }

          // 3. 이상이 없다면 토큰 갱신을 시도해요.
          try {
            const newTokens = await refreshToken(nativeApi, authTokens.refreshToken);
            setTokens(newTokens);
            // ky는 재시도 시 beforeRequest 훅을 다시 실행하지 않아요. 갱신된 토큰을
            // 재시도 요청 헤더에 직접 반영하지 않으면 첫 요청의 (만료/변조된) 토큰이
            // 그대로 재사용돼 다시 401이 떠요.
            request.headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
            request.headers.set('Content-Type', 'application/json');
          } catch (e: unknown) {
            // 3-a. 만약 토큰 갱신에 실패했다면 로그아웃해요.
            if (isKyHTTPError(e) && e.response.status === 401) {
              removeTokens();
              handleUnauthorized();
            }
          }
        },
      ],
    },
  });

  return { nativeApi, api };
};
