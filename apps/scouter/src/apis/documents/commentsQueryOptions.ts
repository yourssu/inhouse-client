import type { QueryKey } from '@tanstack/react-query';

import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

const qk = createQueryKeyNamespace('scouter');

export const commentsQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'documents', 'comments');

// 생성된 조회와 기존 캐시 무효화에 같은 키 정책을 적용합니다.
export const commentQueryOptions = <T extends object>(
  options: T,
  { applicantId }: { applicantId: number },
): T & { queryKey: QueryKey } => ({ ...options, queryKey: commentsQueryKey(applicantId) });
