import z from 'zod/v4';

import { PartNameSchema } from '@/apis/parts/schema';

const documentResults = ['PENDING', 'DOCUMENT_PASS', 'DOCUMENT_FAIL'] as const;
const DocumentResultSchema = z.enum(documentResults);
export const ApplicantDocumentOthersEvaluationsSchema = z.array(
  z.object({
    evaluatorId: z.number(),
    evaluatorName: z.string(),
    totalScore: z.number(),
    result: DocumentResultSchema,
    overallComment: z.string(),
    items: z.array(
      z.object({
        sectionId: z.number(),
        score: z.number(),
        memo: z.string(),
      }),
    ),
  }),
);

export const ApplicantDocumentEvaluationsResponseSchema = z.object({
  totalScore: z.number(),
  items: z.array(
    z.object({
      sectionId: z.number(),
      question: z.string(),
      maxScore: z.number(),
      score: z.number(),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: DocumentResultSchema,
  submittedAt: z.iso.datetime().nullable(),
});

export const documentKoreanResults = ['보류', '서류 합격', '서류 불합격'] as const;
const DocumentKoreanResultSchema = z.enum(documentKoreanResults);
export const UpdateApplicantDocumentEvaluationFormSchema = z.object({
  items: z.array(
    z.object({
      sectionId: z.number(),
      score: z.string().min(1).regex(/^\d+$/).transform(Number),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: DocumentKoreanResultSchema,
});

export const UpdateApplicantDocumentEvaluationRequestSchema = z.object({
  items: z.array(
    z.object({
      sectionId: z.number(),
      score: z.number(),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: DocumentResultSchema,
  submit: z.boolean(),
});

export type ApplicantDocumentEvaluationsResponseType = z.infer<
  typeof ApplicantDocumentEvaluationsResponseSchema
>;
export type ApplicantDocumentOthersEvaluationsType = z.infer<
  typeof ApplicantDocumentOthersEvaluationsSchema
>;
export type UpdateApplicantDocumentEvaluationFormType = z.infer<
  typeof UpdateApplicantDocumentEvaluationFormSchema
>;
export type UpdateApplicantDocumentEvaluationRequestType = z.infer<
  typeof UpdateApplicantDocumentEvaluationRequestSchema
>;

export const CommentAuthorSchema = z.object({
  memberId: z.number(),
  nickname: z.string(),
  part: PartNameSchema,
});

export const CommentSchema = z.object({
  author: CommentAuthorSchema,
  commentId: z.number(),
  content: z.string(),
  createdAt: z.iso.datetime(),
  isEdited: z.boolean(),
  parentCommentId: z.number().nullable(),
  sectionId: z.number(),
});

export const CreateCommentRequestSchema = z.object({
  content: z.string(),
  parentCommentId: z.number().nullable().optional(),
  sectionId: z.number(),
});

export const UpdateCommentRequestSchema = z.object({
  content: z.string(),
});

export type CommentAuthorType = z.infer<typeof CommentAuthorSchema>;
export type CommentType = z.infer<typeof CommentSchema>;
export type CreateCommentRequestType = z.infer<typeof CreateCommentRequestSchema>;
export type UpdateCommentRequestType = z.infer<typeof UpdateCommentRequestSchema>;

export const PartDocumentRubricSchema = z.object({
  sectionId: z.number(),
  question: z.string(),
  maxScore: z.number(),
  criterionDetail: z.string(),
});
export const PartDocumentsRubricsSchema = z.array(PartDocumentRubricSchema);

export const UpdatePartDocumentsRubricsFormSchema = z.object({
  rubrics: z.array(
    z.object({
      sectionId: z.number(),
      maxScore: z.string().min(1).regex(/^\d+$/).transform(Number),
      criterionDetail: z.string(),
    }),
  ),
});

export const UpdatePartDocumentsRubricsRequestSchema = z.array(
  z.object({
    sectionId: z.number(),
    maxScore: z.number(),
    criterionDetail: z.string(),
  }),
);

export type PartDocumentRubricsType = z.infer<typeof PartDocumentsRubricsSchema>;
export type UpdatePartDocumentsRubricsFormType = z.infer<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
export type UpdatePartDocumentRubricsRequestType = z.infer<
  typeof UpdatePartDocumentsRubricsRequestSchema
>;
export type PartDocumentRubricType = z.infer<typeof PartDocumentRubricSchema>;
