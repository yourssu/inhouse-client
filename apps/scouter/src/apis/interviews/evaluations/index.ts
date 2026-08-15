import { api } from '@/apis/api';
import { InterviewEvaluatorStatusesSchema } from '@/apis/interviews/evaluations/schema';

export const getInterviewEvaluatorStatuses = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/evaluations/status`).json();
  return InterviewEvaluatorStatusesSchema.parse(response);
};
