import { isNil, omitBy } from 'es-toolkit';

import { api } from '@/apis/api';
import {
  ActiveMemberSchema,
  CompletedMemberSchema,
  GraduatedMemberSchema,
  InactiveMemberSchema,
  LastMemberSyncTimeSchema,
  MemberIncludeFromApplicantsResponseSchema,
  MemberListResponseSchema,
  MemberRoleSchema,
  MemberStateSchema,
  MeSchema,
  type UpdateActiveMemberRequest,
  UpdateActiveMemberRequestSchema,
  type UpdateCompletedMemberRequest,
  UpdateCompletedMemberRequestSchema,
  type UpdateGraduatedMemberRequest,
  UpdateGraduatedMemberRequestSchema,
  type UpdateInactiveMemberRequest,
  UpdateInactiveMemberRequestSchema,
  type UpdateWithdrawnMemberRequest,
  UpdateWithdrawnMemberRequestSchema,
  WithdrawnMemberSchema,
} from '@/apis/members/schema';

export type GetMembersParams = {
  partId?: number;
  search?: string;
};

export type PatchMemberParams =
  | { data: UpdateActiveMemberRequest; memberId: number; prevState: 'active' }
  | { data: UpdateCompletedMemberRequest; memberId: number; prevState: 'completed' }
  | { data: UpdateGraduatedMemberRequest; memberId: number; prevState: 'graduated' }
  | { data: UpdateInactiveMemberRequest; memberId: number; prevState: 'inactive' }
  | { data: UpdateWithdrawnMemberRequest; memberId: number; prevState: 'withdrawn' };

const updateMemberRequestSchemas = {
  active: UpdateActiveMemberRequestSchema,
  completed: UpdateCompletedMemberRequestSchema,
  graduated: UpdateGraduatedMemberRequestSchema,
  inactive: UpdateInactiveMemberRequestSchema,
  withdrawn: UpdateWithdrawnMemberRequestSchema,
};

export const getMe = async () => {
  const response = await api.get('members/me').json();
  return MeSchema.parse(response);
};

export const getActiveMembers = async (params: GetMembersParams = {}) => {
  const response = await api
    .get('members/active', {
      searchParams: omitBy(params, isNil),
    })
    .json();
  return MemberListResponseSchema(ActiveMemberSchema).parse(response);
};

export const getInactiveMembers = async (params: GetMembersParams = {}) => {
  const response = await api
    .get('members/inactive', {
      searchParams: omitBy(params, isNil),
    })
    .json();
  return MemberListResponseSchema(InactiveMemberSchema).parse(response);
};

export const getGraduatedMembers = async (params: GetMembersParams = {}) => {
  const response = await api
    .get('members/graduated', {
      searchParams: omitBy(params, isNil),
    })
    .json();
  return MemberListResponseSchema(GraduatedMemberSchema).parse(response);
};

export const getCompletedMembers = async (params: GetMembersParams = {}) => {
  const response = await api
    .get('members/completed', {
      searchParams: omitBy(params, isNil),
    })
    .json();
  return MemberListResponseSchema(CompletedMemberSchema).parse(response);
};

export const getWithdrawnMembers = async (params: GetMembersParams = {}) => {
  const response = await api
    .get('members/withdrawn', {
      searchParams: omitBy(params, isNil),
    })
    .json();
  return MemberListResponseSchema(WithdrawnMemberSchema).parse(response);
};

export const getMemberStates = async () => {
  const response = await api.get('members/states').json();
  return MemberStateSchema.array().parse(response);
};

export const getMemberRoles = async () => {
  const response = await api.get('members/roles').json();
  return MemberRoleSchema.array().parse(response);
};

export const getLastMemberSyncTime = async () => {
  const response = await api.get('members/lastUpdatedTime').json();
  return LastMemberSyncTimeSchema.parse(response);
};

export const patchMember = async ({ memberId, data, prevState }: PatchMemberParams) => {
  const request = updateMemberRequestSchemas[prevState].parse(data);
  await api.patch(`members/${prevState}/${memberId}`, { json: request });
};

export const postMembersIncludeFromApplicants = async () => {
  const response = await api.post('members/include-from-applicants').json();
  return MemberIncludeFromApplicantsResponseSchema.parse(response);
};
