import { isKyHTTPError } from '@inhouse/utils/ky';
import ky, { HTTPError, type KyInstance, type KyRequest } from 'ky';

import type { AuthTokenType } from '../apis/schema';

import { refreshToken } from '../apis/token';
import { getAuthTokens, removeAuthTokens, setAuthTokens } from '../storage/tokens';
import { authErrorCodeMap } from '../types/errorCodes';

const authRefreshAttemptedKey = '__inhouseAuthRefreshAttempted';

export interface AuthApiClient {
  /** 인증 토큰을 주입하고 갱신/재시도를 처리하는 클라이언트예요. */
  api: KyInstance;
  /** 인증 토큰이 필요없는 상황에서 사용해요. */
  nativeApi: KyInstance;
  /** 현재 세션의 토큰을 갱신하고 저장해요. */
  refreshSession: () => Promise<AuthTokenType | undefined>;
}

interface CreateAuthApiClientOptions {
  baseURL: string;
  errorCodes?: typeof authErrorCodeMap;
}

export const createAuthApiClient = (options: CreateAuthApiClientOptions): AuthApiClient => {
  const { baseURL, errorCodes = authErrorCodeMap } = options;

  const setRequestHeaders = (req: KyRequest) => {
    const authTokens = getAuthTokens();
    if (authTokens) {
      req.headers.set('Authorization', `Bearer ${authTokens.accessToken}`);
      req.headers.set('Content-Type', 'application/json');
    }
  };

  // NOTE: API 토큰이 필요없는 상황에서 사용해요.
  const nativeApi = ky.create({
    prefix: baseURL,
    retry: { limit: 0 },
  });

  const api = nativeApi.extend({
    retry: {
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      statusCodes: [401, 403],
      limit: 3,
    },
    hooks: {
      beforeRequest: [
        ({ request }) => {
          setRequestHeaders(request);
        },
      ],
      beforeRetry: [
        async ({ request, options, error: e }) => {
          /**
            인증 토큰이 쿠키에 저장되어 있는지 여부를 보장해줘요.
            만약 없다면 로그인 페이지로 떨굽니다.
          */
          const ensureAuthTokens = () => {
            const t = getAuthTokens();
            if (!t) {
              removeAuthTokens();
              window.location.href = '/signin';
              throw e;
            }
            return t;
          };

          /**
            NOTE: ky 2.0+는 HTTPError 생성 시 response body를 미리 읽어 error.data에 파싱해둬요.
            이 error.data를 사용하지 않으면 다음 retry에서 stream body 재접근으로 오류가 발생해요.
          */
          const ensureErrorCode = (e: HTTPError) => {
            const code = (e.data as undefined | { errorCode?: string })?.errorCode;
            if (code == null) {
              throw e;
            }
            return code;
          };

          /**
            Google OAuth 스코프 부족으로 인한 예외 상황이 없도록 보장해줘요.
            - 403 reconsentRequired는 정책상 유저 피드백이 필요하므로 /signin 페이지로 떨구지 않도록 해요.
          */
          const assertGoogleScopeConsented = (errorCode: string) => {
            if (errorCode !== errorCodes.reconsentRequired) {
              return;
            }
            throw Error(errorCodes.reconsentRequired);
          };

          /**
            현재 에러가 401임을 보장해줘요.
          */
          const assert401 = (e: HTTPError) => {
            if (e.response.status === 401) {
              return;
            }
            throw e;
          };

          /**
            토큰 갱신이 필요한 상황임을 보장해줘요.
          */
          const assertNeedTokenRefresh = (errorCode: string) => {
            const parseTokenErrorState = () => {
              if (errorCode === errorCodes.auth001) {
                return '토큰_갱신_필요';
              }
              if (
                errorCode === errorCodes.auth003 ||
                errorCode === errorCodes.auth004 ||
                errorCode === errorCodes.refreshFailed
              ) {
                return '재로그인_필요';
              }
              return '알수없는_에러코드';
            };

            const state = parseTokenErrorState();

            if (state === '재로그인_필요') {
              removeAuthTokens();
              window.location.href = '/signin';
              throw e;
            }
            if (state === '알수없는_에러코드') {
              throw e;
            }
          };

          if (!isKyHTTPError(e)) {
            return;
          }

          const authTokens = ensureAuthTokens();
          const errorCode = ensureErrorCode(e);

          assertGoogleScopeConsented(errorCode);
          assert401(e);
          assertNeedTokenRefresh(errorCode);

          const isAlreadyRefreshed = options.context[authRefreshAttemptedKey];
          const isSameTokenInCookie =
            request.headers.get('Authorization') === `Bearer ${authTokens.accessToken}`;

          if (isAlreadyRefreshed) {
            if (isSameTokenInCookie) {
              removeAuthTokens();
              window.location.href = '/signin';
            }
            throw e;
          }

          const retryTokens = isSameTokenInCookie ? await refreshSession() : authTokens;
          if (!retryTokens) {
            window.location.href = '/signin';
            throw e;
          }

          // NOTE: ky는 재시도 시 beforeRequest 훅을 다시 실행하지 않아서 직접 헤더를 수정해줘요.
          setRequestHeaders(request);
          options.context[authRefreshAttemptedKey] = true;
        },
      ],
    },
  });

  let refreshPromise: Promise<AuthTokenType | undefined> | undefined;

  /**
    현재 세션의 인증 토큰들을 갱신해요. 병렬 요청에서의 토큰 갱신의 race condition을 고려합니다.
    - 갱신에 성공하면 쿠키에 갱신된 값을 미리 채워주는 side-effect가 있어요. 갱신된 토큰 또한 반환합니다.
    - 만약 갱신에 실패했다면 undefined를 반환해요.
  */
  const refreshSession = () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    const tokensAtStart = getAuthTokens();
    if (!tokensAtStart) {
      return Promise.resolve(undefined);
    }

    const tryRefresh = async () => {
      try {
        return {
          success: true,
          tokens: await refreshToken(nativeApi, tokensAtStart.refreshToken),
        } as const;
      } catch (error: unknown) {
        return { success: false, error } as const;
      }
    };

    const isTokensChanged = (tokens: AuthTokenType | undefined) => {
      return (
        !tokens ||
        tokens.accessToken !== tokensAtStart.accessToken ||
        tokens.refreshToken !== tokensAtStart.refreshToken
      );
    };

    const refresh = async () => {
      const refreshResult = await tryRefresh();

      // NOTE: 응답을 기다리는 동안 로그아웃하거나 다른 세션으로 바뀌었다면 이전 결과를 버려요.
      const storedTokens = getAuthTokens();
      if (isTokensChanged(storedTokens)) {
        return storedTokens;
      }

      if (refreshResult.success) {
        const tokens = refreshResult.tokens;
        setAuthTokens(tokens);
        return tokens;
      }

      const { error } = refreshResult;
      if (isKyHTTPError(error) && error.response.status === 401) {
        removeAuthTokens();
        return undefined;
      }
      throw error;
    };

    refreshPromise = refresh().finally(() => {
      refreshPromise = undefined;
    });

    return refreshPromise;
  };

  return { nativeApi, api, refreshSession };
};
