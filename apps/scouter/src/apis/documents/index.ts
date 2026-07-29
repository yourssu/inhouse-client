import type { UpdateApplicantDocumentEvaluationRequestType } from '@/apis/documents/schema';

import { api } from '@/apis/api';
import {
  ApplicantDocumentEvaluationsResponseSchema,
  ApplicantDocumentOthersEvaluationsSchema,
  CommentSchema,
  type CreateCommentRequestType,
  PartDocumentsRubricsSchema,
  type UpdateCommentRequestType,
  type UpdatePartDocumentRubricsRequestType,
} from '@/apis/documents/schema';

export type PutApplicantDocumentEvaluationsParams = {
  applicantId: number;
  data: UpdateApplicantDocumentEvaluationRequestType;
};

export const getApplicantDocumentsEvaluations = async (applicantId: number) => {
  const res = await api.get(`/applicants/${applicantId}/documents/evaluations`).json();

  return ApplicantDocumentEvaluationsResponseSchema.parse(res);
};

export const getApplicantDocumentsOthersEvaluations = async (applicantId: number) => {
  const res = await api.get(`applicants/${applicantId}/documents/evaluations/others`).json();

  return ApplicantDocumentOthersEvaluationsSchema.parse(res);
};

export const putApplicantDocumentEvaluations = async ({
  applicantId,
  data,
}: PutApplicantDocumentEvaluationsParams) => {
  await api.put(`/applicants/${applicantId}/documents/evaluations`, { json: data });
};

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

export type CreateCommentParams = {
  applicantId: number;
  data: CreateCommentRequestType;
};

export const postApplicantDocumentComment = async ({ applicantId, data }: CreateCommentParams) => {
  await api.post(`applicants/${applicantId}/documents/comments`, { json: data });
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

export type UpdateCommentParams = {
  applicantId: number;
  commentId: number;
  data: UpdateCommentRequestType;
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

export const getPartDocumentsRubrics = async (partId: number) => {
  const res = await api.get(`parts/${partId}/documents/rubrics`).json();
  return PartDocumentsRubricsSchema.parse(res);
};

type PutPartDocumentRubricsParams = {
  data: UpdatePartDocumentRubricsRequestType;
  partId: number;
};

export const putPartDocumentsRubrics = async ({ partId, data }: PutPartDocumentRubricsParams) => {
  await api.put(`parts/${partId}/documents/rubrics`, { json: data });
};
