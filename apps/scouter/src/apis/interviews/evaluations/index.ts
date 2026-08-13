import { api } from '@/apis/api';
import {
  InterviewEvaluatorStatusesSchema,
  MyInterviewEvaluationSchema,
  OtherInterviewEvaluationsSchema,
} from '@/apis/interviews/evaluations/schema';

export const getMyInterviewEvaluation = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/evaluations`).json();
  return MyInterviewEvaluationSchema.parse(response);
};

export const getInterviewEvaluatorStatuses = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/evaluations/status`).json();
  return InterviewEvaluatorStatusesSchema.parse(response);
};

export const getOtherInterviewEvaluations = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/evaluations/others`).json();
  return OtherInterviewEvaluationsSchema.parse(response);
};
