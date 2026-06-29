import { queryOptions } from '@tanstack/react-query';

import {
  getActiveMembers,
  getCompletedMembers,
  getGraduatedMembers,
  getInactiveMembers,
  getMe,
  type GetMembersParams,
  getWithdrawnMembers,
} from '@/apis/members';

type MembersOptionParams = GetMembersParams;

export const meOption = () => {
  const queryKey = ['members', 'me'];

  return queryOptions({
    queryKey,
    queryFn: getMe,
  });
};

export const activeMembersOption = ({ ...params }: MembersOptionParams = {}) => {
  const queryKey = ['members', 'active', params];

  return queryOptions({
    queryKey,
    queryFn: () => getActiveMembers(params),
  });
};

export const inactiveMembersOption = ({ ...params }: MembersOptionParams = {}) => {
  const queryKey = ['members', 'inactive', params];

  return queryOptions({
    queryKey,
    queryFn: () => getInactiveMembers(params),
  });
};

export const graduatedMembersOption = ({ ...params }: MembersOptionParams = {}) => {
  const queryKey = ['members', 'graduated', params];

  return queryOptions({
    queryKey,
    queryFn: () => getGraduatedMembers(params),
  });
};

export const completedMembersOption = ({ ...params }: MembersOptionParams = {}) => {
  const queryKey = ['members', 'completed', params];

  return queryOptions({
    queryKey,
    queryFn: () => getCompletedMembers(params),
  });
};

export const withdrawnMembersOption = ({ ...params }: MembersOptionParams = {}) => {
  const queryKey = ['members', 'withdrawn', params];

  return queryOptions({
    queryKey,
    queryFn: () => getWithdrawnMembers(params),
  });
};
