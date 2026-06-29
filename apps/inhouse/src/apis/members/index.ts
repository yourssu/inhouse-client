import { isNil, omitBy } from 'es-toolkit';

import { api } from '@/apis/api';
import {
  type Member,
  memberSchema,
  type MemberState,
  type PaginatedMembers,
  paginatedMembersSchema,
  type PartList,
  partListSchema,
  type PartName,
  type Semester,
  type SemesterList,
  semesterListSchema,
  semesterSchema,
} from '@/apis/members/schema';

export type GetMembersParams = {
  page?: number;
  pageSize?: number;
  part?: PartName;
  query?: string;
  status?: MemberState;
};

export const getParts = async (): Promise<PartList> => {
  const response = await api.get('parts').json();
  return partListSchema.parse(response);
};

export const getSemesters = async (): Promise<SemesterList> => {
  const response = await api.get('semesters').json();
  return semesterListSchema.parse(response);
};

export const getCurrentSemester = async (): Promise<Semester> => {
  const response = await api.get('semesters/current').json();
  return semesterSchema.parse(response);
};

export const getMembers = async (params?: GetMembersParams): Promise<PaginatedMembers> => {
  const cleanedParams = params ? omitBy(params, (v) => isNil(v) || v === '') : undefined;
  const response = await api.get('members', { searchParams: cleanedParams }).json();
  return paginatedMembersSchema.parse(response);
};

export const getMember = async (memberId: number): Promise<Member> => {
  const response = await api.get(`members/${memberId}`).json();
  return memberSchema.parse(response);
};
