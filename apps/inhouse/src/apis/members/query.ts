import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getCurrentSemester,
  getMember,
  getMembers,
  type GetMembersParams,
  getParts,
  getSemesters,
} from '@/apis/members';

/*
  inhouse 의 모든 query key 는 pluginQueryKey('inhouse') 로 namespace 돼요. shell 이 하나의
  QueryClient 를 여러 plugin 이 공유하므로, plugin name prefix 가 없으면 다른 plugin(예: scouter
  의 members 도메인) 의 cache 와 충돌할 수 있어요. 플랫폼이 namespace 규칙을 강제해요.
*/
const qk = pluginQueryKey('inhouse');

export const membersQueries = {
  parts: () =>
    queryOptions({
      queryKey: qk.for('members', 'parts'),
      queryFn: getParts,
      staleTime: Infinity,
    }),
  semesters: () =>
    queryOptions({
      queryKey: qk.for('members', 'semesters'),
      queryFn: getSemesters,
      staleTime: Infinity,
    }),
  currentSemester: () =>
    queryOptions({
      queryKey: qk.for('members', 'currentSemester'),
      queryFn: getCurrentSemester,
      staleTime: Infinity,
    }),
  list: (params?: GetMembersParams) =>
    queryOptions({
      queryKey: qk.for('members', 'list', params),
      queryFn: () => getMembers(params),
      staleTime: 1000 * 60 * 5,
    }),
  detail: (memberId: number) =>
    queryOptions({
      queryKey: qk.for('members', 'detail', memberId),
      queryFn: () => getMember(memberId),
      staleTime: 1000 * 60 * 5,
    }),
};
