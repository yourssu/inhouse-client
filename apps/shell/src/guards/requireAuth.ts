import { getAuthTokens, validateToken } from '@inhouse/auth';
import { isKyHTTPError } from '@inhouse/utils/ky';

import { authClient } from '@/apis/authClient';

const isUnexpectedAuthRejection = (error: unknown) =>
  !isKyHTTPError(error) || error.response.status !== 401;

const validateSession = async () => {
  const { api, refreshSession } = authClient;

  try {
    const { validated } = await validateToken(api);
    if (validated) {
      return true;
    }
  } catch (e: unknown) {
    if (isUnexpectedAuthRejection(e)) {
      throw e;
    }
  }

  try {
    const token = await refreshSession();
    if (token) {
      return true;
    }
  } catch (e: unknown) {
    if (isUnexpectedAuthRejection(e)) {
      throw e;
    }
  }

  return false;
};

let validationPromise: Promise<boolean> | undefined;

export const requireAuth = async (): Promise<boolean> => {
  if (!getAuthTokens()) {
    validationPromise = undefined;
    return false;
  }

  // NOTE: beforeLoad는 라우트 이동마다 실행되므로 최초 성공한 검증 결과를 재사용해요.
  try {
    const authenticated = await (validationPromise ??= validateSession());
    if (!authenticated) {
      validationPromise = undefined;
    }
    return authenticated;
  } catch (error) {
    validationPromise = undefined;
    throw error;
  }
};
