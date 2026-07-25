import { api } from '@/apis/api';
import { CommentSchema, type CreateCommentRequestType } from '@/apis/eval/comments/schema';

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

// TODO(SCO-141): 코멘트 삭제 API

// TODO(SCO-142): 코멘트 수정 API

export type CreateCommentParams = {
  applicantId: number;
  data: CreateCommentRequestType;
};

export const postApplicantDocumentComment = async ({ applicantId, data }: CreateCommentParams) => {
  await api.post(`applicants/${applicantId}/documents/comments`, { json: data });
};
