import { api } from '@/apis/api';
import {
  type GlobalInterviewRequirementsParams,
  GlobalInterviewRequirementsParamsSchema,
  type InterviewRequirements,
  type InterviewRequirementsParams,
  InterviewRequirementsParamsSchema,
  InterviewRequirementsSchema,
} from '@/apis/interviews/requirements/schema';

export type UpdateInterviewRequirementsParams = InterviewRequirementsParams & {
  data: InterviewRequirements;
};

export type UpdateGlobalInterviewRequirementsParams = GlobalInterviewRequirementsParams & {
  data: InterviewRequirements;
};

export const getInterviewRequirements = async (params: InterviewRequirementsParams) => {
  const { partId, semester } = InterviewRequirementsParamsSchema.parse(params);
  const response = await api
    .get(`parts/${partId}/interviews/requirements`, { searchParams: { semester } })
    .json();
  return InterviewRequirementsSchema.parse(response);
};

export const updateInterviewRequirements = async ({
  data,
  partId,
  semester,
}: UpdateInterviewRequirementsParams) => {
  const params = InterviewRequirementsParamsSchema.parse({ partId, semester });
  const request = InterviewRequirementsSchema.parse(data);
  await api.put(`parts/${params.partId}/interviews/requirements`, {
    json: request,
    searchParams: { semester: params.semester },
  });
};

export const getGlobalInterviewRequirements = async (params: GlobalInterviewRequirementsParams) => {
  const { semester } = GlobalInterviewRequirementsParamsSchema.parse(params);
  const response = await api
    .get('interviews/requirements/global', { searchParams: { semester } })
    .json();
  return InterviewRequirementsSchema.parse(response);
};

export const updateGlobalInterviewRequirements = async ({
  data,
  semester,
}: UpdateGlobalInterviewRequirementsParams) => {
  const params = GlobalInterviewRequirementsParamsSchema.parse({ semester });
  const request = InterviewRequirementsSchema.parse(data);
  await api.put('interviews/requirements/global', {
    json: request,
    searchParams: { semester: params.semester },
  });
};
