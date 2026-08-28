import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import {
  getCurrentSemester,
  getMember,
  getMembers,
  type GetMembersParams,
  getParts,
  getSemesters,
} from '@/apis/members';

const qk = createQueryKeyNamespace('member');

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
