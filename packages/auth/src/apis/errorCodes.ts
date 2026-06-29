export const authErrorCodeMap = {
  reconsentRequired: 'GOOGLE_OAUTH_RECONSENT_REQUIRED', // 스코프 부족 시 발생 (403)
  /*
    토큰이 유효하지 않을 떄 발생 (401)
    - 액세스/리프레시 토큰이 아닌 경우 발생
    - 토큰이 유효하지 않을 떄 발생
    - 로그아웃된 경우 발생
  */
  auth001: 'Auth-001',
  auth003: 'Auth-003', // 로그인 없이 요청시 발생 (401)
  auth004: 'Auth-004', // 토큰 자체가 없는데 요청할 때 발생 (401)
  refreshFailed: 'OAuth-Token-Refresh-Fail', // 토큰 갱신에 실패한 경우 (401)
} as const;

export type AuthErrorCode = (typeof authErrorCodeMap)[keyof typeof authErrorCodeMap];
