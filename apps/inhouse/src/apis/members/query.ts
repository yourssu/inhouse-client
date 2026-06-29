import { createQueryKeys } from '@lukemorales/query-key-factory';
import { queryOptions } from '@tanstack/react-query';

import {
  getCurrentSemester,
  getMember,
  getMembers,
  type GetMembersParams,
  getParts,
  getSemesters,
} from '@/apis/members';

export const membersKeys = createQueryKeys('members', {
  parts: () => ({
    queryKey: ['parts'],
    queryFn: getParts,
  }),
  semesters: () => ({
    queryKey: ['semesters'],
    queryFn: getSemesters,
  }),
  currentSemester: () => ({
    queryKey: ['currentSemester'],
    queryFn: getCurrentSemester,
  }),
  list: (params?: GetMembersParams) => ({
    queryKey: [params],
    queryFn: () => getMembers(params),
  }),
  detail: (memberId: number) => ({
    queryKey: [memberId],
    queryFn: () => getMember(memberId),
  }),
});

export const membersQueries = {
  parts: () =>
    queryOptions({
      queryKey: membersKeys.parts().queryKey,
      queryFn: membersKeys.parts().queryFn,
      staleTime: Infinity,
    }),
  semesters: () =>
    queryOptions({
      queryKey: membersKeys.semesters().queryKey,
      queryFn: membersKeys.semesters().queryFn,
      staleTime: Infinity,
    }),
  currentSemester: () =>
    queryOptions({
      queryKey: membersKeys.currentSemester().queryKey,
      queryFn: membersKeys.currentSemester().queryFn,
      staleTime: Infinity,
    }),
  list: (params?: GetMembersParams) =>
    queryOptions({
      queryKey: membersKeys.list(params).queryKey,
      queryFn: membersKeys.list(params).queryFn,
      staleTime: 1000 * 60 * 5,
    }),
  detail: (memberId: number) =>
    queryOptions({
      queryKey: membersKeys.detail(memberId).queryKey,
      queryFn: membersKeys.detail(memberId).queryFn,
      staleTime: 1000 * 60 * 5,
    }),
};
