import { api } from '@/apis/api';
import {
  type InterviewRubricParams,
  InterviewRubricParamsSchema,
  InterviewRubricSchema,
  type UpdateInterviewRubricRequest,
  UpdateInterviewRubricRequestSchema,
} from '@/apis/interviews/rubrics/schema';

export type UpdateInterviewRubricParams = InterviewRubricParams & {
  data: UpdateInterviewRubricRequest;
};

export const getInterviewRubric = async (params: InterviewRubricParams) => {
  const { partId, semester } = InterviewRubricParamsSchema.parse(params);
  const response = await api.get(`parts/${partId}/interviews/rubrics/${semester}`).json();
  return InterviewRubricSchema.parse(response);
};

export const updateInterviewRubric = async ({
  data,
  partId,
  semester,
}: UpdateInterviewRubricParams) => {
  const params = InterviewRubricParamsSchema.parse({ partId, semester });
  const request = UpdateInterviewRubricRequestSchema.parse(data);
  await api.put(`parts/${params.partId}/interviews/rubrics/${params.semester}`, { json: request });
};
