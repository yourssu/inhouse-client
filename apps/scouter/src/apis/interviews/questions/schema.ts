import { z } from 'zod/v4';

export const QuestionCategorySchema = z.enum(['GLOBAL', 'CULTURE', 'PART', 'PERSONAL']);

export const QuestionRequirementSchema = z.object({
  id: z.number(),
  content: z.string(),
});

export const AssignedQuestionSchema = z.object({
  id: z.number().optional(),
  assignedInterviewerUserId: z.number().optional(),
  sourceQuestionId: z.number().optional(),
  content: z.string(),
  category: QuestionCategorySchema,
  isSelected: z.boolean().optional(),
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

export const SaveAssignedQuestionRequestSchema = z.object({
  assignedInterviewerUserId: z.number(),
  sourceQuestionId: z.number().optional(),
  content: z.string().optional(),
  category: QuestionCategorySchema,
  isSelected: z.boolean().optional(),
  requirementIds: z.array(z.number()),
});

export const SaveAssignedQuestionsRequestSchema = z
  .object({
    questions: z.array(SaveAssignedQuestionRequestSchema),
  })
  .superRefine(({ questions }, context) => {
    const globalQuestions = questions.filter(({ category }) => category === 'GLOBAL');
    const cultureQuestions = questions.filter(({ category }) => category === 'CULTURE');

    if (globalQuestions.length !== 4) {
      context.addIssue({
        code: 'custom',
        message: '필수 질문 4개를 모두 포함해야 합니다.',
        path: ['questions'],
      });
    }

    if (cultureQuestions.filter(({ isSelected }) => isSelected).length < 2) {
      context.addIssue({
        code: 'custom',
        message: '컬처핏 질문을 2개 이상 선택해야 합니다.',
        path: ['questions'],
      });
    }

    questions.forEach((question, index) => {
      const path = ['questions', index];

      if (question.category === 'GLOBAL') {
        if (question.sourceQuestionId === undefined) {
          context.addIssue({
            code: 'custom',
            message: '필수 질문에는 원본 질문 ID가 필요합니다.',
            path: [...path, 'sourceQuestionId'],
          });
        }
        if (question.isSelected !== undefined) {
          context.addIssue({
            code: 'custom',
            message: '필수 질문은 선택 상태를 사용하지 않습니다.',
            path: [...path, 'isSelected'],
          });
        }
        return;
      }

      if (question.category === 'CULTURE') {
        if (question.sourceQuestionId === undefined) {
          context.addIssue({
            code: 'custom',
            message: '컬처핏 질문에는 원본 질문 ID가 필요합니다.',
            path: [...path, 'sourceQuestionId'],
          });
        }
        if (question.isSelected === undefined) {
          context.addIssue({
            code: 'custom',
            message: '컬처핏 질문에는 선택 상태가 필요합니다.',
            path: [...path, 'isSelected'],
          });
        }
        return;
      }

      if (question.sourceQuestionId !== undefined) {
        context.addIssue({
          code: 'custom',
          message: '작성 질문은 원본 질문 ID를 사용하지 않습니다.',
          path: [...path, 'sourceQuestionId'],
        });
      }
      if (question.content === undefined || question.content.trim().length === 0) {
        context.addIssue({
          code: 'custom',
          message: '작성 질문에는 내용이 필요합니다.',
          path: [...path, 'content'],
        });
      }
      if (question.requirementIds.length === 0) {
        context.addIssue({
          code: 'custom',
          message: '작성 질문에는 요구조건을 1개 이상 연결해야 합니다.',
          path: [...path, 'requirementIds'],
        });
      }
      if (question.isSelected !== undefined) {
        context.addIssue({
          code: 'custom',
          message: '작성 질문은 선택 상태를 사용하지 않습니다.',
          path: [...path, 'isSelected'],
        });
      }
    });
  });

export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;
export type QuestionRequirement = z.infer<typeof QuestionRequirementSchema>;
export type AssignedQuestion = z.infer<typeof AssignedQuestionSchema>;
export type AssignedQuestions = z.infer<typeof AssignedQuestionsSchema>;
export type PartQuestionCategory = z.infer<typeof PartQuestionCategorySchema>;
export type PartInterviewQuestion = z.infer<typeof PartInterviewQuestionSchema>;
export type SaveAssignedQuestionRequest = z.infer<typeof SaveAssignedQuestionRequestSchema>;
export type SaveAssignedQuestionsRequest = z.infer<typeof SaveAssignedQuestionsRequestSchema>;
