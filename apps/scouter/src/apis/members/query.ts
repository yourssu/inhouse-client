import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

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

const qk = pluginQueryKey('scouter');

export const meOption = () =>
  queryOptions({
    queryKey: qk.for('members', 'me'),
    queryFn: getMe,
  });

export const activeMembersOption = ({ ...params }: MembersOptionParams = {}) =>
  queryOptions({
    queryKey: qk.for('members', 'active', params),
    queryFn: () => getActiveMembers(params),
  });

export const inactiveMembersOption = ({ ...params }: MembersOptionParams = {}) =>
  queryOptions({
    queryKey: qk.for('members', 'inactive', params),
    queryFn: () => getInactiveMembers(params),
  });

export const graduatedMembersOption = ({ ...params }: MembersOptionParams = {}) =>
  queryOptions({
    queryKey: qk.for('members', 'graduated', params),
    queryFn: () => getGraduatedMembers(params),
  });

export const completedMembersOption = ({ ...params }: MembersOptionParams = {}) =>
  queryOptions({
    queryKey: qk.for('members', 'completed', params),
    queryFn: () => getCompletedMembers(params),
  });

export const withdrawnMembersOption = ({ ...params }: MembersOptionParams = {}) =>
  queryOptions({
    queryKey: qk.for('members', 'withdrawn', params),
    queryFn: () => getWithdrawnMembers(params),
  });
