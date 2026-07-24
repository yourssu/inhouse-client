import { api } from '@/apis/api';
import { CommentSchema, type UpdateCommentRequestType } from '@/apis/eval/comments/schema';

export type DeleteCommentParams = {
  applicantId: number;
  commentId: number;
};

export type UpdateCommentParams = {
  applicantId: number;
  commentId: number;
  data: UpdateCommentRequestType;
};

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

export const patchApplicantDocumentComment = async ({
  applicantId,
  commentId,
  data,
}: UpdateCommentParams) => {
  const response = await api
    .patch(`applicants/${applicantId}/documents/comments/${commentId}`, { json: data })
    .json();
  return CommentSchema.parse(response);
};

export const deleteApplicantDocumentComment = async ({
  applicantId,
  commentId,
}: DeleteCommentParams) => {
  await api.delete(`applicants/${applicantId}/documents/comments/${commentId}`);
};
