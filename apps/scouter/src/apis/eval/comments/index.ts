import { api } from '@/apis/api';
import { CommentSchema } from '@/apis/eval/comments/schema';

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};
