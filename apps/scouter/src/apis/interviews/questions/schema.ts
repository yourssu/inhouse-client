import { z } from 'zod/v4';

export const QuestionCategorySchema = z.enum(['GLOBAL', 'CULTURE', 'PART', 'PERSONAL']);

export const QuestionRequirementSchema = z.object({
  id: z.number(),
  content: z.string(),
});

export const AssignedQuestionSchema = z.object({
  id: z.number().nullish(),
  assignedInterviewerUserId: z.number().nullish(),
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
  sortOrder: z.number(),
});

export const PartInterviewQuestionsSchema = z.array(PartInterviewQuestionSchema);

const SaveAssignedQuestionRequestBaseSchema = z.object({
  sourceQuestionId: z.number().optional(),
  content: z.string().optional(),
  isSelected: z.boolean().optional(),
  requirementIds: z.array(z.number()),
});

const SaveCultureQuestionRequestSchema = SaveAssignedQuestionRequestBaseSchema.extend({
  assignedInterviewerUserId: z.number().optional(),
  category: z.literal('CULTURE'),
});

const SaveInterviewerRequiredQuestionRequestSchema = SaveAssignedQuestionRequestBaseSchema.extend({
  assignedInterviewerUserId: z.number(),
  category: QuestionCategorySchema.exclude(['CULTURE']),
});

export const SaveAssignedQuestionRequestSchema = z.union([
  SaveCultureQuestionRequestSchema,
  SaveInterviewerRequiredQuestionRequestSchema,
]);

export const SaveAssignedQuestionsRequestSchema = z.object({
  questions: z.array(SaveAssignedQuestionRequestSchema),
});

export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;
export type QuestionRequirement = z.infer<typeof QuestionRequirementSchema>;
export type AssignedQuestion = z.infer<typeof AssignedQuestionSchema>;
export type AssignedQuestions = z.infer<typeof AssignedQuestionsSchema>;
export type PartQuestionCategory = z.infer<typeof PartQuestionCategorySchema>;
export type PartInterviewQuestion = z.infer<typeof PartInterviewQuestionSchema>;
export type SaveAssignedQuestionRequest = z.infer<typeof SaveAssignedQuestionRequestSchema>;
export type SaveAssignedQuestionsRequest = z.infer<typeof SaveAssignedQuestionsRequestSchema>;
