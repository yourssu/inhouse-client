import { api } from '@/apis/api';
import {
  ApplicantDocumentAnswersSchema,
  ApplicantSchema,
  type ApplicantStateType,
  ApplicantSyncResponseSchema,
  type CreateApplicantRequestType,
  LastApplicantSyncTimeSchema,
  type UpdateApplicantRequestType,
} from '@/apis/applicants/schema';

export type GetApplicantsParams = {
  name?: string;
  partId?: number;
  semesterId?: number;
  states?: readonly ApplicantStateType[];
};

export type PatchApplicantParams = {
  applicantId: number;
  data: UpdateApplicantRequestType;
};

const createApplicantsSearchParams = ({
  name,
  partId,
  semesterId,
  states,
}: GetApplicantsParams) => {
  const searchParams = new URLSearchParams();

  if (name !== undefined) {
    searchParams.set('name', name);
  }
  states?.forEach((state) => searchParams.append('states', state));
  if (semesterId !== undefined) {
    searchParams.set('semesterId', String(semesterId));
  }
  if (partId !== undefined) {
    searchParams.set('partId', String(partId));
  }

  return searchParams;
};

export const getApplicants = async (params: GetApplicantsParams = {}) => {
  const response = await api
    .get('applicants', {
      searchParams: createApplicantsSearchParams(params),
    })
    .json();
  return ApplicantSchema.array().parse(response);
};

export const getApplicantById = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}`).json();
  return ApplicantSchema.parse(response);
};

export const getApplicantsLastUpdatedTime = async () => {
  const response = await api.get('applicants/lastUpdatedTime').json();
  return LastApplicantSyncTimeSchema.parse(response);
};

export const getApplicantDocumentAnswers = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/answers`).json();
  return ApplicantDocumentAnswersSchema.parse(response);
};

export const postApplicant = async (data: CreateApplicantRequestType) => {
  await api.post('applicants', { json: data });
};

export const postApplicantsIncludeFromForms = async () => {
  const response = await api.post('applicants/include-from-forms').json();
  return ApplicantSyncResponseSchema.parse(response);
};

export const postApplicantsIncludeFromFormsBySemester = async (semesterId: number) => {
  const response = await api.post(`applicants/include-from-forms/semesters/${semesterId}`).json();
  return ApplicantSyncResponseSchema.parse(response);
};

export const patchApplicant = async ({ applicantId, data }: PatchApplicantParams) => {
  await api.patch(`applicants/${applicantId}`, { json: data });
};

export const deleteApplicant = async (applicantId: number) => {
  await api.delete(`applicants/${applicantId}`);
};
