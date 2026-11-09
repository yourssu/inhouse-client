import { api } from '@/apis/api';
import {
  CreateInterviewMemoRequestSchema,
  type CreateInterviewMemoRequestType,
  DeleteInterviewMemoParamsSchema,
  type DeleteInterviewMemoParamsType,
  InterviewMemosSchema,
} from '@/apis/interviews/memos/schema';

export const getApplicantInterviewMemos = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/memos`).json();
  return InterviewMemosSchema.parse(response);
};

export type CreateInterviewMemoParams = {
  applicantId: number;
  data: CreateInterviewMemoRequestType;
};

export const postApplicantInterviewMemo = async ({
  applicantId,
  data,
}: CreateInterviewMemoParams) => {
  const request = CreateInterviewMemoRequestSchema.parse(data);
  await api.post(`applicants/${applicantId}/interviews/memos`, { json: request });
};

export type DeleteInterviewMemoParams = DeleteInterviewMemoParamsType;

export const deleteApplicantInterviewMemo = async (params: DeleteInterviewMemoParams) => {
  const { applicantId, commentId } = DeleteInterviewMemoParamsSchema.parse(params);
  await api.delete(`applicants/${applicantId}/interviews/memos/${commentId}`);
};
