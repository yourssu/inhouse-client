import { api } from '@/apis/api';
import {
  type GlobalInterviewRequirementsParams,
  GlobalInterviewRequirementsParamsSchema,
  type InterviewRequirementsParams,
  InterviewRequirementsParamsSchema,
  InterviewRequirementsSchema,
} from '@/apis/interviews/requirements/schema';

export const getInterviewRequirements = async (params: InterviewRequirementsParams) => {
  const { partId, semester } = InterviewRequirementsParamsSchema.parse(params);
  const response = await api
    .get(`parts/${partId}/interviews/requirements`, { searchParams: { semester } })
    .json();
  return InterviewRequirementsSchema.parse(response);
};

export const getGlobalInterviewRequirements = async (params: GlobalInterviewRequirementsParams) => {
  const { semester } = GlobalInterviewRequirementsParamsSchema.parse(params);
  const response = await api
    .get('interviews/requirements/global', { searchParams: { semester } })
    .json();
  return InterviewRequirementsSchema.parse(response);
};
