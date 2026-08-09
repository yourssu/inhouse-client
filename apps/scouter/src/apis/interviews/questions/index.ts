import { api } from '@/apis/api';
import {
  AssignedQuestionsSchema,
  PartInterviewQuestionsSchema,
  type SaveAssignedQuestionsRequest,
  SaveAssignedQuestionsRequestSchema,
} from '@/apis/interviews/questions/schema';

export type SaveAssignedQuestionsParams = {
  applicantId: number;
  data: SaveAssignedQuestionsRequest;
};

export const getAssignedQuestions = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/questions`).json();
  return AssignedQuestionsSchema.parse(response);
};

export const getPartInterviewQuestions = async (partId: number) => {
  const response = await api.get(`parts/${partId}/interviews/questions`).json();
  return PartInterviewQuestionsSchema.parse(response);
};

export const saveAssignedQuestions = async ({ applicantId, data }: SaveAssignedQuestionsParams) => {
  const request = SaveAssignedQuestionsRequestSchema.parse(data);
  const response = await api
    .put(`applicants/${applicantId}/interviews/questions`, { json: request })
    .json();
  return AssignedQuestionsSchema.parse(response);
};
