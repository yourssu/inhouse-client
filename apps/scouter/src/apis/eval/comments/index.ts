import { api } from '@/apis/api';
import { CommentSchema } from '@/apis/eval/comments/schema';

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

export type DeleteCommentParams = {
  applicantId: number;
  commentId: number;
};

export const deleteApplicantDocumentComment = async ({
  applicantId,
  commentId,
}: DeleteCommentParams) => {
  await api.delete(`applicants/${applicantId}/documents/comments/${commentId}`);
};

// TODO(SCO-142): 코멘트 수정 API

// TODO(SCO-143): 코멘트 생성 API
