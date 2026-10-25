import { api } from '@/apis/api';
import {
  CreateInterviewCommentRequest,
  DeleteById3Params,
  QuestionInterviewCommentsResponse,
} from '@/apis/interviews/memos/generated/schema.gen';

export const getApplicantInterviewMemos = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/interviews/memos`).json();
  return QuestionInterviewCommentsResponse.array().parse(response);
};

export type CreateInterviewMemoParams = {
  applicantId: number;
  data: CreateInterviewCommentRequest;
};

export const postApplicantInterviewMemo = async ({
  applicantId,
  data,
}: CreateInterviewMemoParams) => {
  const request = CreateInterviewCommentRequest.parse(data);
  await api.post(`applicants/${applicantId}/interviews/memos`, { json: request });
};

export type DeleteInterviewMemoParams = DeleteById3Params;

export const deleteApplicantInterviewMemo = async (params: DeleteInterviewMemoParams) => {
  const { applicantId, commentId } = DeleteById3Params.parse(params);
  await api.delete(`applicants/${applicantId}/interviews/memos/${commentId}`);
};
