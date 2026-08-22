import { z } from 'zod/v4';

export const QuestionCategorySchema = z.enum(['INTRO', 'OUTRO', 'CULTURE', 'PART', 'PERSONAL']);

export const QuestionRequirementSchema = z.object({
  id: z.number(),
  content: z.string(),
});

export const AssignedQuestionSchema = z.object({
  id: z.number().nullish(),
  assignedMemberId: z.number().nullish(),
  assignedMemberName: z.string().nullish(),
  sourceQuestionId: z.number().nullish(),
  content: z.string(),
  category: QuestionCategorySchema,
  isSelected: z.boolean().nullish(),
  requirements: z.array(QuestionRequirementSchema),
});

export const AssignedQuestionsSchema = z.object({
  questions: z.array(AssignedQuestionSchema),
});

export const PartQuestionCategorySchema = QuestionCategorySchema.exclude(['PERSONAL']);

export const PartInterviewQuestionSchema = z.object({
  id: z.number(),
  partId: z.number().optional(),
  category: PartQuestionCategorySchema,
  content: z.string(),
  requirements: z.array(QuestionRequirementSchema),
  sortOrder: z.number(),
});

export const PartInterviewQuestionsSchema = z.array(PartInterviewQuestionSchema);

export const PartInterviewQuestionsParamsSchema = z.object({
  partId: z.number(),
  semester: z.string().regex(/^\d{4}-[12]$/),
});

// 모든 카테고리의 질문에 질문자 배정이 필요해요.
export const SaveAssignedQuestionRequestSchema = z.object({
  assignedMemberId: z.number(),
  category: QuestionCategorySchema,
  sourceQuestionId: z.number().optional(),
  content: z.string().optional(),
  isSelected: z.boolean().optional(),
  requirementIds: z.array(z.number()).nullish(),
});

export const SaveAssignedQuestionsRequestSchema = z.object({
  questions: z.array(SaveAssignedQuestionRequestSchema),
});

export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;
export type QuestionRequirement = z.infer<typeof QuestionRequirementSchema>;
export type AssignedQuestion = z.infer<typeof AssignedQuestionSchema>;
export type AssignedQuestions = z.infer<typeof AssignedQuestionsSchema>;
export type PartQuestionCategory = z.infer<typeof PartQuestionCategorySchema>;
export type PartInterviewQuestion = z.infer<typeof PartInterviewQuestionSchema>;
export type PartInterviewQuestionsParams = z.infer<typeof PartInterviewQuestionsParamsSchema>;
export type SaveAssignedQuestionRequest = z.infer<typeof SaveAssignedQuestionRequestSchema>;
export type SaveAssignedQuestionsRequest = z.infer<typeof SaveAssignedQuestionsRequestSchema>;
