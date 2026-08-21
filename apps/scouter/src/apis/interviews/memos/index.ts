import { api } from '@/apis/api';
import {
  CreateInterviewMemoRequestSchema,
  type CreateInterviewMemoRequestType,
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

export type DeleteInterviewMemoParams = {
  applicantId: number;
  commentId: number;
};

export const deleteApplicantInterviewMemo = async ({
  applicantId,
  commentId,
}: DeleteInterviewMemoParams) => {
  await api.delete(`applicants/${applicantId}/interviews/memos/${commentId}`);
};
