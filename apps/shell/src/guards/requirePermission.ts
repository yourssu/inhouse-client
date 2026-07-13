import { requireAuth } from './requireAuth';

/**
 * 권한 기반 가드 스캐폴드예요. 아직 권한 정의(/me 권한·JWT 클레임)가 정리되지 않아
 * 이번엔 인증 통과 후 통과시키고, 권한 체크는 확장점으로 남겨둬요.
 *
 * 사용 예:
 *   beforeLoad: requirePermission('members:write')
 *
 * Todo: 권한 출처가 정리되면 context.auth 의 권한 목록과 비교해 `/forbidden` 으로 보내요.
 */
export const requirePermission = (permission: string) => async (): Promise<void> => {
  await requireAuth()();
  void permission;
};
